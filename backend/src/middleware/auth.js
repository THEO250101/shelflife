import crypto from 'node:crypto';
import { Strategy as LocalStrategy } from 'passport-local';
import { collection, serializeDoc, toObjectId } from '../db/mongo.js';

const KEY_LENGTH = 64;
const ITERATIONS = 120000;
const DIGEST = 'sha512';

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
  return { salt, hash };
}

export function verifyPassword(password, user) {
  const candidate = hashPassword(password, user.salt).hash;
  return crypto.timingSafeEqual(
    Buffer.from(candidate, 'hex'),
    Buffer.from(user.passwordHash, 'hex')
  );
}

export function publicUser(user) {
  if (!user) {
    return null;
  }
  return {
    _id: user._id.toString(),
    username: user.username,
    displayName: user.displayName,
  };
}

export function configurePassport(passport) {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await collection('users').findOne({ username: username.trim().toLowerCase() });
        if (!user || !verifyPassword(password, user)) {
          return done(null, false, { message: 'Invalid username or password' });
        }
        return done(null, serializeDoc(user));
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await collection('users').findOne({ _id: toObjectId(id) });
      done(null, serializeDoc(user));
    } catch (err) {
      done(err);
    }
  });
}

export function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated?.()) {
    next();
    return;
  }
  res.status(401).json({ error: 'Please log in to use ShelfLife.' });
}

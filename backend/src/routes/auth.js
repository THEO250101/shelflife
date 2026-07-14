import express from 'express';
import passport from 'passport';
import { collection } from '../db/mongo.js';
import { hashPassword, publicUser } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.post('/register', async (req, res, next) => {
  try {
    const username = String(req.body.username || '')
      .trim()
      .toLowerCase();
    const displayName = String(req.body.displayName || '').trim() || username;
    const password = String(req.body.password || '');

    if (username.length < 3 || password.length < 6) {
      res.status(400).json({ error: 'Username must be 3+ chars and password must be 6+ chars.' });
      return;
    }

    const { salt, hash } = hashPassword(password);
    const result = await collection('users').insertOne({
      username,
      displayName,
      salt,
      passwordHash: hash,
      createdAt: new Date(),
    });

    const user = { _id: result.insertedId.toString(), username, displayName };
    req.login(user, (err) => {
      if (err) {
        next(err);
        return;
      }
      res.status(201).json({ user });
    });
  } catch (err) {
    if (err.code === 11000) {
      res.status(409).json({ error: 'That username is already taken.' });
      return;
    }
    next(err);
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      next(err);
      return;
    }
    if (!user) {
      res.status(401).json({ error: info?.message || 'Invalid username or password' });
      return;
    }
    req.login(user, (loginErr) => {
      if (loginErr) {
        next(loginErr);
        return;
      }
      res.json({ user: publicUser(user) });
    });
  })(req, res, next);
});

router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err);
      return;
    }
    res.json({ ok: true });
  });
});

export default router;

import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDb, collection } from './src/db/mongo.js';
import { configurePassport, ensureAuthenticated } from './src/middleware/auth.js';
import { seed } from './src/seed/seed.js';
import authRoutes from './src/routes/auth.js';
import pantryRoutes from './src/routes/pantryItems.js';
import recipeRoutes from './src/routes/recipes.js';
import mealPlanRoutes from './src/routes/mealPlans.js';
import shoppingListRoutes from './src/routes/shoppingListItems.js';
import rescueLogRoutes from './src/routes/rescueLogs.js';
import statsRoutes from './src/routes/stats.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const sessionSecret =
  process.env.SESSION_SECRET || (!isProduction ? 'dev-only-shelflife-secret' : '');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (isProduction && !sessionSecret) {
  throw new Error('SESSION_SECRET is required when NODE_ENV=production.');
}

if (isProduction) {
  app.set('trust proxy', 1);
}

await connectDb();

// Auto-seed if database has no users
try {
  const usersCount = await collection('users').countDocuments();
  if (usersCount === 0) {
    console.log('No users found in database. Running auto-seed...');
    await seed(false);
    console.log('Auto-seed completed successfully.');
  } else {
    console.log(`Database already seeded (${usersCount} users found).`);
  }
} catch (seedErr) {
  console.error('Failed to run auto-seed:', seedErr);
}

configurePassport(passport);

app.use(express.json({ limit: '1mb' }));
app.use(
  session({
    name: 'shelflife.sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, name: 'ShelfLife API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/pantry-items', ensureAuthenticated, pantryRoutes);
app.use('/api/recipes', ensureAuthenticated, recipeRoutes);
app.use('/api/meal-plans', ensureAuthenticated, mealPlanRoutes);
app.use('/api/shopping-list-items', ensureAuthenticated, shoppingListRoutes);
app.use('/api/rescue-logs', ensureAuthenticated, rescueLogRoutes);
app.use('/api/stats', ensureAuthenticated, statsRoutes);

const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('*', (_req, res, next) => {
  if (_req.path.startsWith('/api')) {
    next();
    return;
  }
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) {
      res.status(404).json({ error: 'Frontend build not found. Run the frontend build first.' });
    }
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(port, () => {
  console.log(`ShelfLife API listening on port ${port}`);
});

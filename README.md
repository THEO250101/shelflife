# ShelfLife

ShelfLife is an anti-food-waste pantry and fridge tracker built for CS5610 Project 3. It helps users track ingredients, expiration dates, recipe matches, meal plans, shopping list items, and rescued food — all in one warm, practical kitchen dashboard.

**Author:** Yufei Ge  
**Class:** CS5610 Web Development — Summer 2026  
**Class Link:** [CS5610 Canvas](https://northeastern.instructure.com/courses/249954)  
**Project Objective:** Build a full-stack application with Node, Express, MongoDB native driver, React hooks, Passport authentication, organized components, seeded data, and a public deployment.

## Features

- Passport local authentication (register, login, logout)
- Pantry item CRUD with search and filters (category, location, status)
- Recipe CRUD with pantry-based match scoring
- Add missing recipe ingredients to the shopping list in one click
- Meal plan CRUD with date, meal slot, and status tracking
- Shopping list CRUD with bought/open toggle
- Rescue log CRUD for rescued, used, and discarded food
- Dashboard with real-time stats:
  - Use-soon items with days-left count
  - Rescued this month
  - Open shopping items
  - Total saved value
  - Storage location summary
  - Best recipe matches ranked by pantry coverage
  - Recent rescue activity
- Seed script with 1,120 source-backed demo records across 6 collections

## Tech Stack

- **Frontend:** React 18, Vite, hooks, component CSS, PropTypes
- **Backend:** Node.js, Express
- **Database:** MongoDB native Node.js driver
- **Auth:** Passport local strategy with PBKDF2 password hashing
- **Requests:** Fetch API

This project intentionally avoids Mongoose, Axios, CORS middleware, server-side templates, and unapproved UI libraries.

## Data Realism

The demo database is synthetic, but it is built from a real-food catalog instead of placeholder names. Seeded pantry items include realistic storage windows, estimated grocery value, storage location, and use notes. The catalog is based on public food-safety and food-data references:

- [USDA FoodKeeper](https://www.foodsafety.gov/keep-food-safe/foodkeeper-app) for storage-window guidance.
- [USDA FoodData Central](https://fdc.nal.usda.gov/) for common food names and food categories.
- [USDA ERS Food Price Outlook](https://www.ers.usda.gov/data-products/food-price-outlook/) for price-realism context.

The app does not call these services at runtime, so the deployed project remains self-contained and does not need API keys.

## Project Structure

```text
project3/
├── backend/
│   ├── server.js                  # Express entry point
│   ├── package.json
│   ├── .env.example               # Environment variable template
│   ├── .prettierrc
│   ├── eslint.config.js
│   └── src/
│       ├── db/mongo.js            # MongoDB connection, indexes, utilities
│       ├── middleware/auth.js     # Passport config, password hashing
│       ├── routes/
│       │   ├── auth.js            # Register, login, logout, /me
│       │   ├── crudRouter.js      # Generic CRUD router factory
│       │   ├── pantryItems.js     # Pantry CRUD
│       │   ├── recipes.js         # Recipe CRUD + matches + missing-to-shopping
│       │   ├── mealPlans.js       # Meal plan CRUD
│       │   ├── shoppingListItems.js # Shopping list CRUD
│       │   ├── rescueLogs.js      # Rescue log CRUD
│       │   └── stats.js           # Dashboard stats aggregation
│       └── seed/
│           ├── seed.js            # 1,120 source-backed demo records
│           ├── realFoodCatalog.js # Food catalog, storage windows, source URLs
│           └── smoke-test.js      # API smoke test suite
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── .prettierrc
│   ├── eslint.config.js
│   ├── vite.config.js             # Dev proxy to backend
│   ├── public/images/             # Local food and kitchen photos
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                # Auth state + view router
│       ├── api/client.js          # Fetch wrapper
│       ├── styles/global.css      # Design tokens and shared layout
│       ├── components/
│       │   ├── AppShell.jsx/.css   # Topbar, nav, layout shell
│       │   ├── NavButton.jsx/.css
│       │   ├── PageHeader.jsx/.css
│       │   ├── StatTile.jsx/.css
│       │   ├── StatusBadge.jsx/.css
│       │   ├── EmptyState.jsx/.css
│       │   └── ErrorBanner.jsx/.css
│       └── views/
│           ├── LoginView.jsx/.css
│           ├── DashboardView.jsx/.css
│           ├── PantryView.jsx/.css
│           ├── RecipesView.jsx/.css
│           ├── MealPlanView.jsx/.css
│           ├── ShoppingListView.jsx/.css
│           └── RescueLogView.jsx/.css
├── Design_Document.md
├── README.md
└── LICENSE
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB running locally on port 27017, or a MongoDB Atlas connection string

### Backend

```bash
cd project3/backend
npm install
cp .env.example .env         # Edit .env with your secrets
npm run seed                  # Creates demo user + 1,120 records
npm run dev                   # Starts on http://localhost:3000
```

### Frontend

```bash
cd project3/frontend
npm install
npm run dev                   # Starts on http://localhost:5173 with API proxy
```

### Production Build

```bash
cd project3/frontend
npm run build                 # Outputs to dist/

cd ../backend
npm start                     # Serves API + frontend from http://localhost:3000
```

## Demo Login

After running the seed script:

| Field    | Value      |
|----------|------------|
| Username | `demo`     |
| Password | `shelflife` |

## Verification Commands

```bash
cd project3/backend
npm run lint        # ESLint — must pass with zero errors
npm run format:check
npm run seed        # Seeds demo user + 1,120 records
npm run test:api    # Smoke tests: auth, CRUD, stats, recipe matching

cd ../frontend
npm run lint        # ESLint — must pass with zero errors
npm run format:check
npm run build       # Vite production build
```

The verification commands above pass clean when MongoDB is running on `127.0.0.1:27017`. The app serves on `http://localhost:3000` after `npm run build && npm start`.

## Deployment

The backend serves both the API and the built frontend from the same origin, so no CORS configuration is needed.

1. Build the frontend: `cd frontend && npm run build`
2. Set environment variables on your host:
   - `MONGO_URI` — MongoDB connection string
   - `DB_NAME` — database name (default: `shelflife`)
   - `SESSION_SECRET` — a long random string
   - `NODE_ENV` — set to `production` for secure cookies
   - `PORT` — optional (default: 3000)
3. Start: `cd backend && npm start`

Deploy to any Node.js host (Render, Railway, Fly.io, DigitalOcean, etc.) that supports persistent storage for MongoDB or connect to MongoDB Atlas.

## Screenshots

Screenshots will be added after the app is run locally and visually checked. Place screenshots in `docs/images/` and reference them here.

## Visual Assets

All food and kitchen photographs are stored locally in `frontend/public/images/`. The running app does not depend on external hotlinks.

## AI Usage Disclosure

AI tools were used for brainstorming, planning, code organization, and debugging support. The project structure, user stories, implementation choices, and final code are reviewed and owned by the author.

## License

MIT. See [LICENSE](./LICENSE).

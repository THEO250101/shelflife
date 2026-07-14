# ShelfLife Design Document

## 1. Project Description

ShelfLife is a pantry and fridge tracker focused on reducing food waste. Users can manage ingredients, expiration dates, simple recipes, meal plans, shopping lists, and rescue logs. The main workflow is practical: find food that should be used soon, match it with recipes, plan a meal, and record what was rescued.

This is a new Project 3 application, not an iteration of Project 2. It uses Node, Express, MongoDB with the native driver, and a React frontend with hooks.

## 2. User Personas

### Busy Home Cook

- Wants to know what food is already at home.
- Needs quick search, category filters, and expiration status.
- Does not want to buy duplicates or forget items in the fridge.

### Waste-Conscious Student

- Wants to reduce food waste without a complicated system.
- Needs a dashboard that highlights food close to expiring.
- Likes seeing a small record of rescued food.

### Practical Grocery Planner

- Wants a shopping list based on real pantry gaps.
- Needs missing ingredients from recipes to become shopping list items.
- Wants to plan meals without starting from scratch.

## 3. User Stories

1. As a busy home cook, I want to create, edit, delete, search, and filter pantry items by category, storage location, and expiration status, so that I can quickly understand what food I already have.
2. As a waste-conscious student, I want to see ingredients that are close to expiring and mark them as used, discarded, or rescued, so that I can reduce waste and keep a history of food I saved.
3. As a home cook, I want to view recipes that match my current pantry ingredients, so that I can decide what to cook without starting from an empty search box.
4. As a grocery planner, I want to add recipes or pantry-based meal ideas to a meal plan and create shopping list items for missing ingredients, so that I can plan meals and shop more intentionally.
5. As a user, I want to see simple stats such as items expiring soon, rescued items this month, most wasted categories, and estimated saved value, so that the app feels useful beyond basic data entry.

## 4. Data Model

### users

- username
- displayName
- salt
- passwordHash
- createdAt

### pantryItems

- userId
- name
- category
- quantity
- unit
- location
- purchaseDate
- expirationDate
- status
- notes

### recipes

- userId
- title
- ingredients
- tags
- cookTimeMinutes
- difficulty
- instructions
- notes

### mealPlans

- userId
- plannedDate
- mealSlot
- recipeId
- title
- notes
- status

### shoppingListItems

- userId
- name
- category
- quantity
- unit
- checked
- reason

### rescueLogs

- userId
- pantryItemName
- action
- recipeTitle
- estimatedSavedValue
- rescuedAt
- notes

## 5. API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/pantry-items`
- `GET/POST/PUT/DELETE /api/recipes`
- `GET /api/recipes/matches`
- `POST /api/recipes/:id/add-missing-to-shopping-list`
- `GET/POST/PUT/DELETE /api/meal-plans`
- `GET/POST/PUT/DELETE /api/shopping-list-items`
- `GET/POST/PUT/DELETE /api/rescue-logs`
- `GET /api/stats`

## 6. React Component Plan

- `App`: authentication state and current view
- `AppShell`: layout, navigation, and logout
- `LoginView`: login/register form
- `DashboardView`: stats and rescue-soon list
- `PantryView`: pantry item CRUD
- `RecipesView`: recipe CRUD and pantry matching
- `MealPlanView`: meal plan CRUD
- `ShoppingListView`: shopping list CRUD
- `RescueLogView`: rescue log CRUD
- `PageHeader`, `StatTile`, `StatusBadge`, `EmptyState`, `ErrorBanner`, `NavButton`: reusable components

Each React component is saved in its own file. Component CSS files are kept beside reusable components, while page-level layout styles live under `styles` or view CSS files.

## 7. Design Mockups

The planned visual direction is a warm but practical kitchen utility interface:

- Sidebar navigation for repeated app use
- Dashboard cards for urgent food and saved value
- Compact pantry rows for scanning many ingredients
- Clear status labels: Fresh, Use Soon, Expired, Rescued, Restock
- Forms using standard HTML inputs, selects, checkboxes, buttons, and textareas

### Login / Register

```text
+------------------------------------------------------+----------------------+
| ShelfLife                                            | Sign in | Register   |
| Know what's in your kitchen.                         | Username             |
| Cook before it's too late.                           | Password             |
|                                                      | [Open ShelfLife]     |
| [produce photo] [dinner photo] [kitchen photo]        | Demo account note    |
| Pantry tracking | Recipe matching | Shopping gaps    |                      |
+------------------------------------------------------+----------------------+
```

### Dashboard

```text
+--------------------------------------------------------------------------------+
| ShelfLife nav: Dashboard Pantry Recipes Meal Plan Shopping Rescue Log   User   |
+--------------------------------------------------------------------------------+
| Good afternoon, Chef                 [Add ingredient] [Shopping item]           |
| Use soon | Rescued this month | Open to buy | Saved value                       |
|                                                                                |
| [Use first photo card] [Best match] [Buy next] [Recent rescue]                  |
|                                                                                |
| Use-soon queue           Top recipe matches           Storage / Categories      |
| item, qty, location      match %, have/missing        fridge bar, pantry bar    |
| item, qty, location      match %, have/missing        shopping gaps             |
+--------------------------------------------------------------------------------+
```

### CRUD Work Views

```text
+--------------------------------------------------------------------------------+
| Page header with small real food photo                                          |
| Search/filter toolbar                                                           |
| +---------------------------------------------+  +---------------------------+ |
| | Compact item rows                           |  | Add/Edit form             | |
| | name, quantity, status, dates               |  | native inputs/selects     | |
| | [Edit] [Delete]                             |  | [Save] [Cancel]           | |
| +---------------------------------------------+  +---------------------------+ |
+--------------------------------------------------------------------------------+
```

Screenshots from the final running app should still be added to `docs/images/` and embedded in the README before submission.

## 7.1 Data Realism Plan

ShelfLife uses seeded records that are synthetic but source-backed. Ingredient names, food categories, and storage-window assumptions are modeled from public USDA FoodKeeper and FoodData Central references. Estimated saved values use conservative grocery-price ranges so dashboard totals feel plausible without depending on a live external API during grading.

## 8. Solo Work Plan

I am working solo with instructor approval. I will implement all user stories full-stack myself: React interaction, Express route, MongoDB persistence, and visible UI feedback.

## 9. Deployment Plan

The backend will run as the Express API. The React frontend will be built with Vite. The final deployment will serve the frontend and backend from the same origin to avoid CORS middleware.

## 10. AI Usage Disclosure

AI tools may be used for brainstorming, code organization, and debugging support. The author is responsible for understanding and presenting the full-stack implementation.

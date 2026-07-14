# ShelfLife Narrated Demo Video Script

**Target length:** 5-6 minutes  
**Presenter/Narrator:** Yufei Ge  
**Recording path:** Follow the "Recording guide" panel on the Dashboard.

## Setup Checklist

- [ ] MongoDB is running.
- [ ] Run `cd project3/backend && npm run seed` for a clean demo dataset.
- [ ] Run `cd project3/frontend && npm run build`.
- [ ] Run `cd project3/backend && npm start`.
- [ ] Open `http://localhost:3000` in Chrome.
- [ ] Set browser zoom to 100%.
- [ ] Use the demo account: `demo` / `shelflife`.

## 1. Login and Purpose

**Show:** Login page.

> Hi, I'm Yufei Ge, and this is ShelfLife, my CS5610 Project 3 full-stack application. ShelfLife is a pantry and fridge tracker focused on reducing food waste. The practical workflow is: see what is expiring, match it to recipes, add missing groceries, plan meals, and record what was rescued.

**Action:** Log in with `demo` / `shelflife`.

## 2. Dashboard and Recording Guide

**Show:** Dashboard top section.

> After logging in, the dashboard gives me the current kitchen state: use-soon items, rescued items this month, open shopping items, and estimated saved value. The demo database is seeded with 1,120 source-backed records using realistic food names, storage windows, and grocery value estimates.
>
> I also added this Recording guide so the demo is not just a page tour. Each step opens a real workflow that a user would perform.

**Action:** Point to the Recording guide panel.

## 3. Step 1: Pantry Inventory

**Show:** Click `Open pantry` in the guide, or click the `Use first` image card.

> The Pantry view is the main inventory screen. It supports full CRUD on pantry items, plus search and filters by status, category, and storage location.

**Actions to record:**

1. Filter status to `Use Soon`.
2. Edit one pantry item.
3. Save it and show the updated row.

**Mention:** The backend validates input before writing to MongoDB.

## 4. Step 2: Recipe Matching

**Show:** Return to Dashboard or use nav, then open Recipes.

> Recipes are matched against pantry inventory. Each match shows what I already have and what is missing, so the user can cook from existing food instead of starting from a blank search box.

**Actions to record:**

1. Show the match percentage cards.
2. Click `Add missing` on one recipe.
3. Mention repeated clicks do not create duplicate shopping items.

## 5. Step 3: Shopping Loop

**Show:** Open Shopping.

> Shopping items can be created manually or generated from missing recipe ingredients. Open items stay separate from bought items, which makes the list usable during an actual grocery trip.

**Actions to record:**

1. Toggle one item to `Bought`.
2. Add a manual shopping item.
3. Save it and show it in the list.

## 6. Step 4: Rescue Log

**Show:** Open Rescue Log.

> The Rescue Log records what was rescued, used, or discarded. The dashboard only counts rescued or used food toward saved value, so discarded items do not inflate the impact stats.

**Actions to record:**

1. Add a new rescue log entry.
2. Use action `Rescued`.
3. Enter an estimated saved value.
4. Save and return to Dashboard to show the stat context.

## 7. Architecture Close

**Show:** Briefly show the app UI, then optionally the README or source tree.

> Technically, this is a Node and Express backend using the native MongoDB driver. Authentication uses Passport local strategy with PBKDF2 password hashing. The frontend is React with hooks, component CSS, PropTypes, and the Fetch API. The project intentionally avoids prohibited libraries such as Axios, Mongoose, and CORS middleware.

## 8. Wrap-Up

> ShelfLife is designed as a practical anti-food-waste kitchen tool: not just storing records, but guiding the user from inventory to cooking, shopping, and rescue history. Thank you for watching.

## After Recording

- [ ] Verify audio is clear.
- [ ] Trim dead air.
- [ ] Upload as an unlisted public YouTube video.
- [ ] Confirm the video URL opens in an incognito/private window.
- [ ] Submit the deployment URL, GitHub URL, screenshot thumbnail, and video URL in the course form.

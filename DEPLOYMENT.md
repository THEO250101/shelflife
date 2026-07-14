# ShelfLife Deployment Guide

Use this guide to deploy ShelfLife with MongoDB Atlas and Render.

## 1. Create MongoDB Atlas Database

1. Log in to MongoDB Atlas.
2. Create a project, for example `ShelfLife`.
3. Create a free M0 cluster. Any US region is fine for this assignment.
4. Create a database user:
   - Username: `shelflife_app`
   - Password: generate a strong password and save it somewhere private.
   - Role: `Read and write to any database`, or read/write for the `shelflife` database.
5. Add network access:
   - For Render free services, use `0.0.0.0/0` because free outbound IPs are not fixed.
   - Use a strong database password. If you later use paid static outbound IPs, restrict the allowlist to those IPs.
6. Click `Connect` -> `Drivers` -> `Node.js`.
7. Copy the `mongodb+srv://...` connection string.
8. Replace `<password>` with the database user's password. If the password has special characters, URL-encode them.

Keep this connection string private. Do not commit it to GitHub.

## 2. Deploy on Render with Blueprint

The repository includes `render.yaml`, so Blueprint deployment is the safest option.

1. Push the latest `main` branch to GitHub.
2. Log in to Render.
3. Choose `New` -> `Blueprint`.
4. Connect the GitHub repository `THEO250101/shelflife`.
5. Select branch `main`.
6. Render should detect `render.yaml`.
7. When Render asks for environment variables, paste:
   - `MONGO_URI`: your MongoDB Atlas connection string.
8. Confirm creation.

The Blueprint sets:

- `NODE_ENV=production`
- `DB_NAME=shelflife`
- a generated `SESSION_SECRET`
- build command: `npm ci --prefix frontend && npm --prefix frontend run build && npm ci --prefix backend`
- start command: `npm --prefix backend start`
- health check path: `/api/health`
- first-deploy seed command: `npm --prefix backend run seed`

Do not manually set `PORT`; Render provides it.

## 3. Manual Render Setup

If you do not use Blueprint, create a Web Service manually:

- Runtime: `Node`
- Repository: `THEO250101/shelflife`
- Branch: `main`
- Root Directory: leave blank
- Build Command: `npm ci --prefix frontend && npm --prefix frontend run build && npm ci --prefix backend`
- Start Command: `npm --prefix backend start`
- Health Check Path: `/api/health`

Environment variables:

```text
NODE_ENV=production
DB_NAME=shelflife
SESSION_SECRET=<long random value>
MONGO_URI=<your Atlas connection string>
```

After the first successful deploy, seed the database once:

```bash
npm --prefix backend run seed
```

Run that command from Render Shell if available, or run it locally after creating an ignored `backend/.env` file with the Atlas `MONGO_URI`.

## 4. Verify

1. Open `https://<your-render-service>.onrender.com/api/health`.
2. Expected response:

```json
{ "ok": true, "name": "ShelfLife API" }
```

3. Open `https://<your-render-service>.onrender.com`.
4. Log in with:

```text
Username: demo
Password: shelflife
```

5. Confirm the dashboard shows seeded stats and image cards.

## 5. Submission Links

Submit:

- GitHub repository: `https://github.com/THEO250101/shelflife`
- Render app URL: `https://<your-render-service>.onrender.com`
- Screenshot thumbnail from `docs/images/shelflife-dashboard.png`

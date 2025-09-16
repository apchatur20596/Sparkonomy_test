# Sparkonomy - Mobile-friendly Invoicing App

Tech stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- ORM: Prisma
- DB: SQLite (dev by default). For persistent prod data, use Postgres (Neon)

Local development
1) Backend
   - cd backend
   - Copy .env if needed. Defaults are fine (SQLite):
     DATABASE_URL="file:./dev.db"
     PORT=4000
     CORS_ORIGINS=http://localhost:5173
   - Install deps, migrate, seed, and start:
     npm install
     npx prisma generate
     npx prisma migrate dev
     npm run seed
     npm run dev
   - API: http://localhost:4000/api

2) Frontend
   - cd frontend
   - Create .env (optional):
     VITE_API_URL=http://localhost:4000/api
   - Install and run:
     npm install
     npm run dev
   - App: http://localhost:5173

Deploy (free-friendly)
Frontend (Netlify or Vercel)
- Build command: npm run build
- Publish directory: dist
- Root directory: frontend
- Add env var VITE_API_URL pointing to your backend URL.
- SPA routing: public/_redirects already added for Netlify.

Backend (Render/Railway/Fly)
Option A: Quick demo (SQLite ephemeral)
- Connect this repo and select the backend/ folder.
- Build command: npm install && npx prisma generate
- Start command: npm start
- Add env vars:
  - PORT=10000 (or platform default)
  - DATABASE_URL=file:./dev.db
  - CORS_ORIGINS=https://your-frontend-domain.netlify.app,https://your-frontend.vercel.app
- Note: SQLite on most free hosts is ephemeral. Data can reset on redeploy/restart.

Option B: Persistent data with Neon Postgres (recommended)
- Create a free Neon Postgres DB and copy the connection string.
- Update backend/prisma/schema.prisma datasource to provider = "postgresql" (commit this change).
- Set DATABASE_URL to the Neon connection string.
- Run once on the host/CI:
  - npx prisma migrate deploy
  - (optionally) npm run seed
- Keep prestart script to auto-generate Prisma client.

CORS
- Update CORS_ORIGINS in backend .env to include your deployed frontend origins, comma-separated.

Monorepo notes
- This project currently runs frontend and backend independently. Deploy them as separate services.

Troubleshooting
- If Tailwind classes don’t apply, ensure frontend has postcss and tailwind configs and you restarted the dev server after installing plugins.
- Prisma errors: re-run npx prisma generate after changing the schema.

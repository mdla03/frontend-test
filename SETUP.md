# Bayanihan — Setup

Monorepo: frontend at repo root, backend in `backend/`.

## Prerequisites

- Node.js 20+ (built/tested on Node 22)
- A [Supabase](https://supabase.com) project (free tier is fine)

## 1. Database (Supabase)

1. Create a Supabase project.
2. Open the SQL editor and run `backend/sql/schema.sql` — creates all tables plus the `nearby_events`, `leaderboard_rewards`, and `monthly_registrations` RPC functions. Requires the `postgis` extension, which the script enables itself.
3. Grab from Project Settings → API:
   - Project URL → `SUPABASE_URL`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY` (not the `anon` key — the backend uses the service role to bypass RLS)
4. There's no signup endpoint yet. Seed at least one demo user per role directly in the SQL editor:

   ```sql
   -- bcrypt hash a real password before inserting; this is just illustrative
   insert into users (name, email, role, password) values
     ('Mark Aquino', 'mark.aquino@manulife.com', 'user', '<bcrypt-hash>'),
     ('Liza Reyes', 'liza.reyes@manulife.com', 'organizer', '<bcrypt-hash>'),
     ('Carlo Santos', 'carlo.santos@manulife.com', 'admin', '<bcrypt-hash>');
   ```

   Generate a bcrypt hash quickly with `node -e "console.log(require('bcryptjs').hashSync('yourpassword', 10))"` (run inside `backend/` after `npm install`).

## 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `backend/.env`:

```
PORT=4000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=any-long-random-string
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173
```

Run it:

```bash
npm run dev      # nodemon, auto-restart
# or
npm start        # plain node
```

Verify: `curl http://localhost:4000/api/health` → `{"status":"ok"}`

## 3. Frontend

From the repo root:

```bash
npm install
cp .env.example .env
```

`.env` only needs:

```
VITE_API_BASE_URL=http://localhost:4000/api
```

Run it:

```bash
npm run dev       # http://localhost:5173
npm run build     # production build to dist/
npm run lint      # oxlint
```

## 4. Log in

No signup flow — log in with one of the demo accounts you seeded in step 1 (email/password combo), or on the login screen use the **role quick-switch cards**, which issue a client-side demo JWT without hitting the backend at all. Quick-switch is useful for browsing the UI, but any page that calls the API (events, registrations, rewards) needs a real backend-issued token from an actual login — so seed real users if you want end-to-end data flowing.

## Notes

- Frontend and backend run as two separate processes locally — no single `npm run dev` spins up both.
- `backend/sql/schema.sql` is the only source of truth for the schema; there's no migration tool. Re-running it is safe (`create table if not exists` / `create or replace function`).
- Deploy target per the project spec: frontend → Vercel, backend → Railway, DB → Supabase. Set the same env vars on each platform (`VITE_API_BASE_URL` pointing at the deployed backend URL on Vercel; the four backend vars above on Railway).

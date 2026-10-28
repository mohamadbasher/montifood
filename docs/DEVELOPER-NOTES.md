# MontiFood — developer notes

> Internal notes for running and deploying this app. For the project overview, see the [README](../README.md).

Hebrew (RTL) B2B ordering web app for MontiFood — restaurants order tahini products online; the owner and managers run everything from an admin dashboard.

**Live:** https://montifood.co.il (and https://montifood.vercel.app)

---

## Tech stack
- **Next.js 16** (App Router) + **React 19** + **Tailwind CSS 4**
- **Prisma 7** with the **libsql adapter**
  - Local dev → SQLite file `dev.db`
  - Production → **Turso** (hosted libsql) via `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`
- Auth → **iron-session** (encrypted cookie) + **bcryptjs**
- Hosting → **Vercel** (project `montifood`)
- Brand: navy `#14315E`, gold `#D99A2B`, white. Logo at `public/logo.png`.

## Roles
- **Admin (owner)** — full access, manages team & permissions.
- **Manager (צוות)** — staff with granular permissions (see `src/lib/permissions.ts`).
- **Restaurant (customer)** — logs in, orders, sees status/history/balance.

## Key features
Orders (active/delivered/archive + search + date filter + Excel export), restaurants
(per-restaurant catalog & prices, debt balance, receipts, magic-login links, customer number,
city → area auto-assignment), areas with cities + weekly delivery days, WhatsApp broadcast,
team management with per-function permissions.

---

## Run locally
```bash
npm install
npx prisma generate
npm run dev        # http://localhost:3000
```
Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env` before seeding. Never leave the production admin on a default password.

## Environment variables (`.env` locally, Vercel project settings in prod)
- `DATABASE_URL` — local only: `file:./dev.db`
- `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` — production database (Turso)
- `SESSION_SECRET` — long random string for cookie encryption
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_ALERT_EMAIL` — used by the seed script
- `RESEND_API_KEY`, `EMAIL_FROM` — optional, for real order-alert emails

> Production secrets live in **Vercel → Project Settings → Environment Variables**.
> Keep a private copy of these somewhere safe (e.g. a password manager).

## Database changes (schema)
1. Edit `prisma/schema.prisma`
2. Create a migration SQL (or `npx prisma migrate dev`) under `prisma/migrations/`
3. `npx prisma migrate deploy` (local) + apply the same SQL to Turso + `npx prisma generate`
4. Restart dev / redeploy

## Deploy
```bash
vercel --prod --yes --scope <your-vercel-scope>
```
(Or connect this GitHub repo to Vercel for automatic deploys on push.)

## Contact
Phone 052-743-0074 · Email montifood@rushdi.co.il

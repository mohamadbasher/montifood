# MontiFood — B2B ordering system

**A live ordering platform for a tahini producer and its restaurant customers.** Restaurants log in and order from their own catalogue at their own prices; the owner and staff manage orders, customers, delivery areas and team permissions from an admin dashboard. Hebrew, right-to-left.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)

**Live in production:** [montifood.co.il](https://montifood.co.il), used by the business and its restaurant customers.

## Features

**For restaurants**
- Personal catalogue with per-restaurant products and prices
- Order history, order status and account balance
- One-tap sign-in links, so restaurant staff don't need to remember a password

**For the owner and staff**
- Orders split into active, delivered and archive, with search, date filters and **Excel export**
- Restaurant management: custom catalogues and prices, debt balance, receipts, customer numbers
- Delivery planning: areas with their cities and weekly delivery days, with new restaurants
  assigned to an area automatically from their city
- **WhatsApp broadcast tool** to message restaurants from the dashboard
- **Team management with 14 fine-grained permissions**, so each staff member only sees and does
  what their role needs
- Order alert emails

## Engineering highlights

- **Three roles, one app:** owner (full access), staff (granular permissions), and restaurant
  customers, enforced on the server for every action, not just hidden in the UI.
- **Secure sessions without a third-party auth service:** encrypted cookie sessions
  (iron-session) and bcrypt-hashed passwords.
- **Same code, two databases:** Prisma with the libSQL adapter runs on a local SQLite file in
  development and on hosted Turso in production.
- **Server-first Next.js:** App Router with server actions for all mutations and a route handler
  for the Excel export.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, Hebrew RTL |
| Data | Prisma 7, libSQL (SQLite locally, Turso in production) |
| Auth | iron-session, bcryptjs |
| Email | Resend |
| Hosting | Vercel |

## Run it locally

```bash
npm install                # then create .env (variables listed in docs/DEVELOPER-NOTES.md)
npx prisma generate
npm run dev                # http://localhost:3000
```

Environment variables, database changes and deployment are covered in
[docs/DEVELOPER-NOTES.md](docs/DEVELOPER-NOTES.md).

---

Built by [Mohamad Basher](https://github.com/mohamadbasher) for MontiFood.

# Kassab — Delivery Workforce Marketplace

**KASSAB Logistics Services** — a B2B delivery workforce marketplace for Egypt.
Companies publish workforce requests, drivers apply, Kassab runs recruitment
and settles salaries. Frontend-only, client-demo-ready.

## Portals

Three audiences, three routes. An account only ever reaches its own
portal — anything else redirects to where that account belongs.

| Route | Who | What they do |
|---|---|---|
| `/admin` | Kassab staff | Run recruitment, hiring and settlement |
| `/company` | Employers | Publish workforce requests, follow candidates, pay one invoice |
| `/delivery` | Drivers | Find work, apply, follow applications, get paid |

Public: `/` (marketing), `/login`, `/register/company`, `/register/driver`.

## Demo access

Every account uses the password `kassab2026`.

| Email | Role | Lands on |
|---|---|---|
| `admin@kassab.demo` | Platform owner | `/admin` |
| `recruiter@kassab.demo` | Recruitment admin | `/admin` |
| `finance@kassab.demo` | Finance admin | `/admin` |
| `support@kassab.demo` | Support agent | `/admin` |
| `company@kassab.demo` | Company owner | `/company` |
| `driver@kassab.demo` | Delivery driver | `/delivery` |

The login page lists them all — pick one to fill the form. Registering a
new company or driver signs you straight into that portal.

## Business model

```
Company -> Workforce Request -> Driver Applications -> Kassab Review
        -> Hiring -> Salary Management -> Driver Performance
```

A company asks for N motorcycle delivery drivers at a salary. Drivers apply
from the marketplace. Kassab screens candidates, moves them through the hiring
pipeline, and once hired settles one monthly invoice per company: driver
salaries plus a 12.5% Kassab service fee. Kassab then pays each driver.

**One vehicle category only: motorcycle.** A driver specifies the motorcycle
brand and model they ride (Honda, Yamaha, Bajaj, SYM, TVS, Other).

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 3 (logical properties for true RTL; light/dark themes share
  one set of classes through the CSS colour tokens in `src/index.css`)
- React Router (SPA, Cloudflare `_redirects` included)
- Recharts (analytics), Lucide (icons)
- Custom lightweight i18n (English / Arabic, full RTL mirroring)

## Modules

- **Dashboard** — workforce KPIs (drivers, companies, open positions, new
  applications, hired this month) plus salary volume, Kassab revenue and
  outstanding payments; attention queue, hiring pipeline, supply vs demand
- **Opportunities** — the driver-facing marketplace with filters, full
  opportunity page, and an Apply Now form prefilled from the driver profile
- **Audience counters** — every published opportunity tracks views, people
  reached, likes and saves, with a viewer-to-applicant rate. Anyone browsing
  can like or save a post; only the **platform owner** and **recruitment
  admins** see the numbers (`ENGAGEMENT_ROLES` in `src/store/auth.tsx`).
  Settings has a role preview so the restriction can be demonstrated.
- **Workforce Requests** — company demand with publish / close actions
- **Applications & Hiring Pipeline** — table with drawer, plus a six-stage
  kanban; hiring a candidate updates the driver, the request and the company
- **Drivers** — all / available / hired, and a profile with performance,
  motorcycle, wallet, employment and application history
- **Companies** — all / hiring, with hiring overview, workforce, requests,
  candidates and invoices
- **Finance** — salaries, company payments, driver payouts, invoices with a
  printable detail view, and Kassab revenue analytics
- **Performance, Ratings, Reports, Notifications, Settings**

## Architecture

```
src/
  components/   UI kit + layout (Button, DataTable, Drawer, Modal, Toast, ...)
  features/     applications (apply modal, drawer), drivers (actions)
  pages/        routed screens
  services/     service interfaces backed by mocks - swap for REST later
  mocks/        seeds.ts is the single source of truth; every aggregate
                (positions filled, workforce cost, payouts) is derived
  store/        app state (reducer) + mock auth
  i18n/         en/ar dictionaries + RTL-aware provider
  types/        backend-ready domain models
  lib/          formatting (EGP, ar-EG numerals), status maps, geo labels
```

No backend, no database. All actions update local state through service
abstractions designed to be replaced by a real API.

## Run

```bash
npm install
npm run dev      # local dev
npm run build    # production build (dist/)
```

## Deploy

Built for Cloudflare Pages (static SPA):

```bash
npx wrangler pages deploy dist --project-name kassab-dashboard --branch main
```

Note: the Pages project lives on the Cloudflare account that owns
`kassab-dashboard.pages.dev`. Run `npx wrangler login` with that account
before deploying.

---

Designed & Developed by **BrandMe Agency [HΣ]**.

# Kassab — Web Admin Dashboard

**KASSAB Logistics Services** — B2B Delivery Platform for Egypt.
Frontend-only, client-demo-ready admin dashboard built as the web foundation of the Kassab product.

## Demo access

| | |
|---|---|
| Email | `admin@kassab.demo` |
| Password | `kassab2026` |

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 3 (logical properties for true RTL)
- React Router (SPA, Cloudflare `_redirects` included)
- Recharts (analytics), Lucide (icons)
- Custom lightweight i18n (English / Arabic, full RTL mirroring)

## What's inside

- **Dashboard** — KPIs (drivers, orders, revenue, commission, dues), attention queue with urgency states, live-ops counters, revenue/status charts
- **Orders** — full lifecycle (New → Assigned → En route → Picked up → Delivered → Closed + problem states), filters, search, details drawer with timeline, assign/reassign/cancel
- **Dispatch simulation** — ranked driver candidates by proximity, zone, vehicle match, load, and rating
- **Live tracking** — simulated network map (clean Google Maps integration boundary)
- **Drivers** — list, profile, documents review, wallet, order history; approve / reject / suspend flows
- **Companies & branches** — business customers, per-company pricing, company profile with financials
- **Pricing** — customer / zone / vehicle pricing, additional charges, commission rules (editable)
- **Finance** — revenue, commissions, wallets, invoices, reports with export UI
- **Notifications, ratings, settings** — complete demo state

## Architecture

```
src/
  components/   UI kit + layout (Button, DataTable, Drawer, Modal, Toast, …)
  features/     feature components (order drawer, dispatch modal, document review)
  pages/        routed screens
  services/     service interfaces backed by mocks — swap for REST later
  mocks/        centralized deterministic Egyptian demo data
  store/        app state (reducer) + mock auth
  i18n/         en/ar dictionaries + RTL-aware provider
  types/        backend-ready domain models
  lib/          formatting (EGP, ar-EG numerals), status maps
```

No backend, no database — all actions update local mock state through service
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
npx wrangler pages deploy dist
```

---

Developed for **BrandMe Agency** — Kassab system development.

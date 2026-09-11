# Commerce Operations

[![CI](https://github.com/cibss/commerce-operations/actions/workflows/ci.yml/badge.svg)](https://github.com/cibss/commerce-operations/actions/workflows/ci.yml)

A production-style B2B commerce operations workspace built to demonstrate frontend architecture, micro-frontends, transactional workflows, and reliable business-state management.

The application models an end-to-end quote-to-cash workflow across independently deployed frontend domains.

**Live demo:** https://seibashonia.dev/work/commerce-operations

![Commerce Operations dashboard](./docs/com-ops-dashboard.webp)

## Overview

Commerce Operations simulates an internal platform used by Sales, Operations, and Finance teams.

The main workflow is:

```text
Quotation
→ Approval
→ Order
→ Payment
→ Fulfillment
→ Completed
```

The project focuses on architecture and engineering decisions commonly found in larger operational systems:

- Multi-Zone micro-frontends
- Independent domain applications
- Shared UI and platform packages
- PostgreSQL persistence
- Transactional business workflows
- Payment-gated fulfillment
- Deterministic database seeding
- Unit and end-to-end testing
- CI/CD quality gates
- Production deployment through Vercel

## Business Workflow

### Quotation

```text
DRAFT
→ SENT
→ ACCEPTED
→ CONVERTED
```

A sent quotation can also be rejected:

```text
SENT
→ REJECTED
```

Accepted quotations can be converted into orders.

Quotation-to-order conversion is idempotent so the same quotation cannot create duplicate orders.

### Order

```text
PENDING
→ CONFIRMED
→ PROCESSING
→ SHIPPED
→ COMPLETED
```

When an order is confirmed:

```text
Order PENDING
↓
Confirm Order
↓
Order CONFIRMED
+
Payment PENDING
```

Order confirmation and payment creation happen as one transactional operation.

### Payment

```text
PENDING
→ PAID
→ REFUNDED
```

A pending payment can also become:

```text
PENDING
→ FAILED
```

or:

```text
PENDING
→ CANCELLED
```

Fulfillment cannot begin until the associated payment has status `PAID`.

The same rule is enforced by the backend, so it cannot be bypassed by calling the API directly.

### Order and Payment Workflow

![Order and payment workflow](./docs/com-ops-order.webp)

An order cannot enter fulfillment until its related payment has cleared. This rule is enforced in both the interface and backend service layer.

### Cancellation

Cancellation preserves consistency between Order and Payment.

```text
Order PENDING
→ Cancel
→ Order CANCELLED
→ No payment exists
```

For a confirmed order with a pending payment:

```text
Order CONFIRMED
+
Payment PENDING
↓
Cancel
↓
Order CANCELLED
+
Payment CANCELLED
```

A confirmed order with a paid payment cannot be cancelled until the payment has been refunded.

## Architecture

![Commerce Operations architecture](./docs/architecture.webp)

The platform separates Quotations, Orders, Customers, and Payments into independently deployed Next.js zones, coordinated through a shared shell and Commerce API.

The repository is an npm workspace managed with Turborepo.

```text
commerce-operations
│
├── apps
│   ├── shell
│   ├── quotations
│   ├── orders
│   ├── customers
│   ├── payments
│   └── commerce-api
│
├── packages
│   ├── ui
│   └── platform-ui
│
└── e2e
```

### Applications

| Application  | Responsibility                            | Local Port |
| ------------ | ----------------------------------------- | ---------: |
| Shell        | Multi-Zone routing and workspace overview |       3000 |
| Quotations   | Quotation and approval workflow           |       3001 |
| Orders       | Order and fulfillment workflow            |       3002 |
| Commerce API | REST API and business services            |       3003 |
| Customers    | Customer accounts and commercial history  |       3004 |
| Payments     | Payment and settlement workflow           |       3005 |

### Shared Packages

#### `@commerce/ui`

Reusable visual components shared across domain applications.

Examples include:

- Buttons
- Loading-aware submit buttons
- Badges
- Panels
- Page headers
- Progress steps
- Statistic cards

#### `@commerce/platform-ui`

Shared platform-level concerns such as:

- Commerce shell
- Navigation
- Canonical base path
- Cross-zone URL generation
- Shared metadata

## Multi-Zone Strategy

Each frontend domain is an independent Next.js application.

The canonical public path is:

```text
/work/commerce-operations
```

Domain routes include:

```text
/work/commerce-operations/quotations
/work/commerce-operations/orders
/work/commerce-operations/customers
/work/commerce-operations/payments
```

Same-zone navigation uses Next.js routing.

Cross-zone navigation intentionally uses native document navigation because each domain belongs to a different Next.js zone.

The domain boundaries are intentional: each zone can evolve and deploy independently while shared packages preserve a consistent product experience.

The public portfolio acts as the external gateway while the Commerce Operations shell routes requests to the appropriate application.

## Data Layer

The Commerce API uses:

- PostgreSQL
- Supabase for production PostgreSQL
- Drizzle ORM
- Repository and service layers
- Database transactions
- Foreign keys and unique constraints

Core persisted entities:

```text
customers
quotations
quotation_items
orders
order_items
payments
```

Important database constraints include:

- One converted order per source quotation
- One payment per order
- Foreign-key relationships between parent and child records

Identity allocation and quotation conversion use database-level coordination to remain safe under concurrent operations.

Transactional service logic preserves consistency across related entities such as Orders and Payments.

## Tech Stack

### Frontend

- React 19
- Next.js 16
- TypeScript
- Tailwind CSS

### Architecture

- Next.js Multi-Zone
- npm Workspaces
- Turborepo
- Shared UI and platform packages

### Backend and Persistence

- Next.js Route Handlers
- REST API
- PostgreSQL
- Supabase
- Drizzle ORM

### Testing

- Vitest
- Playwright

### CI/CD

- GitHub Actions
- Vercel
- PostgreSQL 16 disposable CI database

## Local Development

### Requirements

- Node.js 24
- npm 11
- PostgreSQL

The repository includes `.nvmrc`.

```bash
nvm use
```

Install dependencies:

```bash
npm install
```

## Environment Variables

### Commerce API

Create:

```text
apps/commerce-api/.env.local
```

Example:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE
```

Use the connection string for your local PostgreSQL database.

### Frontend Applications

Create an `.env.local` file in:

```text
apps/quotations
apps/orders
apps/customers
apps/payments
```

Each frontend application uses:

```env
COMMERCE_API_ORIGIN=http://localhost:3003
COMMERCE_PLATFORM_URL=http://localhost:3000/work/commerce-operations
```

The repository contains `.env.example` files as references.

Never commit `.env.local` or production credentials.

## Database Setup

Run migrations:

```bash
npm run db:migrate --workspace=@commerce/api
```

Reset, seed, and verify the local database:

```bash
npm run db:reset:verify --workspace=@commerce/api
```

The seed is deterministic so automated workflows can rely on known application states.

> Do not run database reset commands against the production database.

## Running the Project

Start all applications:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000/work/commerce-operations
```

The local workspace starts the Commerce applications on:

```text
Shell          3000
Quotations     3001
Orders         3002
Commerce API   3003
Customers      3004
Payments       3005
```

## Quality Checks

Lint:

```bash
npm run lint
```

Typecheck:

```bash
npm run typecheck
```

Unit tests:

```bash
npm run test:unit
```

End-to-end tests:

```bash
npm run test:e2e
```

Production build:

```bash
npm run build
```

Run the standard non-E2E validation:

```bash
npm run check
```

## Testing Strategy

Unit tests focus on domain behavior and service orchestration, including:

- Order confirmation
- Transactional payment creation
- Payment-gated fulfillment
- Cancellation consistency
- Payment transition rules
- Quotation-to-order conversion

Playwright covers the cross-domain quote-to-cash workflow:

```text
Create quotation
→ Send
→ Accept
→ Convert
→ Confirm order
→ Payment created
→ Mark payment paid
→ Start processing
→ Ship
→ Complete
```

The E2E suite also verifies important negative paths such as:

- Processing an unpaid order
- Cancelling an order with a paid payment
- Paying a cancelled payment
- Cross-zone navigation
- Independent application routing

## Continuous Integration

GitHub Actions runs on pull requests and updates to `main`.

CI uses a disposable PostgreSQL 16 database and validates:

```text
Database migration
→ Deterministic seed verification
→ Lint
→ Typecheck
→ Unit tests
→ Production build
```

A separate job runs the Playwright end-to-end suite.

The intended merge workflow is:

```text
Feature branch
↓
Pull request
↓
Quality + End-to-End checks
↓
Merge to main
```

`main` is intended to remain stable and deployable, with application changes validated through CI before merge.

## Deployment

The applications are deployed independently on Vercel.

Production compute is aligned with the Singapore region to reduce latency between the frontend applications, Commerce API, and production PostgreSQL database.

The public application is exposed through:

```text
https://seibashonia.dev/work/commerce-operations
```

The public portfolio acts as the external routing gateway:

```text
seibashonia.dev
↓
Commerce Operations Shell
↓
Quotations / Orders / Customers / Payments
↓
Commerce API
↓
Supabase PostgreSQL
```

Internal zone deployments remain independently deployable while users interact through one canonical public URL.

## Engineering Goals

This project is intentionally more architecture-focused than feature-heavy.

It was built to demonstrate:

- Designing frontend boundaries around business domains
- Coordinating independently deployed applications
- Modeling real operational state transitions
- Enforcing business rules in both UI and backend layers
- Using database transactions for cross-entity consistency
- Designing idempotent business operations
- Maintaining consistency across Order and Payment state
- Designing deterministic automated tests
- Building CI/CD quality gates
- Reasoning about production latency and deployment topology

## Project Status

**Core quote-to-cash workflow complete.**

This repository is maintained as a production-style portfolio project focused on frontend architecture, distributed application boundaries, transactional workflows, and engineering reliability.

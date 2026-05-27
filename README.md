# Prashn

A production-style form builder SaaS where creators design dynamic forms on an infinite canvas, publish shareable links, and collect responses — built with Turborepo, tRPC, Zod, Drizzle ORM, and Scalar.

## Demo Credentials

- **Email:** admin@prashn.io
- **Plan:** Pro
- **API Docs:** http://localhost:8000/docs

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo + pnpm workspaces |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| Backend | Express.js, tRPC v11, trpc-to-openapi |
| Database | PostgreSQL 16, Drizzle ORM |
| Auth | Clerk (JWT + Webhooks) |
| Cache/Rate Limit | Redis 7 (sliding window) |
| Email | Resend |
| API Docs | Scalar (OpenAPI 3.0) |
| Validation | Zod |

## Project Structure

```
trpc-monorepo/
├── apps/
│   ├── api/          → Express API server (port 8000)
│   └── web/          → Next.js frontend (port 3000)
├── packages/
│   ├── database/     → Drizzle schema, migrations, seed
│   ├── trpc/         → Shared tRPC router, context, client types
│   ├── services/     → Business logic (form, field, response, analytics, email, rate-limiter)
│   ├── logger/       → Winston logger
│   ├── eslint-config/
│   └── typescript-config/
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- pnpm 9+
- Docker (for PostgreSQL + Redis)

### 1. Clone and install

```bash
git clone <repo-url>
cd trpc-monorepo
pnpm install
```

### 2. Start infrastructure

```bash
docker compose -f docker-compose.dev.yml up -d
```

This starts PostgreSQL (port 5432) and Redis (port 6379).

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in your Clerk keys and Resend API key in `.env`.

### 4. Run database migrations

```bash
pnpm db:migrate
```

### 5. Seed demo data

```bash
cd packages/database
pnpm db:seed
```

This creates:
- 1 demo user (admin@prashn.io, Pro plan)
- 4 system themes
- 3 themed forms with fields
- 700+ randomized responses
- 30 days of analytics data
- 1 API key

### 6. Start development

```bash
pnpm dev
```

- Frontend: http://localhost:3000
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Features

### Core

- User authentication (Clerk) with protected dashboard
- Create, edit, publish, unpublish, archive, clone forms
- Dynamic fields with validations and required/optional settings
- 10 field types: short text, long text, email, number, single select, multi select, checkbox, dropdown, rating, date
- Public and unlisted form visibility modes
- Public form submission without login (with mandatory email collection)
- Response analytics and management
- CSV export for responses
- Email notifications for creators (new response, form published, response limit reached)

### Builder

- **Form View** — drag-and-drop field reordering with @dnd-kit
- **Canvas Flow View** — infinite canvas with detachable string connections, node dragging, auto-connect/disconnect, pan/zoom
- Field inspector with label, description, placeholder, options, required toggle
- Conditional logic (show field if another field equals/contains/greater than a value)
- Form settings panel (title, description, visibility, theme, response limit, expiry, password protection)
- QR code generation for published forms
- Auto-save toggle (debounced 1.2s)
- Keyboard shortcuts (Delete, ⌘Z undo, ⌘⇧Z redo, Escape deselect)
- Form preview with device frames (Desktop/Tablet/Mobile) and theme switching
- Undo/redo stack

### Form Themes

10 visual themes that transform the respondent experience:
Default, Terminal, Anime, Cyberpunk, Studio, Gaming, Retro, Space, Nature, Minimal

### Templates

8 pre-built form templates with real field definitions:
Customer Feedback, Job Application, Event RSVP, Contact Form, Newsletter Signup, Bug Report, NPS Survey, Meeting Request

### Public Pages

- Landing page with interactive canvas demo
- Pricing page
- Explore page (browse public forms with category filters)
- Public form filling with step-by-step experience, progress bar, Enter key navigation, confetti on submit

### API

- Full REST API via trpc-to-openapi
- Interactive Scalar documentation at /docs
- API key management (create, revoke, delete)
- Rate limiting: 60 req/min public submission, 10 req/min auth endpoints

## API Documentation

Interactive API docs are available at:

```
http://localhost:8000/docs
```

OpenAPI spec:
```
http://localhost:8000/openapi.json
```

### Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/forms | List creator's forms |
| POST | /api/forms | Create a form |
| POST | /api/forms/{formId}/publish | Publish a form |
| GET | /api/public/forms/{slug} | Get published form (public) |
| POST | /api/public/forms/{slug}/responses | Submit response (public, rate-limited) |
| GET | /api/forms/{formId}/responses | List responses |
| GET | /api/forms/{formId}/analytics/overview | Analytics KPIs |

## Seeded Forms

| Form | Visibility | Slug | Responses |
|------|-----------|------|-----------|
| Startup Feedback Flow | Public | startup-feedback-flow | 432 |
| Anime Convention RSVP | Public | anime-convention-rsvp | 218 |
| Game Dev Community Survey | Unlisted | gamedev-community-survey | 89 |

## Security

- Clerk JWT verification on all protected routes
- API key hashing (SHA-256, never stored in plaintext)
- Rate limiting with Redis sliding window (fails closed)
- Helmet security headers
- Request body size limit (1MB)
- Input validation with Zod on all endpoints
- Field ID validation on form submission
- CSS sanitization on custom themes
- Svix webhook signature verification
- Graceful shutdown handling

## Scripts

```bash
pnpm dev          # Start all apps in development
pnpm build        # Build all apps
pnpm lint         # Lint all packages
pnpm db:generate  # Generate Drizzle migrations
pnpm db:migrate   # Run migrations
```

## Environment Variables

See `.env.example` for all required variables:

- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `CLERK_SECRET_KEY` — Clerk backend secret
- `CLERK_PUBLISHABLE_KEY` — Clerk frontend key
- `CLERK_WEBHOOK_SECRET` — Svix webhook secret
- `RESEND_API_KEY` — Resend email API key
- `PORT` — API server port (default: 8000)
- `BASE_URL` — API base URL
- `NEXT_PUBLIC_API_URL` — API URL for frontend
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk key for frontend

## Deployment

Both apps include Dockerfiles for containerized deployment:

```bash
# Build API
docker build -f apps/api/Dockerfile -t prashn-api .

# Build Web
docker build -f apps/web/Dockerfile -t prashn-web .
```

## License

MIT

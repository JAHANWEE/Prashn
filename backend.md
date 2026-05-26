# CanvasForms — Backend Implementation Plan

## Overview

This document defines the complete backend implementation across the monorepo. Every package, service, route, middleware, and integration is specified here.

---

## Step-by-Step Implementation Order

### Step 1: Database Schema (Drizzle Models)
### Step 2: Redis Client + Rate Limiter
### Step 3: Clerk Auth Integration (Webhooks + Middleware)
### Step 4: tRPC Context + Auth Middleware
### Step 5: Form CRUD Routes
### Step 6: Form Fields CRUD Routes
### Step 7: Public Form Submission Routes
### Step 8: Response Management Routes
### Step 9: Analytics Routes
### Step 10: Theme Routes
### Step 11: API Key Management Routes
### Step 12: Email Notifications (Resend)
### Step 13: Seed Script
### Step 14: OpenAPI + Scalar Docs
### Step 15: Docker Compose + Deployment

---

## Package Architecture

```
packages/
├── database/          → Drizzle schema, migrations, db client
│   ├── models/        → One file per table (user.ts, form.ts, etc.)
│   ├── schema.ts      → Barrel export of all models
│   ├── index.ts       → db client export
│   ├── seed.ts        → Seed script for demo data
│   └── drizzle/       → Generated migrations
│
├── services/          → Business logic layer (no HTTP concerns)
│   ├── form/          → FormService (CRUD, publish, clone, archive)
│   ├── field/         → FieldService (CRUD, reorder, validate)
│   ├── response/      → ResponseService (submit, list, export)
│   ├── analytics/     → AnalyticsService (aggregate, query)
│   ├── theme/         → ThemeService (CRUD, system themes)
│   ├── api-key/       → ApiKeyService (generate, revoke, verify)
│   ├── email/         → EmailService (Resend integration)
│   ├── user/          → UserService (sync from Clerk, plan management)
│   └── clients/       → External clients (redis, resend, clerk)
│
├── trpc/              → tRPC router definitions + OpenAPI meta
│   ├── server/
│   │   ├── trpc.ts           → initTRPC with context + meta
│   │   ├── context.ts        → Request context (auth, db, redis)
│   │   ├── middleware/       → Auth guard, rate limiter, error handler
│   │   ├── routes/           → One folder per domain
│   │   │   ├── health/
│   │   │   ├── auth/
│   │   │   ├── forms/
│   │   │   ├── fields/
│   │   │   ├── responses/
│   │   │   ├── analytics/
│   │   │   ├── themes/
│   │   │   ├── api-keys/
│   │   │   └── public/       → Unauthenticated form submission
│   │   └── index.ts          → Root router composition
│   └── client/               → Client-side types + helpers
│
├── logger/            → Winston logger (existing)
└── typescript-config/ → Shared tsconfigs (existing)

apps/
├── api/               → Express server (tRPC + OpenAPI + Scalar)
└── web/               → Next.js frontend
```

---

## Step 1: Database Schema

### File: `packages/database/models/user.ts`
```typescript
// Update existing user model to add clerk_id
pgTable("users", {
  id: uuid pk defaultRandom
  clerk_id: varchar(255) unique notNull
  full_name: varchar(80) notNull
  email: varchar(255) unique notNull
  email_verified: boolean default(false)
  profile_image_url: text nullable
  plan: varchar(20) default("free") // "free" | "pro" | "team"
  created_at: timestamp defaultNow
  updated_at: timestamp $onUpdate
})
```

### File: `packages/database/models/form.ts`
```typescript
pgTable("forms", {
  id: uuid pk defaultRandom
  creator_id: uuid references(users.id) notNull
  title: varchar(255) notNull
  description: text nullable
  slug: varchar(100) unique notNull
  status: varchar(20) notNull default("draft") // draft|published|unpublished|archived
  visibility: varchar(20) notNull default("public") // public|unlisted
  theme_id: uuid references(themes.id) nullable
  settings: jsonb default({})
  expires_at: timestamp nullable
  response_limit: integer nullable
  password_hash: text nullable
  published_at: timestamp nullable
  created_at: timestamp defaultNow
  updated_at: timestamp $onUpdate
})
```

### File: `packages/database/models/form-field.ts`
```typescript
pgTable("form_fields", {
  id: uuid pk defaultRandom
  form_id: uuid references(forms.id, onDelete: cascade) notNull
  label: varchar(500) notNull
  description: text nullable
  field_type: varchar(30) notNull // short_text|long_text|email|number|single_select|multi_select|checkbox|dropdown|rating|date
  placeholder: text nullable
  options: jsonb nullable // [{label, value}]
  validations: jsonb nullable // {min, max, min_length, max_length, pattern, custom_message}
  required: boolean default(false)
  position: integer notNull
  page: integer default(1)
  conditional_logic: jsonb nullable
  created_at: timestamp defaultNow
  updated_at: timestamp $onUpdate
})
```

### File: `packages/database/models/theme.ts`
```typescript
pgTable("themes", {
  id: uuid pk defaultRandom
  name: varchar(100) notNull
  creator_id: uuid references(users.id) nullable // null = system
  is_system: boolean default(false)
  primary_color: varchar(7) notNull
  background_color: varchar(7) notNull
  text_color: varchar(7) notNull
  font_family: varchar(50) default("Inter")
  border_radius: varchar(10) default("8px")
  logo_url: text nullable
  cover_image_url: text nullable
  custom_css: text nullable
  created_at: timestamp defaultNow
  updated_at: timestamp $onUpdate
})
```

### File: `packages/database/models/response.ts`
```typescript
pgTable("responses", {
  id: uuid pk defaultRandom
  form_id: uuid references(forms.id) notNull
  respondent_email: varchar(255) nullable
  respondent_name: varchar(100) nullable
  status: varchar(20) notNull default("in_progress") // completed|abandoned|in_progress
  started_at: timestamp defaultNow
  completed_at: timestamp nullable
  duration_seconds: integer nullable
  metadata: jsonb nullable // {ip, user_agent, referrer, source}
  created_at: timestamp defaultNow
})
```

### File: `packages/database/models/response-answer.ts`
```typescript
pgTable("response_answers", {
  id: uuid pk defaultRandom
  response_id: uuid references(responses.id, onDelete: cascade) notNull
  field_id: uuid references(form_fields.id) notNull
  value: text nullable
  created_at: timestamp defaultNow
})
```

### File: `packages/database/models/form-analytics.ts`
```typescript
pgTable("form_analytics", {
  id: uuid pk defaultRandom
  form_id: uuid references(forms.id) notNull
  date: date notNull
  views: integer default(0)
  starts: integer default(0)
  completions: integer default(0)
  abandons: integer default(0)
  avg_duration_seconds: integer nullable
  created_at: timestamp defaultNow
})
// Unique constraint: (form_id, date)
```

### File: `packages/database/models/field-analytics.ts`
```typescript
pgTable("field_analytics", {
  id: uuid pk defaultRandom
  field_id: uuid references(form_fields.id) notNull
  form_id: uuid references(forms.id) notNull
  date: date notNull
  views: integer default(0)
  drop_offs: integer default(0)
  avg_time_seconds: integer nullable
  created_at: timestamp defaultNow
})
// Unique constraint: (field_id, date)
```

### File: `packages/database/models/email-notification.ts`
```typescript
pgTable("email_notifications", {
  id: uuid pk defaultRandom
  user_id: uuid references(users.id) notNull
  form_id: uuid references(forms.id) nullable
  type: varchar(30) notNull // new_response|form_published|response_limit_reached|form_expired
  subject: varchar(255) notNull
  body: text notNull
  sent_at: timestamp nullable
  status: varchar(20) default("pending") // pending|sent|failed
  resend_id: text nullable // Resend message ID for tracking
  created_at: timestamp defaultNow
})
```

### File: `packages/database/models/api-key.ts`
```typescript
pgTable("api_keys", {
  id: uuid pk defaultRandom
  user_id: uuid references(users.id) notNull
  name: varchar(100) notNull
  key_hash: text notNull
  key_prefix: varchar(12) notNull // visible prefix for UI
  last_used_at: timestamp nullable
  expires_at: timestamp nullable
  revoked_at: timestamp nullable
  created_at: timestamp defaultNow
})
```

---

## Step 2: Redis Client + Rate Limiter

### File: `packages/services/clients/redis.ts`
```typescript
// ioredis client with connection pooling
// Exports: redisClient, disconnect()
// Config from env: REDIS_URL
```

### File: `packages/services/rate-limiter/index.ts`
```typescript
// Sliding window rate limiter using Redis sorted sets
// Lua script for atomic: ZADD + ZREMRANGEBYSCORE + ZCARD
// Exports: checkRateLimit(identifier, endpoint, limit, windowMs)
// Returns: { allowed: boolean, remaining: number, resetAt: Date }
```

### Rate Limit Tiers:
| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /public/forms/:slug/responses` | 60 | 1 minute |
| API key authenticated requests | 10,000 | 1 hour |
| `POST /auth/*` | 10 | 1 minute |
| General authenticated | 1,000 | 1 minute |

---

## Step 3: Clerk Auth Integration

### File: `apps/api/src/webhooks/clerk.ts`
```typescript
// POST /webhooks/clerk
// Verifies Svix signature
// Handles events: user.created, user.updated, user.deleted
// Upserts user in our DB from Clerk payload
```

### File: `packages/services/clients/clerk.ts`
```typescript
// Clerk SDK client for JWT verification
// Exports: verifyClerkToken(token) → { userId, email, ... }
```

### Environment Variables:
```
CLERK_SECRET_KEY=sk_live_***
CLERK_PUBLISHABLE_KEY=pk_live_***
CLERK_WEBHOOK_SECRET=whsec_***
```

---

## Step 4: tRPC Context + Auth Middleware

### File: `packages/trpc/server/context.ts`
```typescript
// Extract Authorization header → verify Clerk JWT
// Lookup user in DB by clerk_id
// Return: { user: User | null, db, redis }
```

### File: `packages/trpc/server/middleware/auth.ts`
```typescript
// protectedProcedure: Requires valid user in context
// Throws UNAUTHORIZED if no user
```

### File: `packages/trpc/server/middleware/rate-limit.ts`
```typescript
// rateLimitedProcedure: Checks Redis rate limit before proceeding
// Injects X-RateLimit-* headers into response
```

### File: `packages/trpc/server/middleware/error-handler.ts`
```typescript
// Global error formatter
// Maps Drizzle errors → user-friendly messages
// Maps Zod errors → field-level validation errors
// Logs errors via @repo/logger
```

---

## Step 5: Form CRUD Routes

### File: `packages/trpc/server/routes/forms/route.ts`

| Procedure | Method | Path | Auth | Description |
|-----------|--------|------|------|-------------|
| `create` | POST | `/forms` | ✅ | Create new form (auto-generates slug) |
| `list` | GET | `/forms` | ✅ | List creator's forms (paginated, filterable) |
| `getById` | GET | `/forms/:id` | ✅ | Get form with fields |
| `update` | PATCH | `/forms/:id` | ✅ | Update title, description, settings |
| `publish` | POST | `/forms/:id/publish` | ✅ | Set status=published, published_at=now |
| `unpublish` | POST | `/forms/:id/unpublish` | ✅ | Set status=unpublished |
| `archive` | POST | `/forms/:id/archive` | ✅ | Set status=archived |
| `clone` | POST | `/forms/:id/clone` | ✅ | Deep copy form + fields |
| `delete` | DELETE | `/forms/:id` | ✅ | Soft delete (archive) |
| `updateVisibility` | PATCH | `/forms/:id/visibility` | ✅ | Toggle public/unlisted |

---

## Step 6: Form Fields CRUD Routes

### File: `packages/trpc/server/routes/fields/route.ts`

| Procedure | Method | Path | Auth | Description |
|-----------|--------|------|------|-------------|
| `create` | POST | `/forms/:formId/fields` | ✅ | Add field to form |
| `list` | GET | `/forms/:formId/fields` | ✅ | List fields ordered by position |
| `update` | PATCH | `/fields/:id` | ✅ | Update field properties |
| `delete` | DELETE | `/fields/:id` | ✅ | Remove field, reorder remaining |
| `reorder` | POST | `/forms/:formId/fields/reorder` | ✅ | Bulk update positions |

---

## Step 7: Public Form Submission Routes

### File: `packages/trpc/server/routes/public/route.ts`

| Procedure | Method | Path | Auth | Rate Limited | Description |
|-----------|--------|------|------|--------------|-------------|
| `getForm` | GET | `/public/forms/:slug` | ❌ | ✅ | Get published form for respondents |
| `submitResponse` | POST | `/public/forms/:slug/responses` | ❌ | ✅ | Submit form response |
| `listPublicForms` | GET | `/public/forms` | ❌ | ✅ | List public+published forms (explore page) |

### Validation Logic:
1. Check form exists and status === "published"
2. Check form not expired
3. Check response_limit not reached
4. Check password if password_hash set
5. Validate each answer against field_type + validations (Zod)
6. Create response + response_answers in transaction
7. Update form_analytics (increment completions)
8. Trigger email notification to creator (async)

---

## Step 8: Response Management Routes

### File: `packages/trpc/server/routes/responses/route.ts`

| Procedure | Method | Path | Auth | Description |
|-----------|--------|------|------|-------------|
| `list` | GET | `/forms/:formId/responses` | ✅ | Paginated responses with filters |
| `getById` | GET | `/responses/:id` | ✅ | Single response with all answers |
| `export` | GET | `/forms/:formId/responses/export` | ✅ | CSV export |
| `delete` | DELETE | `/responses/:id` | ✅ | Delete single response |
| `bulkDelete` | POST | `/forms/:formId/responses/bulk-delete` | ✅ | Delete multiple |

### Filters:
- `status`: completed | abandoned | in_progress
- `dateFrom` / `dateTo`: Date range
- `search`: Email or name search
- `page` / `limit`: Pagination (default 20)
- `sortBy` / `sortOrder`: created_at, completed_at, duration

---

## Step 9: Analytics Routes

### File: `packages/trpc/server/routes/analytics/route.ts`

| Procedure | Method | Path | Auth | Description |
|-----------|--------|------|------|-------------|
| `overview` | GET | `/forms/:formId/analytics/overview` | ✅ | KPI summary (total, rate, avg time) |
| `timeline` | GET | `/forms/:formId/analytics/timeline` | ✅ | Daily response counts for chart |
| `fieldDropoff` | GET | `/forms/:formId/analytics/dropoff` | ✅ | Per-field retention data |
| `fieldDistribution` | GET | `/forms/:formId/analytics/distribution/:fieldId` | ✅ | Answer distribution for a field |
| `recordView` | POST | `/public/forms/:slug/view` | ❌ | Increment daily view count |

---

## Step 10: Theme Routes

### File: `packages/trpc/server/routes/themes/route.ts`

| Procedure | Method | Path | Auth | Description |
|-----------|--------|------|------|-------------|
| `list` | GET | `/themes` | ✅ | System themes + user's custom themes |
| `create` | POST | `/themes` | ✅ | Create custom theme |
| `update` | PATCH | `/themes/:id` | ✅ | Update custom theme |
| `delete` | DELETE | `/themes/:id` | ✅ | Delete custom theme |

---

## Step 11: API Key Management Routes

### File: `packages/trpc/server/routes/api-keys/route.ts`

| Procedure | Method | Path | Auth | Description |
|-----------|--------|------|------|-------------|
| `list` | GET | `/api-keys` | ✅ | List user's API keys |
| `create` | POST | `/api-keys` | ✅ | Generate new key (returns full key once) |
| `revoke` | POST | `/api-keys/:id/revoke` | ✅ | Revoke key |
| `delete` | DELETE | `/api-keys/:id` | ✅ | Delete key |

---

## Step 12: Email Notifications (Resend)

### File: `packages/services/email/index.ts`
```typescript
// EmailService class
// Methods:
//   sendNewResponseNotification(creatorEmail, formTitle, responseCount)
//   sendFormPublishedConfirmation(creatorEmail, formTitle, formUrl)
//   sendResponseLimitReached(creatorEmail, formTitle, limit)
//   sendFormExpired(creatorEmail, formTitle)
//
// Uses Resend SDK
// Logs to email_notifications table
// Templates: HTML email templates with CanvasForms branding
```

### File: `packages/services/clients/resend.ts`
```typescript
// Resend client initialization
// Env: RESEND_API_KEY, RESEND_FROM_EMAIL
```

---

## Step 13: Seed Script

### File: `packages/database/seed.ts`
```typescript
// Run with: pnpm db:seed
// Creates:
//   1. Demo user (admin@canvasforms.io, clerk synced)
//   2. 4 system themes
//   3. 3 sample forms with fields:
//      - "Startup Feedback Flow" (public, 7 fields, 432 responses)
//      - "Anime Convention RSVP" (public, 5 fields, 218 responses)
//      - "Game Dev Survey" (unlisted, 10 fields, 89 responses)
//   4. Randomized responses with realistic data
//   5. 30 days of analytics data
//   6. 1 API key for demo user
```

---

## Step 14: OpenAPI + Scalar Docs

### Updates to `apps/api/src/server.ts`:
- Update title to "CanvasForms API"
- Add proper description, version, tags
- Group endpoints by tag: Forms, Fields, Responses, Analytics, Themes, API Keys, Public
- Scalar UI at `/docs`
- OpenAPI JSON at `/openapi.json`

---

## Step 15: Docker Compose + Deployment

### File: `docker-compose.yml` (root)
```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: canvasforms
      POSTGRES_USER: canvasforms
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    environment:
      - DATABASE_URL=postgresql://canvasforms:${DB_PASSWORD}@postgres:5432/canvasforms
      - REDIS_URL=redis://redis:6379
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      - RESEND_API_KEY=${RESEND_API_KEY}
    depends_on:
      - postgres
      - redis
    ports:
      - "8000:8000"

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    environment:
      - NEXT_PUBLIC_API_URL=http://api:8000
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${CLERK_PUBLISHABLE_KEY}
    depends_on:
      - api
    ports:
      - "3000:3000"

volumes:
  pgdata:
```

---

## Error Handling Strategy

| Layer | Approach |
|-------|----------|
| Zod validation | Auto-formatted field errors via tRPC error formatter |
| DB constraints | Catch unique violations → 409 Conflict |
| Auth failures | 401 Unauthorized with clear message |
| Rate limits | 429 Too Many Requests + Retry-After header |
| Not found | 404 with resource type in message |
| Server errors | 500 with correlation ID, full error logged |

---

## Security Checklist

- [ ] Clerk JWT verification on every protected route
- [ ] API key hashing (SHA-256, never store raw)
- [ ] Form password hashing (bcrypt)
- [ ] Rate limiting on all public endpoints
- [ ] Input sanitization via Zod schemas
- [ ] SQL injection prevention (Drizzle parameterized queries)
- [ ] CORS restricted to frontend origin in production
- [ ] Webhook signature verification (Svix for Clerk)
- [ ] No sensitive data in error responses
- [ ] UUID-based IDs (no sequential guessing)

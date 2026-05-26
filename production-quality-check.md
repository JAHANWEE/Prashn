# CanvasForms — Production Quality Checklist

Use this document to verify every aspect of the implementation meets production standards before deployment.

---

## 1. Database Quality

| Check | Status | Notes |
|-------|--------|-------|
| All tables have UUID primary keys | ☐ | No sequential IDs |
| All foreign keys have proper ON DELETE behavior | ☐ | CASCADE for child records, SET NULL for optional refs |
| All timestamps use `timestamp with time zone` | ☐ | |
| Indexes exist for all frequently queried columns | ☐ | See db-design.md index section |
| Unique constraints on slug, email, clerk_id, key_hash | ☐ | |
| JSONB columns have sensible defaults (`{}` or `null`) | ☐ | |
| Migrations are clean and reversible | ☐ | `drizzle-kit generate` produces clean SQL |
| Seed script creates realistic demo data | ☐ | 3 forms, 700+ responses, 30 days analytics |
| No raw SQL — all queries via Drizzle ORM | ☐ | |
| Connection pooling configured | ☐ | pg pool with max connections |

---

## 2. Authentication & Authorization

| Check | Status | Notes |
|-------|--------|-------|
| Clerk JWT verified on every protected route | ☐ | Via tRPC middleware |
| Clerk webhook signature verified (Svix) | ☐ | Prevents spoofed events |
| User synced to DB on webhook events | ☐ | user.created, user.updated, user.deleted |
| Protected routes return 401 without valid token | ☐ | |
| Users can only access their own forms/responses | ☐ | creator_id check in every query |
| API keys are hashed (SHA-256) before storage | ☐ | Raw key shown only once on creation |
| API key auth works as alternative to Clerk JWT | ☐ | For programmatic access |
| Revoked/expired API keys are rejected | ☐ | |
| Form passwords are hashed with bcrypt | ☐ | |
| No auth tokens logged or exposed in errors | ☐ | |

---

## 3. API Design & Validation

| Check | Status | Notes |
|-------|--------|-------|
| All inputs validated with Zod schemas | ☐ | No unvalidated user input reaches DB |
| All outputs have defined Zod schemas | ☐ | Type-safe responses |
| Pagination on all list endpoints | ☐ | page + limit with sensible defaults |
| Consistent error response format | ☐ | `{ code, message, details? }` |
| HTTP status codes are correct | ☐ | 200/201/204/400/401/403/404/409/429/500 |
| OpenAPI spec generated from tRPC routes | ☐ | Via trpc-to-openapi |
| Scalar docs accessible at /docs | ☐ | |
| All endpoints tagged and grouped | ☐ | Forms, Fields, Responses, etc. |
| Rate limit headers on every response | ☐ | X-RateLimit-Limit, Remaining, Reset |
| CORS configured for production origin only | ☐ | |

---

## 4. Rate Limiting & Spam Protection

| Check | Status | Notes |
|-------|--------|-------|
| Redis sliding window implementation | ☐ | Lua script for atomicity |
| Public submission: 60 req/min per IP | ☐ | |
| API key: 10,000 req/hour per key | ☐ | |
| Auth endpoints: 10 req/min per IP | ☐ | |
| 429 response includes Retry-After header | ☐ | |
| Rate limit state survives server restart | ☐ | Stored in Redis, not memory |
| Graceful degradation if Redis is down | ☐ | Allow requests, log warning |

---

## 5. Form Submission Flow

| Check | Status | Notes |
|-------|--------|-------|
| Only published forms accept responses | ☐ | |
| Expired forms return proper error | ☐ | |
| Response limit enforced | ☐ | |
| Password-protected forms require correct password | ☐ | |
| Unlisted forms not shown in public listings | ☐ | |
| Public forms shown in explore/template pages | ☐ | |
| Invalid/unpublished slugs return 404 gracefully | ☐ | |
| Each answer validated against field type + rules | ☐ | Zod dynamic validation |
| Required fields enforced | ☐ | |
| Response + answers created in DB transaction | ☐ | Atomic — no partial submissions |
| Analytics updated on submission | ☐ | Increment completions count |
| Email notification sent to creator | ☐ | Async, non-blocking |
| Confirmation/thank-you response returned | ☐ | |

---

## 6. Email Notifications

| Check | Status | Notes |
|-------|--------|-------|
| Resend SDK configured with API key | ☐ | |
| From address verified in Resend | ☐ | |
| New response notification works | ☐ | |
| Form published confirmation works | ☐ | |
| Response limit reached alert works | ☐ | |
| Form expired notification works | ☐ | |
| Email status tracked in DB | ☐ | pending → sent / failed |
| Resend message ID stored for debugging | ☐ | |
| Email sending is non-blocking | ☐ | Fire-and-forget, errors logged |
| HTML templates are branded | ☐ | CanvasForms styling |

---

## 7. Error Handling

| Check | Status | Notes |
|-------|--------|-------|
| Global error handler catches all unhandled errors | ☐ | |
| Zod errors formatted as field-level messages | ☐ | |
| DB unique constraint → 409 Conflict | ☐ | |
| DB not found → 404 | ☐ | |
| Auth errors → 401/403 | ☐ | |
| Rate limit → 429 | ☐ | |
| Server errors → 500 with correlation ID | ☐ | |
| No stack traces in production responses | ☐ | |
| All errors logged with context | ☐ | Winston structured logging |
| Graceful shutdown on SIGTERM/SIGINT | ☐ | Close DB pool, Redis, HTTP server |

---

## 8. Performance

| Check | Status | Notes |
|-------|--------|-------|
| DB queries use indexes (no full table scans) | ☐ | |
| Pagination prevents unbounded queries | ☐ | |
| Analytics queries are pre-aggregated (daily) | ☐ | Not computed on-the-fly |
| Response export streams CSV (not loads all in memory) | ☐ | |
| Redis connection pooled | ☐ | |
| No N+1 queries in list endpoints | ☐ | Use joins or batch queries |
| Static assets served with cache headers | ☐ | |
| API response times < 200ms for CRUD | ☐ | |
| Bulk operations use transactions | ☐ | |

---

## 9. Code Quality

| Check | Status | Notes |
|-------|--------|-------|
| TypeScript strict mode enabled | ☐ | noUncheckedIndexedAccess, strict |
| No `any` types | ☐ | |
| All exports properly typed | ☐ | |
| Consistent naming conventions | ☐ | camelCase vars, PascalCase types, snake_case DB |
| Service layer separated from route layer | ☐ | Business logic in services/ |
| No business logic in route handlers | ☐ | Routes only validate + delegate |
| Shared Zod schemas between client/server | ☐ | |
| Environment variables validated with Zod | ☐ | Fail fast on missing config |
| No hardcoded values (use env/constants) | ☐ | |
| ESLint passes with 0 warnings | ☐ | |

---

## 10. Deployment Readiness

| Check | Status | Notes |
|-------|--------|-------|
| Docker Compose file works | ☐ | `docker compose up` starts everything |
| Dockerfiles for api and web are optimized | ☐ | Multi-stage builds, small images |
| Environment variables documented | ☐ | .env.example with all required vars |
| Database migrations run on startup | ☐ | Or via deploy script |
| Seed script can be run independently | ☐ | `pnpm db:seed` |
| Health check endpoint works | ☐ | `/health` returns 200 |
| Graceful shutdown implemented | ☐ | |
| Logs are structured JSON | ☐ | For log aggregation |
| No secrets in code or git history | ☐ | |
| README has setup instructions | ☐ | |

---

## 11. Demo Readiness (Hackathon Specific)

| Check | Status | Notes |
|-------|--------|-------|
| Demo credentials in README | ☐ | admin@canvasforms.io / canvas_demo_2024 |
| 3+ themed sample forms seeded | ☐ | Startup, Anime, Gaming |
| Each form has 50+ responses | ☐ | Realistic data |
| Analytics data for 30 days | ☐ | |
| Public forms visible on explore page | ☐ | |
| Unlisted form only accessible via direct link | ☐ | |
| API docs accessible at /docs | ☐ | |
| API key pre-generated for demo user | ☐ | |
| All pages load without errors | ☐ | |
| Mobile responsive | ☐ | |
| No console errors in browser | ☐ | |
| Deployed URL is stable and fast | ☐ | |

---

## 12. Security

| Check | Status | Notes |
|-------|--------|-------|
| No SQL injection possible | ☐ | Drizzle ORM parameterized |
| No XSS in stored content | ☐ | Sanitize on output |
| CSRF protection (Clerk handles for auth) | ☐ | |
| Rate limiting prevents brute force | ☐ | |
| API keys never logged | ☐ | |
| Passwords never returned in responses | ☐ | |
| File uploads validated (if implemented) | ☐ | |
| HTTPS enforced in production | ☐ | Nginx SSL termination |
| Security headers set (HSTS, X-Frame, etc.) | ☐ | |
| Dependencies have no critical vulnerabilities | ☐ | `pnpm audit` |

---

## Sign-off

| Reviewer | Date | Status |
|----------|------|--------|
| Developer | | ☐ All checks pass |
| Self-review | | ☐ Code reviewed |
| Demo tested | | ☐ End-to-end flow works |

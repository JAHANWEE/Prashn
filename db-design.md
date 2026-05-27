# Prashn — Database Design

## Architecture Decisions

- **Auth**: Clerk (hosted auth) + Google OAuth provider. Clerk manages sessions, JWTs, and user sync. We store a `users` table synced via Clerk webhooks for relational data.
- **Email**: Resend for transactional emails (new response alerts, publish confirmations).
- **Rate Limiting**: Redis-based sliding window (production-grade). No DB table needed — use `ioredis` with Lua scripts for atomic window operations.
- **Deployment**: Self-hosted VM (Docker Compose: Postgres + Redis + API + Web).

## Entity Relationship Diagram (Eraser Format)

```
users [icon: user, color: blue] {
  id uuid pk
  clerk_id varchar(255) unique // Clerk's external user ID
  full_name varchar(80)
  email varchar(255) unique
  email_verified boolean default false
  profile_image_url text nullable
  plan varchar(20) default "free" // "free" | "pro" | "team"
  created_at timestamp
  updated_at timestamp
}

forms [icon: file-text, color: purple] {
  id uuid pk
  creator_id uuid fk
  title varchar(255)
  description text nullable
  slug varchar(100) unique
  status varchar(20) // "draft" | "published" | "unpublished" | "archived"
  visibility varchar(20) // "public" | "unlisted"
  theme_id uuid fk nullable
  settings jsonb // { allow_multiple_submissions, show_progress_bar, confirmation_message, redirect_url }
  expires_at timestamp nullable
  response_limit integer nullable
  password_hash text nullable // for password-protected forms
  published_at timestamp nullable
  created_at timestamp
  updated_at timestamp
}

form_fields [icon: list, color: green] {
  id uuid pk
  form_id uuid fk
  label varchar(500)
  description text nullable
  field_type varchar(30) // "short_text" | "long_text" | "email" | "number" | "single_select" | "multi_select" | "checkbox" | "dropdown" | "rating" | "date"
  placeholder text nullable
  options jsonb nullable // for select/dropdown: [{ label, value }]
  validations jsonb nullable // { min, max, min_length, max_length, pattern, custom_message }
  required boolean default false
  position integer // ordering within the form
  page integer default 1 // for multi-page forms
  conditional_logic jsonb nullable // { show_if: { field_id, operator, value } }
  created_at timestamp
  updated_at timestamp
}

themes [icon: palette, color: orange] {
  id uuid pk
  name varchar(100)
  creator_id uuid fk nullable // null = system theme
  is_system boolean default false
  primary_color varchar(7)
  background_color varchar(7)
  text_color varchar(7)
  font_family varchar(50)
  border_radius varchar(10)
  logo_url text nullable
  cover_image_url text nullable
  custom_css text nullable
  created_at timestamp
  updated_at timestamp
}

responses [icon: inbox, color: teal] {
  id uuid pk
  form_id uuid fk
  respondent_email varchar(255) nullable
  respondent_name varchar(100) nullable
  status varchar(20) // "completed" | "abandoned" | "in_progress"
  started_at timestamp
  completed_at timestamp nullable
  duration_seconds integer nullable
  metadata jsonb nullable // { ip, user_agent, referrer, source }
  created_at timestamp
}

response_answers [icon: check-circle, color: cyan] {
  id uuid pk
  response_id uuid fk
  field_id uuid fk
  value text nullable // serialized answer
  created_at timestamp
}

form_analytics [icon: bar-chart, color: red] {
  id uuid pk
  form_id uuid fk
  date date
  views integer default 0
  starts integer default 0
  completions integer default 0
  abandons integer default 0
  avg_duration_seconds integer nullable
  created_at timestamp
}

field_analytics [icon: pie-chart, color: pink] {
  id uuid pk
  field_id uuid fk
  form_id uuid fk
  date date
  views integer default 0
  drop_offs integer default 0
  avg_time_seconds integer nullable
  created_at timestamp
}

email_notifications [icon: mail, color: yellow] {
  id uuid pk
  user_id uuid fk
  form_id uuid fk nullable
  type varchar(30) // "new_response" | "form_published" | "response_limit_reached" | "form_expired"
  subject varchar(255)
  body text
  sent_at timestamp nullable
  status varchar(20) // "pending" | "sent" | "failed"
  created_at timestamp
}

api_keys [icon: key, color: gray] {
  id uuid pk
  user_id uuid fk
  name varchar(100)
  key_hash text
  key_prefix varchar(12) // "sk_live_51M8X" for display
  last_used_at timestamp nullable
  expires_at timestamp nullable
  revoked_at timestamp nullable
  created_at timestamp
}

rate_limits [icon: shield, color: red] {
  // NOT a DB table — handled by Redis sliding window
  // Key pattern: "rl:{identifier}:{endpoint}:{window}"
  // Uses ioredis + Lua scripts for atomic increment + TTL
}

// Relationships
users.id < forms.creator_id
users.id < themes.creator_id
users.id < email_notifications.user_id
users.id < api_keys.user_id
forms.id < form_fields.form_id
forms.id < responses.form_id
forms.id < form_analytics.form_id
forms.id < field_analytics.form_id
forms.id < email_notifications.form_id
form_fields.id < response_answers.field_id
form_fields.id < field_analytics.field_id
responses.id < response_answers.response_id
themes.id < forms.theme_id
```

---

## Table Descriptions

### `users`
Core user table. Synced from Clerk via webhooks. `clerk_id` is the primary external identifier. Supports Google OAuth (Clerk handles the OAuth flow, we store the resulting user). Tracks plan tier for feature gating.

### `forms`
The central entity. Each form has a unique slug for public URLs, a status lifecycle (draft → published → unpublished → archived), and visibility control (public vs unlisted). Supports optional password protection, expiry dates, and response limits.

### `form_fields`
Dynamic form schema. Each field has a type, position for ordering, page number for multi-page forms, optional validation rules (stored as JSONB), and conditional logic for branching.

### `themes`
Visual themes applied to forms. System themes are pre-seeded; users can create custom themes. Stores colors, fonts, border radius, and optional branding assets.

### `responses`
Each form submission. Tracks status (completed/abandoned/in_progress), timing data for analytics, and optional respondent info.

### `response_answers`
Individual field answers within a response. Value is stored as text (serialized) to support all field types uniformly.

### `form_analytics`
Daily aggregated analytics per form. Tracks views, starts, completions, abandons, and average duration. Populated by background jobs or on-write aggregation.

### `field_analytics`
Per-field daily analytics for drop-off analysis. Tracks how many users saw each field and how many dropped off at that point.

### `email_notifications`
Email queue/log for creator notifications. Supports new response alerts, publish confirmations, limit warnings, and expiry notices.

### `api_keys`
Developer API keys for programmatic access. Stores hashed keys with a visible prefix for identification. Supports revocation and expiry.

### `rate_limits`
**Not a database table.** Handled entirely in Redis using sliding window counters with Lua scripts for atomicity. Key pattern: `rl:{ip_or_api_key}:{endpoint}:{window_timestamp}`. TTL auto-expires old windows.

---

## Auth Flow (Clerk + Google)

```
User clicks "Sign In with Google" on custom login screen
  → Clerk handles OAuth flow (hosted or embedded)
  → Clerk creates/updates user record
  → Clerk fires webhook to /api/webhooks/clerk
  → API upserts user in our `users` table (clerk_id as key)
  → Clerk JWT is sent with every request
  → tRPC middleware verifies JWT via Clerk SDK
  → Extracts clerk_id → looks up internal user_id for DB queries
```

---

## Rate Limiting (Redis)

```
Architecture:
  - ioredis client connected to Redis instance
  - Sliding window algorithm via Lua script
  - Key: "rl:{identifier}:{endpoint}" with sorted set of timestamps
  - On each request: ZADD timestamp, ZREMRANGEBYSCORE (remove old), ZCARD (count)
  - If count > limit → 429 Too Many Requests
  - Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

Limits:
  - Public form submission: 60 requests/minute per IP
  - API key requests: 10,000 requests/hour per key
  - Auth endpoints: 10 requests/minute per IP
```

---

## Field Types Supported

| Type | DB `field_type` | Options | Validations |
|------|----------------|---------|-------------|
| Short Text | `short_text` | — | min_length, max_length, pattern |
| Long Text | `long_text` | — | min_length, max_length |
| Email | `email` | — | pattern (auto) |
| Number | `number` | — | min, max |
| Single Select | `single_select` | `[{label, value}]` | — |
| Multi Select | `multi_select` | `[{label, value}]` | min, max (selections) |
| Checkbox | `checkbox` | — | — |
| Dropdown | `dropdown` | `[{label, value}]` | — |
| Rating | `rating` | — | max (scale) |
| Date | `date` | — | min, max (date range) |

---

## Visibility & Access Matrix

| Status | Visibility | Public Explore | Direct Link | Accepts Responses |
|--------|-----------|---------------|-------------|-------------------|
| draft | — | ❌ | ❌ | ❌ |
| published | public | ✅ | ✅ | ✅ |
| published | unlisted | ❌ | ✅ | ✅ |
| unpublished | — | ❌ | ❌ (shows "unavailable") | ❌ |
| archived | — | ❌ | ❌ | ❌ |

---

## Indexes (Performance)

```sql
-- Forms
CREATE INDEX idx_forms_creator ON forms(creator_id);
CREATE INDEX idx_forms_slug ON forms(slug);
CREATE INDEX idx_forms_status_visibility ON forms(status, visibility);

-- Fields
CREATE INDEX idx_fields_form_position ON form_fields(form_id, position);

-- Responses
CREATE INDEX idx_responses_form ON responses(form_id);
CREATE INDEX idx_responses_form_status ON responses(form_id, status);
CREATE INDEX idx_responses_created ON responses(form_id, created_at DESC);

-- Response Answers
CREATE INDEX idx_answers_response ON response_answers(response_id);
CREATE INDEX idx_answers_field ON response_answers(field_id);

-- Analytics
CREATE INDEX idx_form_analytics_form_date ON form_analytics(form_id, date);
CREATE INDEX idx_field_analytics_field_date ON field_analytics(field_id, date);

-- Rate Limits (handled by Redis, not DB)

-- API Keys
CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
```

---

## Seed Data Plan

For demo-readiness, seed the following:

1. **Demo User**: `admin@prashn.io` / `canvas_demo_2024` (Pro plan)
2. **3 Themed Forms**:
   - "Startup Feedback Flow" (public, published, 7 fields, ~400 responses)
   - "Anime Convention RSVP" (public, published, 5 fields, ~200 responses)
   - "Game Dev Survey" (unlisted, published, 10 fields, ~100 responses)
3. **System Themes**: Dark Indigo (default), Sunset Orange, Forest Green, Midnight Blue
4. **Analytics Data**: 30 days of daily aggregated data per form
5. **API Key**: One active key for the demo user

---

## Notes

- All IDs are UUIDs for security (no sequential guessing)
- JSONB columns for flexible schema (validations, options, conditional logic, settings, metadata)
- Timestamps use `timestamp with time zone` in production
- `response_answers.value` is text to handle all types uniformly; application layer handles serialization/deserialization based on field_type
- Rate limiting is Redis-based (sliding window with Lua scripts) — no DB table
- Email notifications are queued via Resend's API (fire-and-forget with status tracking in DB)
- Clerk handles all auth complexity (password hashing, OAuth, sessions, JWTs)
- Our DB only stores the user profile synced from Clerk for relational queries

---

## Deployment Architecture (VM)

```
Docker Compose on VM:
├── postgres:16 (port 5432)
├── redis:7 (port 6379)
├── api (Express + tRPC, port 8000)
├── web (Next.js, port 3000)
└── nginx (reverse proxy, SSL termination)

Environment:
  - DATABASE_URL=postgresql://prashn:***@postgres:5432/prashn
  - REDIS_URL=redis://redis:6379
  - CLERK_SECRET_KEY=sk_live_***
  - CLERK_PUBLISHABLE_KEY=pk_live_***
  - RESEND_API_KEY=re_***
  - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_***
  - NEXT_PUBLIC_API_URL=https://api.prashn.io
```

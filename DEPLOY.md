# RealStyler — Deployment & Launch Runbook

Architecture (chosen topology: **single root domain**):

```
app.<domain>      → Next.js client (Vercel)
api.<domain>      → Express server (Docker host, e.g. Railway)  ← this repo's Dockerfile
Supabase          → Postgres + Storage (region: Sydney / ap-southeast-2)
Managed Redis     → sessions + job state (rediss://)
Stripe            → billing
Resend            → transactional email (verification / password reset)
```

First-party cookies work because client + API share `<domain>` — keep
`SameSite=Lax`, set `COOKIE_DOMAIN=.<domain>`, serve both over HTTPS.

---

## 1. External services to provision

Provide these values via each host's secret store (never commit them). Full list
+ descriptions: [`apps/server/.env.example`](apps/server/.env.example) and
[`apps/client/.env.example`](apps/client/.env.example).

### Supabase (prod project)
- Create the project in **ap-southeast-2 (Sydney)** (region can't change later).
- Enable **PITR** (Pro plan) + storage backups.
- Create two storage buckets:
  - `restyled-images` — **private** (project/styled/tmp/generated images; served via signed URLs).
  - `public-assets` — **public** (avatars, style presets). *(bucket split is Phase 4.)*
- Env: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (rotate the old one), `SUPABASE_BUCKET_NAME`.
- DB: `DATABASE_URL` = transaction pooler URL + `?pgbouncer=true&connection_limit=10&sslmode=require`;
  `DIRECT_URL` = direct connection (for `prisma migrate deploy`). *(DIRECT_URL wired in Phase 4.)*

### Stripe
- Create 2 recurring **Prices** → `STRIPE_PRICE_ID_PRO`, `STRIPE_PRICE_ID_PRO_PLUS`.
- `STRIPE_SECRET_KEY`.
- Add a **webhook endpoint** → `https://api.<domain>/webhooks/stripe`, subscribe to:
  `checkout.session.completed`, `customer.subscription.created|updated|deleted`,
  `invoice.paid`, `invoice.payment_failed` → `STRIPE_WEBHOOK_SECRET`.
- Create a **Customer Portal** configuration → `STRIPE_PORTAL_CONFIGURATION`.
- (Pre-launch: enable Stripe Tax + billing-address collection — see Phase 6.)

### Managed Redis (Upstash / Railway)
- `REDIS_URL` = `rediss://default:<password>@<host>:<port>` (TLS).

### Resend (email)
- Verify a sending domain; create an API key → `RESEND_API_KEY`, `EMAIL_FROM`. *(wired in Phase 3.)*

### Sentry (optional)
- `SENTRY_DSN` (server). No-ops if unset. *(wired in Phase 5.)*

### AI providers
- `GEMINI_API_KEY` (+ `GEMINI_MODEL`), `OPENAI_API_KEY`, `SD_API_KEY`.
- **Set `USE_MOCK_AI=false` in production.**

---

## 2. Server (API) — Docker host (Railway)

- Repo root `Dockerfile` builds + runs the server (`node apps/server/dist/app.js`, port 4000).
- Set all server env vars (section 1) + `NODE_ENV=production`, `CLIENT_URL=https://app.<domain>`,
  `COOKIE_DOMAIN=.<domain>`, `SESSION_SECRET` (>=32 random chars), `TRUST_PROXY=1`.
- Health checks: liveness `GET /healthz`, readiness `GET /readyz` (verifies DB + Redis).
- Map the service to `api.<domain>` with TLS.

## 3. Client (web) — Vercel

- Import the repo; **Root Directory = `apps/client`**.
- Build command (monorepo — build `shared` first):
  `cd ../.. && pnpm install && pnpm --filter shared build && pnpm --filter client build`
- Output dir: `.next` (default). Install command: `pnpm install`.
- Env: `NEXT_PUBLIC_API_URL=https://api.<domain>`, `NEXT_PUBLIC_APP_MODE=production`.
- Map to `app.<domain>`.

## 4. Database migrations

```
DATABASE_URL=<pooler>  DIRECT_URL=<direct>  pnpm --filter server exec prisma migrate deploy
```
Run once before first boot and on every release that adds a migration.
(With the connected Supabase integration, migrations can be applied directly —
confirm the target project first.)

## 5. Seed (production data only)

- `seed-styles` is the production style catalog → run once (idempotent). *(guarded in Phase 4.)*
- **Do NOT** run `seed-users` / `seed-projects` in production (test fixtures).
- Remove the legacy backdoor accounts (`free@/pro@/proplus@gmail.com`, `mock_sub_*`)
  from the live DB before launch.

## 6. Post-deploy smoke test

1. `GET https://api.<domain>/healthz` → 200; `/readyz` → 200.
2. Sign up → verify email → log in (cookie set on `.<domain>`).
3. Upload → restyle → result renders.
4. Pricing → Go Pro → Stripe Checkout → webhook provisions the subscription → quota reflects the plan.
5. Create a collection → share link → open `/collections/public/<id>` logged out.

---

## CI

`.github/workflows/ci.yml` runs build + typecheck + lint on every PR. Add
`prisma migrate deploy` to the release pipeline (not CI) once `DIRECT_URL` is set.

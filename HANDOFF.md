# Handoff: Local MVP Deployment
Date: 2026-04-25
Session type: Build

## What was completed

- **Prisma migrations**: All 13 migrations applied cleanly to Supabase via Session pooler (port 5432). Direct connection (`db.PROJECT_REF.supabase.co`) does not resolve DNS — pooler is the only path.
- **Seed scripts**: `seed-styles` (8 styles), `seed-users` (3 users: free/pro/proplus with password `qqqqqq`), `seed-projects` (22 projects across all users) all completed successfully. Required building `packages/shared` first (`pnpm --filter shared run build`).
- **Dev servers**: Both running via `pnpm dev:all` — server on :4000, client on :3000. Server started in stable non-watch mode for testing (`tsx src/app.ts`); normally runs with `tsx watch` via dev:all.
- **Smoke test**: Sign-up, login, project creation, image upload all verified in browser.
- **Mock restyle fix**: Added in-memory Map fallback to `apps/server/src/job-pooling/job.service.ts` so job state persists when Redis is unavailable. Verified via direct API test: job created → mock AI completed in ~7s → job status `"completed"`.

## Test status

All acceptance criteria in SPRINT.md are met. Restyle verified via:
```
POST /api/restyle → job ID returned
GET /api/restyle/:jobId (after 8s) → status: "completed"
```

## What is NOT done

- **End-to-end browser restyle completion**: The browser flow shows "Styling..." but `tsx watch` restarts the server on any file change, clearing the MemoryStore session mid-request. Restyle completes on the server but the client loses its session before it can observe completion. This is a dev-mode-only problem.
- **Redis**: Not installed locally. The session store falls back to `express-session` MemoryStore (acceptable for local testing per sprint scope). Job store falls back to in-memory Map (new fix).
- **Stripe**: Placeholder key. Quota repair from Stripe fails with "User hasn't stripe customer id" — non-fatal; the code falls back to creating a free period.
- **OpenAI / Stable Diffusion**: Placeholder keys. `USE_MOCK_AI=true` routes all requests to the mock provider.
- **Gemini API key**: Set and valid, but `USE_MOCK_AI=true` so it is bypassed in local testing.

## Known issues / debt

1. **`tsx watch` over-restarts**: The watch process triggers extra restarts beyond the initial file-change reload. This kills MemoryStore sessions every few minutes during development. Root cause unknown — possibly watching files outside `src/`. Workaround: run server with `tsx src/app.ts` (non-watch) during manual testing, or install Redis.

2. **`FREE_PERIOD=1m` in `.env`**: The 1-minute free period is too short for manual testing — the quota repair cycle fires mid-session. Change to `FREE_PERIOD=7d` (or similar) before further testing.

3. **Hardcoded `localhost:4000` in client**: `apps/client` has the API base URL hardcoded. Must be replaced with an env var (`NEXT_PUBLIC_API_URL`) before cloud deploy.

4. **Hardcoded CORS origin**: `apps/server/src/app.ts` CORS is hardcoded to `localhost:3000`. Must use env var before cloud deploy.

5. **Session secret**: `SESSION_SECRET` in `.env` must be rotated to a strong random value before cloud deploy.

6. **`DATABASE_URL` must use pooler, not direct**: Direct connection (`db.PROJECT_REF.supabase.co`) fails DNS lookup. Only the Session pooler (`aws-0-ap-northeast-1.pooler.supabase.com:5432`) works. The Supabase project is in Tokyo (ap-northeast-1) — a Sydney region migration is noted as future work.

7. **`connect-redis` / session store coupling**: `redis.ts` falls back to MemoryStore but still exports `redisClient` as `undefined` when Redis is down. Any code importing `redisClient` directly (not via `job.service.ts`) will crash. The `job.service.ts` fix handles this for job state only.

8. **`imagesService` restyle result storage**: The mock AI returns a raw Buffer. It is stored in the job's `result` field but the client-facing display URL (Supabase signed URL) is not generated for mock results. Real AI results would need a Supabase upload step wired in.

## Exact next step

Install Redis locally (`winget install Redis.Redis` or use Docker), update `REDIS_HOST`/`REDIS_PORT` in `.env`, and restart servers. This eliminates the MemoryStore session drop and the job-store in-memory fallback, restoring the full browser-visible restyle flow.

## Files changed

- `apps/server/.env` — DATABASE_URL, USE_MOCK_AI, FREE_PERIOD, all service keys
- `apps/client/.env.local` — NEXT_PUBLIC_API_URL
- `apps/server/src/job-pooling/job.service.ts` — added in-memory Map fallback for when Redis is unavailable
- `SPRINT.md` — created (sprint spec + acceptance criteria)
- `HANDOFF.md` — this file

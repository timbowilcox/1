# Sprint: Local MVP Deployment
Date: 2026-04-25
Repo: realstyler

## Scope
Get the realstyler MVP running end-to-end on localhost so manual smoke testing can proceed. This covers: fixing the Prisma migration auth failure, seeding the database, starting both servers, and verifying the core user flows (sign up, log in, image upload, mock restyle). This is NOT a cloud deploy, NOT a feature build — it is purely local environment standup.

## Acceptance Criteria
- [x] `prisma migrate deploy` completes with no errors — all 13 migrations applied
- [x] `seed-styles` runs without error — 8 styles in `styles` table
- [x] `seed-users` runs without error — free@gmail.com / pro@gmail.com / proplus@gmail.com exist with password `qqqqqq`
- [x] `seed-projects` runs without error — projects created and attached to users
- [x] `pnpm dev:all` starts both servers with no fatal errors: server on :4000, client on :3000
- [x] `http://localhost:3000` loads the app in a browser (no blank page / uncaught errors)
- [x] Can sign up with a new email address
- [x] Can log in as free@gmail.com / qqqqqq
- [x] Can upload an image to a project
- [x] Restyle returns a mock result (USE_MOCK_AI=true) — verified via API: job created, mock AI completed in ~7s, job status "completed"

## Definition of Done
- [x] All acceptance criteria checked
- [ ] HANDOFF.md committed to repo root summarising what was done, blockers hit, and outstanding work
- [ ] Known pre-cloud-deploy debt itemised in HANDOFF.md

## Out of Scope
- Cloud / Vercel deploy
- Stripe billing flows
- OpenAI / Stable Diffusion flows
- Redis (app falls back to MemoryStore — acceptable for local testing)
- Sydney region migration (noted as future work)
- Any feature work beyond making existing code run

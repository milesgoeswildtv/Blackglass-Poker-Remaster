# CRASHOUT POKER — AFTER HOURS V2 REBUILD CONTRACT

## Purpose
Build a clean production application shell around the proven Crashout Poker engine/backend while retiring the Puck/Afterdark editor experiment from the production path.

## Branch authority
- Integration branch: `rebuild/after-hours-v2`
- Active Phase 0 work branch: `codex/rebuild-00-access-foundation`
- Feature PRs target `rebuild/after-hours-v2`, not `main`.
- Do not merge `rebuild/after-hours-v2` to `main` until the complete rebuild is approved.

## Source authority
- Functional baseline: `main` at the rebuild fork point.
- Preserve the existing Worker poker engine, auth, account, access, tournament, realtime, economy, settlement, Durable Object classes/migrations, and API contracts unless a verified defect requires a narrowly-scoped repair.
- Approved AFTER HOURS production/reference assets live in `public/remaster/`.
- Do not pull presentation/editor code from `puck-visual-editor-spike` merely because it exists.

## Architecture
- One real application origin: Cloudflare Worker under the Afterdarklabs Cloudflare account.
- The built React frontend and `/api/*` Worker routes must share that origin.
- GitHub Pages is not the production/runtime authority.
- No Puck editor, Afterdark editor, visual builder, theme editor, or preview-bypass system in the new production path.

## Build order
0. Access + deployment foundation
1. Home / Entry
2. Lobby
3. Pre-game
4. Live Game
5. Results / end-of-hand
6. Cross-page cleanup and launch QA

Only one phase is active at a time. Stop for Miles's approval before beginning the next phase.

## Phase 0 success gate
Before any visual rebuild:
- real Afterdarklabs Cloudflare URL is verified from the existing Worker dashboard and documented before deployment;
- latest branch build deploys there;
- `GET /api/health` reaches the Worker;
- `POST /api/access/key/prepare` reaches the Worker and returns structured JSON for an intentionally invalid dummy key;
- existing real CRASH host-key flow remains enabled;
- existing Durable Object data is preserved;
- auth/session cookies function on the same origin;
- CI/build/Worker dry-run are green on the exact pushed SHA.

Never expose, reset, replace, or regenerate Miles's real host key as part of QA.

## Visual rules after Phase 0
AFTER HOURS is the presentation authority. Use the supplied mockups as composition references and `public/remaster/` as production assets. Keep dynamic content live in React/HTML/CSS.

## Delivery discipline
- clean replacement, not patches-on-patches;
- no fake controls;
- no claims of deployed/live/green without exact evidence;
- Playwright mobile 390x844 and desktop 1440x900 for each visual phase;
- one active Codex feature branch at a time.

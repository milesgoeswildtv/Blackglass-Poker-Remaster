# AFTER HOURS — Sprint Handoff

Living document for work on `feature/table-skin-foundation`. Update it at every checkpoint so the next
session (human or Claude) can continue without re-auditing.

## Current state

| Item | Value |
|---|---|
| Working branch | `feature/table-skin-foundation` (never merged to `main`) |
| `main` | `45427b8` (untouched) |
| Branch base | `rebuild/after-hours-v2` `83fbad2` |
| Production Worker | `blackglass-poker-remaster` — `https://blackglass-poker-remaster.afterdarklabs.workers.dev` |
| Production version | AFTER HOURS V3, deployed by the owner from the dashboard. The exact version ID is not observable from the agent sandbox (no Cloudflare deploy/read API, `/api/health` reports `0.60.5` for every branch build). Check **Workers & Pages → blackglass-poker-remaster → Deployments**. |
| Deploying | Branch pushes run Workers Builds and upload a version that serves **no traffic**. Going live = deploy that version from Deployments. Rollback = Deployments → ⋯ → Rollback (no DO migrations changed on this branch, so rollback is allowed). |

Checkpoints on this branch (newest last):

| Commit | What |
|---|---|
| `a53298b` | Spectator crash fix |
| `0e9be38` | AFTER HOURS V3 table, seats and gameplay chrome |
| `510bdec` | WebP copies of V3 gameplay art |
| `6e984a0` | Worker Previews config (`previews` block) + Wrangler 4.149.0 |
| `d9f381f` | Entry step strip + fitted Home panels (superseded by `d2c7f10`) |
| `d2c7f10` | THE HIDEOUT — environmental Home and Entry |
| (sprint) | see "Sprint log" below |

## Architecture notes (verified in code)

- **Auth**: Discord OAuth (`/api/auth/discord` → `/api/auth/callback`), HMAC-signed session cookie (`AUTH_SECRET`), Telegram initData login inside the Mini App. `worker/auth.js`.
- **Private access** (`worker/access.js`, `ACCESS_REGISTRY` DO): host key → `/api/access/key/prepare` (server verifies) → Discord login → `/api/access/key/redeem` (binds to account). Invites: `/api/access/invite/validate` → `/claim`. Admin key issuance needs `ACCESS_ADMIN_SECRET` (Bearer); never in the frontend. See `PRIVATE_ACCESS.md`.
- **Gate UI**: `src/AccessHome.jsx`. The step strip (Discord / Access key / Cleared) only reflects server state; there is no client-side access decision.
- **Home**: `src/Lobby.jsx` (shell, header, modals) + `src/AccessHome.jsx` (gate / host board / invited player).
- **Features that exist**: Create (quick table or tournament), Join (table or tournament), Booster Shop, Profile drawer (stats, cosmetics, linked accounts, log out), Engine + Fairness report. **No friends, settings or balance feature exists** — do not add buttons for them until there is backend support.
- **Gameplay**: `src/TableSurface.jsx` + `table-skin.css` / `gameplay.css` / `pregame.css` (approved V3 — do not restyle).

## CSS conventions (established this sprint)

1. One stylesheet per surface, imported by the component that renders it (`home.css` ← Lobby, `private-access.css` ← AccessHome, `shop-modal.css` ← Lobby's shop modal, gameplay files ← TableSurface).
2. Do not append override blocks to fix layout. Edit the owning rule.
3. No `!important` in new code. Existing ones live mostly in legacy files (`styles.css`, `production-assets.css`, `gameplay.css`).
4. No device-specific pixel fixes; use the artwork's aspect ratio, container queries and `min()/clamp()`.
5. After UI work run `python3 scripts/find-dead-css.py . report`. It lists selectors that can never match because a class never appears in the source. Review, `apply`, then run the browser suites.
6. Home/Entry: the room artwork is the experience — no full-screen overlays or blur; local shadows only where text needs them.

## Known asset inventory

182 of 250 files in `public/` are not referenced by a literal path. Many are cosmetic-pack chips/cards that may be built from template strings, so **nothing was deleted**. Verify before pruning (biggest: `public/assets/remaster/*` reference PNGs, unused `afterhours_*_panel.png` Home panel art from the pre-Hideout design).

## Tests

- `node --test` — 332 unit tests (engine, pots, positions, table view, skins, access, health…).
- Browser suites in `qa/` (Playwright): home 19, home-internal 16, afterdark 9, gameplay 29. **They mock every `/api/*` call** — they verify layout and client behaviour, not the real backend.
- The agent sandbox cannot install npm packages, so `npm run build` (Vite) and `wrangler` never run there; the stand-in bundle is built with esbuild. The real build is the Cloudflare Workers Build on push.

## Sprint log

(appended at each checkpoint)

### Checkpoint 1 — audit + dead CSS removal
- Removed ~290 selectors that can never match (their classes appear nowhere in JS/JSX/HTML): legacy table skin in `production-assets.css` (57), `styles.css` (58), `support-ui.css` (all 16; file deleted with its import), plus `hand-replay`, `mtt-lobby`, `social`, `telegram`, `global-royal-grade`.
- Deleted `lobby.css` and `lobby-mobile-tabs.css`: no component imports them.
- Proof: Chromium's CSS parser shows every surviving rule byte-identical in declarations and `@media` context (only the unimported `lobbyCardIn` keyframes went away). Home/Entry/builder screenshots pixel-identical; gameplay/internal diffs match run-to-run animation noise measured on the unchanged HEAD.
- Tests: unit 332/332, browser 73/73 (mocked API).

# Phase 0 deployment foundation

## Runtime authority

Crashout Poker has one production runtime: the existing `blackglass-poker-remaster`
Cloudflare Worker in the Afterdarklabs account. That Worker must serve both the
built React frontend and every `/api/*` request from the same origin. GitHub Pages
may hold reference artifacts, but it is not a functional poker runtime.

Do not hardcode or guess the hostname. Before deployment, an Afterdarklabs account
administrator must copy the active hostname from the existing Worker's dashboard,
confirm that it belongs to `blackglass-poker-remaster`, and use that exact origin
for browser checks, the Discord callback, and the Stripe webhook endpoint.

## State-preserving deployment rules

- Deploy the existing Worker; do not create a replacement Worker.
- Preserve every Durable Object binding and migration in `wrangler.jsonc`.
- In particular, do not recreate, rename, or reset `ACCESS_REGISTRY` or any other
  Durable Object namespace.
- Do not regenerate host keys or use a real host key in automated checks.
- Keep the existing authentication, account, cookie, access, poker, realtime,
  tournament, economy, and settlement implementations authoritative.
- Confirm in the Cloudflare dashboard which Git branch feeds the Worker before
  changing any deployment integration. Do not enable arbitrary feature branches
  to deploy production automatically.

## Repository validation

Run these checks against the exact candidate commit:

```bash
npm install
npm test
npm run build
npm run check:worker
```

The test suite exercises `GET /api/health` through `worker/router.js` and sends an
intentionally malformed dummy key to `POST /api/access/key/prepare`, asserting
that the route reaches the access binding and returns a non-cacheable structured
JSON error. The dummy check must never contain or expose a real host key.

`npm run check:worker` is a Wrangler dry-run only. It validates the Worker bundle,
static assets, bindings, and migrations without publishing or changing Cloudflare.

## Dashboard verification before a future deployment

Phase 0 repository validation does not alter Cloudflare. An Afterdarklabs account
administrator must later verify all of the following on the existing Worker:

1. The Worker name is `blackglass-poker-remaster` and its current production
   branch/source relationship is understood.
2. The existing Durable Object namespaces are attached to the bindings declared
   in `wrangler.jsonc`; no namespace or stored data is replaced.
3. The verified Worker origin loads the React application.
4. `GET <verified-origin>/api/health` returns the Worker's real health JSON.
5. `POST <verified-origin>/api/access/key/prepare` with an intentionally malformed
   dummy key returns a structured JSON error from the Worker.
6. Discord login, its callback, account sessions, and secure cookies stay on the
   verified origin.

Record the verified hostname only after the dashboard inspection. Do not deploy
or change dashboard settings merely to discover it.

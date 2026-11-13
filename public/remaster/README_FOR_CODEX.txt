ARCHIVED VISUAL KIT — NOT THE APPROVED PRODUCTION HOME/ENTRY ASSET SET

This folder contains a newer After Hours concept kit. It is retained for reference only.
It is NOT the visual baseline currently approved for production.

The confirmed-good production visual reference is Cloudflare Worker version 300,
sourced from commit 81457d8f2dfc5a0e62cc722d08648e63cde1193a.

For production Home and Entry Gate, use:
- public/assets/remaster/homescreen/
- public/assets/remaster/entry-gate/

The exact CSS and all 19 approved image hashes are enforced by
scripts/verify-approved-visual-release.mjs. Do not connect this archived kit to
Home or Entry Gate unless Miles explicitly approves a new visual replacement.

Preserve real poker/auth/session/realtime/backend behavior. All buttons and
navigation must use real application handlers and routes. Run Playwright on
mobile and desktop and inspect the resulting screenshots before release.

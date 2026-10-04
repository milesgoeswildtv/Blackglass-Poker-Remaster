# AUTONOMOUS PROGRESS — CRASHOUT POKER

## Production state
- Production base: `main` @ `45427b804376b09963c52adbd60320cf606174ee`.
- Active delivery: `automation/poker/entry-home-mainline`.
- Current surface: ENTRY / HOME only. Lobby is not counted as redesigned.
- Public product: CRASHOUT POKER.

## ENTRY / HOME clean replacement
- Rebased the approved Entry/Home visual slice onto current `main` instead of merging the historically divergent editor branch.
- Retired active Home/Entry references to legacy `/assets/remaster/` presentation in `src/home.css` and `src/private-access.css`.
- Added `public/assets/after-hours/home-club-environment.svg`, a text-free underground private poker room environment.
- Preserved current-main Lobby behavior and changed only the live Home atmosphere/brand DOM needed by the new presentation.
- Added the Home regression that rejects legacy flattened remaster backgrounds.

## Delivery
- Source branch was created directly from current main; no editor history was imported.
- Previous visual evidence on the historical branch passed at 390x844 and 1440x900, but it is NOT reused as proof for this mainline branch.
- Exact-head CI and fresh Playwright screenshots are required on this branch before merge.

## Next gate
- Open PR to `main`.
- Require exact-head Poker CI success.
- Download and visually inspect fresh Home/Entry mobile and desktop artifacts from that exact SHA.
- Only after that visual gate passes should ENTRY/HOME be merged and LOBBY begin.

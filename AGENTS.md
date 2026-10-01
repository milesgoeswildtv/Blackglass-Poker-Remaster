# AGENTS.md — CRASHOUT POKER / BLACKGLASS

## Product identity
Public product: **CRASHOUT POKER**.
**BLACKGLASS** is internal-only and must not appear in player-facing UI.

## Mission
Finish the visual remaster of the already-working poker product.
This is **not** a technical rebuild.

## Protected behavior
Do not change these unless the task explicitly opens them:
- poker rules / hand resolution
- auth, sessions, reconnect
- backend / database / economy
- realtime transport
- routes
- tournament behavior
- seat count and authoritative seat anchors
- board / pot / bet ownership
- throwable targeting semantics
- Telegram semantics

If visual work seems to require changing protected behavior, stop and explain why instead of modifying it.

## Visual direction
AFTER HOURS:
- intimate
- tactile
- physical
- dark
- handled
- slightly dangerous
- human
- underground
- intentional
- materially rich without decorative noise

Avoid:
- generic casino
- purple-neon casino fantasy
- cyberpunk / sci-fi
- glossy gold casino chrome
- gothic clutter
- sterile SaaS dashboards
- random grunge

## Clean replacement rule
No patches-on-patches.
Do not leave duplicate themes, duplicate components, dead visual systems, or superseded presentation behind.
Keep one source of truth.

## Builder/editor authority
Canonical editor:
- branch base: `puck-visual-editor-spike`
- source: `src/AfterdarkPokerLab.jsx`
- route: `#/design-lab/afterdark`
- surfaces: ENTRY, HOME, INVITE, PRE-GAME, GAMEPLAY, MTT LOBBY, MTT BREAK, MTT MOVE, MTT RESULT

The editor is a worker workspace. It should be capable of assembling functional pages, not just arranging screenshots.

## Production-component rule
Prefer manipulating the real production components and their presentation layer.
Do not replace functional controls with fake images.
CSS-built elements are valid when they preserve semantics and behavior.

## Asset rules
Skin uploads live under `public/skin-uploads`.
Preferred filename form:
`SKIN__CHANNEL__ROLE.png`
Existing legacy/convenience names may already be supported by the registry generator; do not mass-rename assets without need.

## Testing / shipping
Before merge:
1. run existing unit tests
2. build
3. run Afterdark browser QA
4. run gameplay browser QA
5. preserve gameplay geometry unless the task explicitly changes it
6. merge only a coherent green slice

Do not claim production/live success until the relevant deployment job is green.

## Working style
- inspect before editing
- make the smallest coherent architectural change
- preserve existing authoritative behavior
- add regression QA for each bug/feature
- avoid speculative refactors
- if uncertain about ownership, trace the live component and selector first

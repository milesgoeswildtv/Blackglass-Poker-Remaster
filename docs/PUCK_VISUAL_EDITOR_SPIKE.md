# Puck Visual Editor Feasibility Spike

Branch: `puck-visual-editor-spike`

## Status

CONTROLLED FEASIBILITY SPIKE ONLY.

- Do not merge to `main`.
- Do not deploy to production.
- Do not replace production UI.
- Do not modify protected poker/runtime systems.
- Mobile authoring is a GO / NO-GO criterion.

## Purpose

Test whether Puck can provide a safe browser-based visual-authoring layer for approved Crashout Poker presentation components, especially from iPhone/Safari.

Desired authority chain:

protected application/game systems
→ runtime view-model / props
→ approved presentation components
→ Puck-authored layout/config

Puck is presentation-only.

## Protected systems

Puck must not own or edit:

- authentication or sessions
- database/API authority
- realtime/networking
- matchmaking/multiplayer synchronization
- economy/wallet/inventory/entitlements
- poker rules, RNG, timers, authoritative state
- tournament logic
- persistence/business logic
- permissions/routing semantics
- protected event handlers

## First proof

Expose only:

- one background/environment
- one logo/image asset
- one approved panel/card
- one editable text block
- one safe button/control shell

Use mock data only.

The proof must establish:

1. Browser editor opens.
2. Approved project assets render.
3. Components can be dragged/repositioned.
4. Components can be resized in a practical visual workflow.
5. Safe presentation text can be edited.
6. 390px, 430px, landscape, and desktop preview/editing can be tested.
7. Layout can be saved locally and restored after reload.
8. No protected runtime behavior changes.

## Persistence

Initial proof may use local JSON or localStorage only. No production database additions.

## Security

No secrets, privileged tokens, arbitrary JS handlers, admin backend operations, or unvalidated executable layout data.

Any test deployment must be dev-only or appropriately gated.

## Kill criteria

STOP and mark NO-GO if:

- iPhone/Safari authoring is impractical;
- drag/resize requires essentially the same hand-coded CSS workflow we are trying to eliminate;
- Puck requires control over protected app/runtime architecture;
- the integration meaningfully destabilizes the existing React/Vite application.

## Current technical baseline

Crashout Poker is a React 19 + Vite application. The public Home/Entry presentation currently includes highly specific portrait CSS positioning at <=430px; this spike exists specifically to test whether that manual positioning workflow can be replaced by a controlled visual-authoring surface without touching application behavior.

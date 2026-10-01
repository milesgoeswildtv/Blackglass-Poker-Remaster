# CODEX TASK — FINER POKER BUILDER CONTROL

## Goal
Give the Afterdark visual editor fine-grained control over the real poker UI so the worker can actually assemble and finish the pages.

Do **not** change poker behavior.

## First implementation slice: GAMEPLAY + PRE-GAME granularity

### Gameplay
Replace coarse editor ownership with individually selectable/manipulable presentation slots for the real runtime elements, including at minimum:

- back / exit control
- table header / info
- top commands
- table artwork
- each opponent seat independently
- each community card slot independently
- pot
- side pots
- hero hole card 1
- hero hole card 2
- hero plaque
- hand strength
- extra-time / timer affordance
- Fold
- Check / Call
- Bet / Raise
- All In
- bet amount label
- bet slider
- quick-bet group
- individual quick-bet controls
- chat
- hand log / history

Use the existing real DOM/components. Do not create fake duplicates merely to make them selectable.

### Pre-game
Expose at minimum:
- back
- header information
- blinds / table info
- table artwork
- each seat independently
- hero cards independently
- hero plaque
- start control
- utility controls
- chat
- hand log / history

## Required editor behavior for each exposed layer
Where safe for presentation:
- select
- move
- resize
- lock / unlock
- click-through while locked
- z-order control
- remove / restore for built-ins

Do not allow an editor operation to sever or replace the underlying runtime action handler.

## Selector contract
Create/extend a single source of truth mapping stable layer IDs to stable production selectors.
Avoid selectors based on incidental DOM order when a stable class/data attribute can be added instead.
If a stable data attribute is needed, add it without changing runtime behavior.

## Breakpoints
Do not solve breakpoint independence in this first slice unless it falls out cleanly.
However, do not make the data model harder to migrate to per-breakpoint geometry later.

## QA requirements
Add browser coverage that proves:
1. representative granular layers appear in LAYERS
2. selecting them highlights the correct real production element
3. moving/resizing an allowed layer changes presentation only
4. locking prevents movement and allows click-through
5. built-in remove/restore works
6. poker gameplay QA remains green
7. no protected runtime behavior changed

## Non-goals
- no poker rules changes
- no backend work
- no economy changes
- no auth/session changes
- no new visual redesign unless needed to expose controls

## Deliverable
A focused PR against `puck-visual-editor-spike` with code, QA, and a short note describing any runtime elements intentionally left non-manipulable and why.

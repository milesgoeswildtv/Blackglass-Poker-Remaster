# AUTONOMOUS PROGRESS — CRASHOUT POKER

## Production state
- Production integration base: `puck-visual-editor-spike` @ `1a48c9060101972cd5c5cc88f70aa122069de6e3`
- Active delivery: PR #33, branch `codex/complete-visual-redesign-of-poker-site`
- Current surface: ENTRY / HOME only. Lobby has not been counted as redesigned.
- Public product name: CRASHOUT POKER.

## ENTRY / HOME replacement
- Retired the legacy remaster logo/panel/background presentation from active Home controls.
- Real React controls and live text remain authoritative.
- Added and integrated `public/assets/after-hours/home-club-environment.svg`: a text-free underground private poker room with deep-green felt, dark wood, aged-brass framing, warm practical light, banquette/table/chair depth, and no baked functional state.
- `src/home.css` uses the environment as the Home/Entry world layer; the previous CSS-drawn lamp/table/glass/card scenery no longer owns the surface.
- Entry gate and Home actions remain real interactive DOM with brass/felt material treatment.

## Commits this slice
- `056b6cb37f41b34864c13c7cc63e6591fcf253be` — Home: add production underground club environment
- `46efd4a2448f0d76d77c076c252b5193101351d9` — Home: integrate cinematic club environment
- `3fbb627f76612fa1e911cbb02dd384f44fa97aa8` — exact visual-QA head reviewed below

## QA
- Poker CI run `37186473699` for exact head `3fbb627f76612fa1e911cbb02dd384f44fa97aa8`: PASS.
- GitHub Actions artifact: `miles-review-entry-home-390x844-and-desktop-3fbb627f76612fa1e911cbb02dd384f44fa97aa8`.
- Playwright evidence opened and visually inspected: `home-mobile-390x844.png`, `home-1440x900.png`, `entry-gate-390x844.png`, `entry-gate-desktop-1440x900.png`.
- Self-review PASS for the requested revision: desktop now has a purposeful room/table/lamp composition instead of dead space; mobile keeps readable hierarchy and thumb-sized actions; Entry and Home share one environment/material family; no legacy flattened Home panels are carrying the refreshed surface.
- Remaining note: the room environment is intentionally restrained/dark. Further refinement should be driven by Miles review, not speculative brightness or ornament changes.

## Reusable family carried forward
Deep green felt; charcoal/black room shell; dark wood; aged brass/copper edge work; warm amber practical light; restrained cream live type; tactile beveled controls; thin nested brass frames; large physical room composition behind live UI.

## Deployment truth
PR branch only until merged. Exact-head CI success and branch deployment are not proof that the production integration branch or public site serves this SHA.

## Blocker / integration note
PR #33 currently targets `puck-visual-editor-spike`, the integration base used by this visual-remaster line. It must not be retargeted blindly to `main`: the head and `main` have substantial historical divergence. Resolve integration deliberately rather than importing editor history into `main` by accident.

## Next task
Miles review/merge decision for ENTRY / HOME. After ENTRY / HOME is accepted into the intended production integration line, begin LOBBY as the next page-by-page visual slice and inherit this locked material/environment family.

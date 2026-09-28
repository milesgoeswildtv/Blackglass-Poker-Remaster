# Crashout Poker — Skin Upload Inbox

Upload finished skin art to:

`public/skin-uploads/`

The build scans this folder automatically. No JavaScript edit is required to register art.

## Five channels

Use these filename shapes:

- `skin-id__lobby-bg.png`
- `skin-id__game-room-bg.webp`
- `skin-id__table.png`
- `skin-id__gameplay__ROLE.png`
- `skin-id__menu__ROLE.png`

Skin IDs and roles use lowercase letters, numbers, and hyphens.

Examples:

```
dwallet__lobby-bg__mobile.png
dwallet__lobby-bg__desktop.png
dwallet__game-room-bg.png
dwallet__table.png
dwallet__gameplay__player-plaque-idle.png
dwallet__gameplay__action-fold.png
dwallet__menu__create-panel.png
dwallet__menu__join-panel.png
dwallet__menu__small-button.png
```

Backgrounds may optionally include `mobile`, `desktop`, or `landscape` as the third section. If omitted, that image is the default for that background channel.

## Useful role names

The registry accepts any role, but production components only change when they request that role.

Current gameplay roles include:

`avatar-frame`, `card-back`, `player-plaque-idle`, `player-plaque-active`, `player-plaque-folded`, `player-plaque-all-in`, `chip-black`, `chip-blue`, `chip-green`, `chip-purple`, `chip-red`, `action-fold`, `action-call`, `action-raise`, `action-all-in`, `utility-button`, `chat`, `action-log`, `hand-history`, `top-bar`, `info-strip`.

Current menu roles include:

`identity-panel`, `host-bar`, `create-panel`, `join-panel`, `shop-panel`, `input-field`, `primary-action`, `utility-badge`, `master-panel`, `small-button`.

## Ownership

- `default` is free.
- `constellation`, `dead-mans-hand`, and `regalia` are tied to their existing booster ownership.
- A brand-new skin ID is owner-preview-only until its entitlement is deliberately mapped. This prevents an uploaded paid skin from accidentally becoming free to everyone.

The Crashout owner account can preview newly uploaded skin IDs before they are released.

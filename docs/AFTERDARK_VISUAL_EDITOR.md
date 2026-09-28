# Afterdark Visual Editor

Canonical editor route:

`#/design-lab/afterdark`

Canonical deployed URL:

`https://milesgoeswildtv.github.io/Blackglass-Poker-Remaster/#/design-lab/afterdark`

The Afterdark Poker Lab is the only supported visual editor for Crashout Poker.

## Authority

The editor is presentation-only. It may alter approved visual layout, skins, assets, text, dimensions, stacking, and other explicitly exposed presentation properties.

It must not own or alter:

- authentication or sessions
- database/API authority
- realtime/networking
- matchmaking or multiplayer synchronization
- economy, wallet, inventory, or entitlements
- poker rules, RNG, timers, or authoritative table state
- tournament logic
- persistence or business logic
- permissions or protected routing semantics
- protected gameplay event handlers

## Legacy routes

The old Puck route `#/design-lab/puck` redirects to `#/design-lab/afterdark`.

The Cloudflare Afterdark Visual Editor Worker is backend-only and redirects human-facing requests to this editor while keeping its authenticated publishing API available.

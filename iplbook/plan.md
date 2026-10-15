# IPL Bookings — Implementation Plan

## Scope

Build a premium IPL ticket-booking experience that is immediately usable in Preview with realistic seeded match data and a clear production integration seam for MongoDB Atlas, Upstash Redis, JWT auth, payments, QR validation, and Vercel deployment. The first slice prioritizes the customer path: discover a match, inspect seat availability, join a fair queue, temporarily lock seats, and review tickets/resale/admin views.

## Architecture

- **Frontend:** Vite + React + JavaScript. `src/App.jsx` owns the prototype state machine and reusable view components; `src/styles.css` defines the dark sports-ticketing visual system.
- **Backend shell:** `server/index.js` provides health, match, queue, seat-lock, and QR validation endpoints. It uses safe demo fallbacks when external credentials are absent and isolates the Redis/MongoDB/payment seams behind environment variables.
- **Data contracts:** `server/models.js` contains Mongoose schemas for matches, seats, bookings, tickets, and resale listings. Redis lock keys follow `lock:seat:<seatId>` with a five-minute TTL and ownership checks.
- **Runtime:** The Express server serves Vite's built client in production and proxies `/api` during development. `public/manus-routes.json` documents the page routes for Preview tooling.

## Design

### Style options

1. **Floodlit Editorial** — a stadium-at-night interface with newspaper-like hierarchy and neon pitch markings. (0.06)
2. **Premium Clubhouse** — dark hospitality-lounge polish, warm ivory typography, and jewel-tone accents. (0.08)
3. **Broadcast Control Room** — live-score energy with tight panels, status lights, and broadcast-style data density. (0.05)

**Chosen direction: Floodlit Editorial.**

- **Design Movement:** contemporary sports editorial with broadcast overlays and stadium-light contrast.
- **Core Principles:** make the next action obvious; show trust signals beside irreversible actions; keep live state legible at a glance; let content feel tactile without adding clutter.
- **Color Philosophy:** near-black navy grounds the experience like a night match; mint-green is the ownable “pitch light” accent; yellow is reserved for time-sensitive locks and queue progress; coral signals high demand or sold-out states.
- **Layout Paradigm:** a left navigation rail and wide content stage, with an asymmetrical hero, horizontal match rail, and a persistent booking drawer rather than centered card grids.
- **Signature Elements:** a thin “floodlight” gradient line under active navigation; ticket stubs with perforated edges; compact live-status pills with a small pulsing dot.
- **Interaction Philosophy:** every action returns immediate, plain-language feedback. Seat selections glow, locked seats count down, queue states update in-place, and modal surfaces keep context visible behind them.
- **Animation:** 180–260ms ease-out transitions for surfaces, a slow ambient glow in the hero, a subtle shimmer on the queue progress track, and no motion that blocks keyboard navigation or reading.
- **Typography System:** Space Grotesk for headlines and navigation, Inter for body copy and numeric data; uppercase micro-labels use 11px tracking for broadcast clarity.
- **Brand Essence:** “The calmer way to get inside the biggest nights.” Personality: assured, electric, transparent.
- **Brand Voice:** short, specific, reassuring. Example lines: “Your seat is held for five minutes.” / “No refresh needed — we’ll move you when it’s your turn.”
- **Wordmark & Logo:** an angular “I” and “P” monogram shaped like a floodlit ticket stub, paired with a compact wordmark.
- **Signature Brand Color:** Pitchlight `#B8F35A`.

## Project structure

```text
iplbook/
├── public/manus-routes.json
├── src/main.jsx
├── src/App.jsx
├── src/styles.css
├── server/index.js
├── server/models.js
├── app.config.ts
├── package.json
├── .env.example
├── plan.md
└── TODO.md
```

## Production seams

The Preview experience is intentionally self-contained so it remains demonstrable without secrets. Before production, set `MONGODB_URI`, `REDIS_URL`, `JWT_SECRET`, and payment/QR signing secrets through the platform secret manager; replace demo queue state with Redis sorted sets and atomic Lua lock release; use payment webhooks as the only source of truth for paid bookings; and persist ticket ownership/scan events in MongoDB transactions.

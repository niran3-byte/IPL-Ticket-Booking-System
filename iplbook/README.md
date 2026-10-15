# IPL Bookings

A premium IPL ticket-booking experience built with React, Vite, Express, MongoDB/Mongoose and Upstash Redis. The existing UI is preserved; its match discovery, queue join, and five-minute seat hold now call the REST API.

## Local development

```bash
npm install
npm run dev
```

The Express server listens on `0.0.0.0:3000`, serves the Vite client in development and production, and exposes `/api/auth`, `/api/matches`, `/api/queue`, `/api/seats`, `/api/bookings`, `/api/payments`, `/api/tickets`, `/api/resale`, and `/api/admin`.

The app is clearly labeled `DEMO MODE` when credentials are absent. Copy `.env.example` to `.env` and provide MongoDB Atlas, Upstash Redis REST, JWT, QR signing, and payment test values for persistent mode. No real credentials are committed or exposed to React.

To seed MongoDB Atlas with sample fixtures and seats:

```bash
npm run seed
```

To run the demo-mode API smoke test while the server is running:

```bash
npm run api:check
```

The backend uses bcrypt password hashes, JWT access tokens, role-protected admin routes, Redis `ZADD` queue entries, Redis `SET ... NX PX 300000` seat locks, server-side lock ownership checks, idempotent demo payment references, server-side QR token verification, and ownership checks for resale.

## Deployment notes

- Build the client with `npm run build`; Vite writes `dist/`.
- Run the server with `npm start` and honor the platform-provided `PORT`.
- Vercel can route `/api/*` to the Express handler and publish `dist/`; keep all signing/payment/database secrets server-side.
- Payment fulfillment must be driven by a verified Stripe webhook, not the browser redirect. The included `/api/payments/webhook` is intentionally a DEMO MODE adapter until Stripe signature verification is configured.
- Use MongoDB transactions for booking/resale ownership transfer and a Redis Lua owner-check script for production lock release; the demo fallback uses the same ownership rules in process memory.
- Configure `MONGODB_URI`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `JWT_SECRET`, `QR_SIGNING_SECRET`, `PAYMENT_SECRET_KEY`, and `PAYMENT_WEBHOOK_SECRET` in the deployment secret manager.

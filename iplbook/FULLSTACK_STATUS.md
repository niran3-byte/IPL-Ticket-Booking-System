# Full-stack implementation status

## Implemented

The existing UI remains intact, and the frontend now calls `/api/matches`, `/api/queue/join`, and `/api/seats/lock`. The backend exposes route groups for authentication, matches, queue, seats, bookings, payments, tickets, resale, and admin operations. Demo mode is explicit in `/api/health` and payment responses.

Authentication includes bcrypt password hashing, JWT issuance, protected profile and booking routes, and admin middleware. The queue uses Redis REST `ZADD` when Upstash credentials are available and a safe in-memory fallback otherwise. Seat locks use the Redis `SET key value NX PX 300000` contract when configured, plus ownership checks and expiry in demo mode. Payment flow, QR validation, resale eligibility, ownership transfer, and admin overview routes are implemented in the API surface.

Mongoose models now cover users, matches, seats, bookings, tickets, and resale listings with indexes and validation. `npm run seed` seeds MongoDB Atlas with sample matches and seats. `npm run api:check` smoke-tests health, matches, queue, seat locks, and invalid authentication.

## Credential-dependent production work

No external credentials were available in the environment, so the verified runtime is DEMO MODE. To enable persistence, configure MongoDB Atlas and Upstash REST variables from `.env.example`. Payment fulfillment should be replaced with Stripe Checkout plus signed webhook verification before accepting real money. For high-concurrency production, complete the MongoDB transaction around booking/resale transfer and use a Redis Lua owner-check script for lock release; the demo path enforces the same ownership rule in process memory.

## Verified locally

- `npm run build`
- `node --check` for API, services, seed, and smoke-test scripts
- API health and dynamic match retrieval
- Registration, bcrypt password handling, JWT-protected `/api/auth/me`
- Queue join and duplicate queue reuse
- Seat-lock conflict response (`409`)
- Booking creation, payment intent, demo webhook fulfillment, and ticket creation
- Admin authorization rejection for ordinary users (`403`)

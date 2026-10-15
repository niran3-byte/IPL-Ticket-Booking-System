# IPL Bookings — Delivery Checklist

## Customer discovery and responsive shell

- [ ] Landing page shows upcoming IPL matches with team marks, match date/time, stadium, price-from, demand state, and a primary booking CTA.
- [ ] Search and status filters narrow the match rail without a page refresh.
- [ ] Layout remains usable on desktop, tablet, and mobile with loading, empty, error, and feedback states.
- [ ] Navigation exposes Home, Matches, Queue, My tickets, Resale, and Admin views with a clear active state.

## Fair booking queue

- [ ] Selecting Book tickets for a high-demand match places the user in a virtual waiting room.
- [ ] The UI shows queue position, estimated wait, current status, and capacity progress without requiring repeated refresh.
- [ ] Late arrivals join the end of the queue; duplicate entries are prevented; admission is gradual.
- [ ] Server-side queue tokens are short-lived and queue permissions are never trusted from the client.
- [ ] Redis-backed rate limiting, suspicious-traffic challenge hooks, and shared queue state are documented in the backend seam.

## Interactive stadium and five-minute locks

- [ ] Stadium seating is represented as an interactive SVG-style layout with stand/block context.
- [ ] Seat colors communicate available (green), temporarily locked (yellow), booked (red), and verified resale (blue).
- [ ] Users can select seats, see the price/total, and receive immediate conflict feedback.
- [ ] Selected seats are held for five minutes with a visible countdown.
- [ ] Server contracts include ownership checks, expiry, atomic acquisition/release, and checkout revalidation to prevent double-booking.

## Secure booking and digital tickets

- [ ] Checkout verifies lock ownership, expiry, ticket price, and payment status before booking creation.
- [ ] Sandbox payment mode is clearly labeled; production payment uses hosted checkout and verified webhooks.
- [ ] Tickets have unique identifiers, server-validated QR credentials, current-owner binding, revocation/expiry handling, and used-entry protection.
- [ ] An authorized gate-scanning surface can validate a ticket and record entry exactly once.

## Verified resale marketplace

- [ ] Owners can list eligible unused tickets at original face value.
- [ ] Buyers can filter verified resale listings by match, stand, and price.
- [ ] Ownership transfer invalidates seller QR credentials, issues fresh buyer credentials, and completes the listing atomically.
- [ ] Duplicate listings and ineligible tickets are rejected; payment handling is idempotent and recoverable.

## Admin operations and deployment seam

- [ ] Admin surface summarizes live sales, queue load, locked seats, resale inventory, and scan activity.
- [ ] Mongoose models include validation and indexes for matches, seats, bookings, tickets, and resale listings.
- [ ] Environment variables cover database, Redis, JWT, QR signing, and payment credentials; no secret is exposed to React.
- [ ] `manus-routes.json`, build scripts, health endpoint, and Vercel/serverless notes are present for deployment.

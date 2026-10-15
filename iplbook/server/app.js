import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import { Match, User, Seat, Booking, Ticket, ResaleListing } from './models.js';
import { authUser, bearer, comparePassword, connectMongo, hashPassword, id, isDemoMode, now, redis, requireAdmin, requireAuth, seedDemoData, signToken, stores, validateBody, verifyToken } from './services.js';

seedDemoData();
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(bearer);

const demoUser = (user) => ({ id: String(user.id || user._id), name: user.name, email: user.email, role: user.role });
const demoOrMongo = async (mongoQuery, demoQuery) => (isDemoMode() ? demoQuery() : mongoQuery());
const getMatch = async (matchId) => demoOrMongo(() => Match.findById(matchId).lean(), () => stores.demoMatches.get(matchId));
const getUserByEmail = async (email) => demoOrMongo(() => User.findOne({ email: email.toLowerCase() }), () => [...stores.demoUsers.values()].find((user) => user.email === email.toLowerCase()));
const getSeat = (matchId, seatId) => stores.demoSeats.get(`${matchId}:${seatId}`);

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'iplbook-api', mode: isDemoMode() ? 'DEMO MODE' : 'configured', mongo: Boolean(process.env.MONGODB_URI), redis: Boolean(process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL) }));

app.post('/api/auth/register', validateBody(['name', 'email', 'password']), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    if (await getUserByEmail(email)) return res.status(409).json({ error: 'Email is already registered' });
    const passwordHash = await hashPassword(password);
    const user = isDemoMode() ? { id: id('usr'), name, email: email.toLowerCase(), passwordHash, role: 'user' } : await User.create({ name, email, passwordHash });
    if (isDemoMode()) stores.demoUsers.set(user.id, user);
    const safe = demoUser(user); res.status(201).json({ user: safe, token: signToken(safe) });
  } catch (error) { next(error); }
});

app.post('/api/auth/login', validateBody(['email', 'password']), async (req, res, next) => {
  try {
    const user = await getUserByEmail(req.body.email);
    if (!user || !(await comparePassword(req.body.password, user.passwordHash))) return res.status(401).json({ error: 'Invalid email or password' });
    const safe = demoUser(user); res.json({ user: safe, token: signToken(safe) });
  } catch (error) { next(error); }
});
app.get('/api/auth/me', requireAuth, (req, res) => res.json({ user: authUser(req) }));

app.get('/api/matches', async (_req, res, next) => { try { const matches = await demoOrMongo(() => Match.find({ status: { $ne: 'draft' } }).sort({ startsAt: 1 }).lean(), () => [...stores.demoMatches.values()]); res.json({ matches, demoMode: isDemoMode() }); } catch (error) { next(error); } });
app.get('/api/matches/:matchId', async (req, res, next) => { try { const match = await getMatch(req.params.matchId); if (!match) return res.status(404).json({ error: 'Match not found' }); res.json({ match }); } catch (error) { next(error); } });
app.post('/api/admin/matches', requireAdmin, validateBody(['slug', 'homeTeam', 'awayTeam', 'startsAt', 'stadium', 'city']), async (req, res, next) => { try { const match = isDemoMode() ? { id: id('match'), ...req.body, status: 'on_sale', available: 0 } : await Match.create(req.body); if (isDemoMode()) stores.demoMatches.set(match.id, match); res.status(201).json({ match }); } catch (error) { next(error); } });
app.patch('/api/admin/matches/:matchId', requireAdmin, async (req, res, next) => { try { const match = isDemoMode() ? { ...stores.demoMatches.get(req.params.matchId), ...req.body } : await Match.findByIdAndUpdate(req.params.matchId, req.body, { new: true, runValidators: true }); if (!match) return res.status(404).json({ error: 'Match not found' }); if (isDemoMode()) stores.demoMatches.set(req.params.matchId, match); res.json({ match }); } catch (error) { next(error); } });
app.delete('/api/admin/matches/:matchId', requireAdmin, async (req, res, next) => { try { if (isDemoMode()) stores.demoMatches.delete(req.params.matchId); else await Match.findByIdAndDelete(req.params.matchId); res.status(204).end(); } catch (error) { next(error); } });

app.post('/api/queue/join', validateBody(['matchId']), async (req, res, next) => { try { const user = authUser(req); const userId = user.id; const key = `${req.body.matchId}:${userId}`; const existing = stores.demoQueue.get(key); if (existing) return res.json(existing); const queueId = id('queue'); const entry = { queueId, matchId: req.body.matchId, userId, position: 1284, total: 8642, estimatedWaitSeconds: 1080, status: 'waiting', accessToken: signToken({ queueId, matchId: req.body.matchId, userId }, '10m'), expiresAt: new Date(now() + 30 * 60 * 1000).toISOString() }; const redisScore = now(); const redisResult = await redis(['ZADD', `queue:${req.body.matchId}`, redisScore, userId]); if (!redisResult || isDemoMode()) stores.demoQueue.set(key, entry); res.status(201).json({ ...entry, mode: redisResult ? 'redis' : 'DEMO MODE' }); } catch (error) { next(error); } });
app.get('/api/queue/status/:queueId', (req, res) => { const entry = [...stores.demoQueue.values()].find((item) => item.queueId === req.params.queueId); if (!entry) return res.status(404).json({ error: 'Queue entry not found' }); res.json({ ...entry, checkedAt: new Date().toISOString() }); });
app.post('/api/queue/admit/:queueId', requireAdmin, (req, res) => { const entry = [...stores.demoQueue.values()].find((item) => item.queueId === req.params.queueId); if (!entry) return res.status(404).json({ error: 'Queue entry not found' }); entry.status = 'admitted'; entry.accessToken = signToken({ queueId: entry.queueId, matchId: entry.matchId, userId: entry.userId, scope: 'booking' }, '5m'); res.json(entry); });

app.get('/api/seats/:matchId', async (req, res) => { const seats = [...stores.demoSeats.values()].filter((seat) => seat.matchId === req.params.matchId); res.json({ seats, demoMode: isDemoMode() }); });
app.post('/api/seats/lock', validateBody(['matchId', 'seatIds']), async (req, res, next) => { try { const userId = authUser(req).id; const seatIds = req.body.seatIds; if (!Array.isArray(seatIds) || seatIds.length < 1 || seatIds.length > 8) return res.status(400).json({ error: 'Choose between 1 and 8 seats' }); const unavailable = []; for (const seatId of seatIds) { const key = `lock:seat:${req.body.matchId}:${seatId}`; const result = await redis(['SET', key, `${userId}:${id('lock')}`, 'NX', 'PX', 300000]); const local = getSeat(req.body.matchId, seatId); if (local && ['booked', 'locked'].includes(local.state) && local.lockOwnerId !== userId) unavailable.push(seatId); else if (local) { local.state = 'locked'; local.lockOwnerId = userId; local.lockExpiresAt = new Date(now() + 300000); } if (result === null && stores.demoLocks.has(key) && stores.demoLocks.get(key).owner !== userId) unavailable.push(seatId); if (result === null) stores.demoLocks.set(key, { owner: userId, expiresAt: now() + 300000 }); } if (unavailable.length) return res.status(409).json({ error: 'Some seats are no longer available', unavailable }); const lockId = id('lock'); res.status(201).json({ lockId, matchId: req.body.matchId, seatIds, owner: userId, expiresAt: new Date(now() + 300000).toISOString(), mode: isDemoMode() ? 'DEMO MODE' : 'redis' }); } catch (error) { next(error); } });
app.delete('/api/seats/lock', validateBody(['matchId', 'seatIds']), async (req, res) => { const userId = authUser(req).id; for (const seatId of req.body.seatIds) { const key = `lock:seat:${req.body.matchId}:${seatId}`; const lock = stores.demoLocks.get(key); if (!lock || lock.owner === userId) { await redis(['DEL', key]); stores.demoLocks.delete(key); const seat = getSeat(req.body.matchId, seatId); if (seat && seat.lockOwnerId === userId) { seat.lockOwnerId = null; seat.lockExpiresAt = null; seat.state = 'available'; } } } res.json({ released: true }); });

app.post('/api/bookings', requireAuth, validateBody(['matchId', 'seatIds']), (req, res) => { const userId = authUser(req).id; const booking = { id: id('booking'), reference: `IPL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`, userId, matchId: req.body.matchId, seatIds: req.body.seatIds, amount: Number(req.body.amount || 0), paymentStatus: 'pending', createdAt: new Date().toISOString() }; stores.demoBookings.set(booking.id, booking); res.status(201).json({ booking, next: 'Create a payment intent, then confirm via /api/payments/webhook' }); });
app.get('/api/bookings/me', requireAuth, (req, res) => res.json({ bookings: [...stores.demoBookings.values()].filter((booking) => booking.userId === authUser(req).id) }));
app.post('/api/payments/create-intent', requireAuth, validateBody(['bookingId']), (req, res) => { const booking = stores.demoBookings.get(req.body.bookingId); if (!booking || booking.userId !== authUser(req).id) return res.status(404).json({ error: 'Booking not found' }); booking.paymentReference = id('demo_payment'); res.json({ paymentReference: booking.paymentReference, amount: booking.amount, status: 'requires_confirmation', mode: 'DEMO MODE — no real payment collected' }); });
app.post('/api/payments/webhook', (req, res) => { const { bookingId, paymentReference, status } = req.body || {}; const booking = stores.demoBookings.get(bookingId); if (!booking || booking.paymentReference !== paymentReference) return res.status(400).json({ error: 'Invalid payment reference' }); if (status !== 'paid') { booking.paymentStatus = 'failed'; return res.json({ received: true, status: 'failed' }); } booking.paymentStatus = 'paid'; const ticket = { id: id('ticket'), ticketId: `TKT-${crypto.randomBytes(6).toString('hex').toUpperCase()}`, bookingId, ownerId: booking.userId, qrVersion: 1, qrToken: signToken({ ticketId: booking.id, ownerId: booking.userId }, '12h'), resaleStatus: 'not_listed', scannedAt: null }; stores.demoTickets.set(ticket.id, ticket); res.json({ received: true, status: 'paid', ticket }); });

app.get('/api/tickets/me', requireAuth, (req, res) => res.json({ tickets: [...stores.demoTickets.values()].filter((ticket) => ticket.ownerId === authUser(req).id).map(({ qrToken, ...ticket }) => ticket) }));
app.post('/api/tickets/validate', validateBody(['ticketId', 'qrToken']), (req, res) => { try { const ticket = [...stores.demoTickets.values()].find((item) => item.ticketId === req.body.ticketId); const payload = verifyToken(req.body.qrToken); if (!ticket || ticket.qrRevokedAt || ticket.scannedAt || payload.ticketId !== ticket.bookingId) return res.status(401).json({ valid: false, reason: 'Expired, revoked, transferred, or already-used ticket' }); ticket.scannedAt = new Date().toISOString(); res.json({ valid: true, ticketId: ticket.ticketId, scannedAt: ticket.scannedAt }); } catch { res.status(401).json({ valid: false, reason: 'Invalid QR credential' }); } });

app.get('/api/resale', (_req, res) => res.json({ listings: [...stores.demoResale.values()].filter((listing) => listing.status === 'listed') }));
app.post('/api/resale', requireAuth, validateBody(['ticketId']), (req, res) => { const ticket = [...stores.demoTickets.values()].find((item) => item.ticketId === req.body.ticketId && item.ownerId === authUser(req).id); if (!ticket || ticket.resaleStatus !== 'not_listed' || ticket.scannedAt) return res.status(409).json({ error: 'Ticket is not eligible for resale' }); const listing = { id: id('listing'), ticketId: ticket.ticketId, sellerId: ticket.ownerId, faceValue: Number(req.body.faceValue || 0), status: 'listed', createdAt: new Date().toISOString() }; ticket.resaleStatus = 'listed'; stores.demoResale.set(listing.id, listing); res.status(201).json({ listing }); });
app.post('/api/resale/:listingId/buy', requireAuth, (req, res) => { const listing = stores.demoResale.get(req.params.listingId); if (!listing || listing.status !== 'listed') return res.status(404).json({ error: 'Listing not found' }); const ticket = [...stores.demoTickets.values()].find((item) => item.ticketId === listing.ticketId); if (!ticket || ticket.ownerId !== listing.sellerId) return res.status(409).json({ error: 'Ticket ownership changed' }); ticket.ownerId = authUser(req).id; ticket.qrVersion += 1; ticket.qrToken = signToken({ ticketId: ticket.id, ownerId: ticket.ownerId, version: ticket.qrVersion }, '12h'); ticket.resaleStatus = 'transferred'; listing.buyerId = ticket.ownerId; listing.status = 'completed'; res.json({ listing, ticket: { ticketId: ticket.ticketId, ownerId: ticket.ownerId, qrVersion: ticket.qrVersion } }); });

app.get('/api/admin/overview', requireAdmin, (_req, res) => res.json({ matches: stores.demoMatches.size, bookings: stores.demoBookings.size, tickets: stores.demoTickets.size, resaleListings: [...stores.demoResale.values()].filter((item) => item.status === 'listed').length, queueEntries: stores.demoQueue.size }));

app.use((error, _req, res, _next) => { console.error(error); res.status(500).json({ error: 'Internal server error', detail: process.env.NODE_ENV === 'production' ? undefined : error.message }); });

export async function initializeServices() { if (process.env.MONGODB_URI) { try { await connectMongo(); } catch (error) { console.error('MongoDB unavailable; running in DEMO MODE:', error.message); } } }
export default app;

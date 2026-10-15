import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const demoUsers = new Map();
const demoMatches = new Map();
const demoSeats = new Map();
const demoBookings = new Map();
const demoQueue = new Map();
const demoLocks = new Map();
const demoTickets = new Map();
const demoResale = new Map();
let mongoReady = false;

export const isConfigured = () => Boolean(process.env.MONGODB_URI && (process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL));
export const isMongoConfigured = () => Boolean(process.env.MONGODB_URI);
export const isDemoMode = () => !isConfigured();
export const id = (prefix) => `${prefix}_${crypto.randomBytes(10).toString('hex')}`;
export const now = () => Date.now();

export async function connectMongo() {
  if (!process.env.MONGODB_URI || mongoReady) return mongoReady;
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  mongoReady = true;
  return true;
}

export async function closeMongo() { if (mongoReady) await mongoose.disconnect(); }

async function restRedis(command) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(command) });
  if (!response.ok) throw new Error(`Redis request failed: ${response.status}`);
  const payload = await response.json();
  return payload.result;
}

export async function redis(command) {
  try { return await restRedis(command); } catch (error) { console.error('Redis unavailable; using safe demo fallback:', error.message); return null; }
}

export const signToken = (payload, expiresIn = '30m') => jwt.sign(payload, process.env.JWT_SECRET || 'demo-only-secret-change-me', { expiresIn });
export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET || 'demo-only-secret-change-me');
export const hashPassword = (password) => bcrypt.hash(password, 12);
export const comparePassword = (password, hash) => bcrypt.compare(password, hash);
export const authUser = (req) => req.user || { id: 'demo-user', role: 'user', email: 'demo@example.com', name: 'Demo Fan' };

export function bearer(req, _res, next) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    try { req.user = verifyToken(header.slice(7)); } catch { req.user = null; }
  }
  next();
}

export function requireAuth(req, res, next) { if (!req.user) return res.status(401).json({ error: 'Authentication required' }); next(); }
export function requireAdmin(req, res, next) { if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Admin authorization required' }); next(); }
export function validateBody(fields) { return (req, res, next) => { const missing = fields.filter((field) => req.body?.[field] === undefined || req.body?.[field] === ''); if (missing.length) return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` }); next(); }; }

export const stores = { demoUsers, demoMatches, demoSeats, demoBookings, demoQueue, demoLocks, demoTickets, demoResale };

export function seedDemoData() {
  if (demoMatches.size) return;
  const fixtures = [
    { id: 'mi-rr', slug: 'mi-vs-rr', short: 'MI vs RR', homeTeam: 'Mumbai Indians', awayTeam: 'Rajasthan Royals', homeCode: 'MI', awayCode: 'RR', startsAt: '2025-04-18T19:30:00+05:30', stadium: 'Wankhede Stadium', city: 'Mumbai', status: 'on_sale', available: 312, from: 1800 },
    { id: 'rcb-csk', slug: 'rcb-vs-csk', short: 'RCB vs CSK', homeTeam: 'Royal Challengers Bengaluru', awayTeam: 'Chennai Super Kings', homeCode: 'RCB', awayCode: 'CSK', startsAt: '2025-04-19T19:30:00+05:30', stadium: 'M. Chinnaswamy Stadium', city: 'Bengaluru', status: 'queue', available: 96, from: 2200 },
    { id: 'gt-srh', slug: 'gt-vs-srh', short: 'GT vs SRH', homeTeam: 'Gujarat Titans', awayTeam: 'Sunrisers Hyderabad', homeCode: 'GT', awayCode: 'SRH', startsAt: '2025-04-20T15:30:00+05:30', stadium: 'Narendra Modi Stadium', city: 'Ahmedabad', status: 'on_sale', available: 824, from: 1400 },
    { id: 'dc-kkr', slug: 'dc-vs-kkr', short: 'DC vs KKR', homeTeam: 'Delhi Capitals', awayTeam: 'Kolkata Knight Riders', homeCode: 'DC', awayCode: 'KKR', startsAt: '2025-04-22T19:30:00+05:30', stadium: 'Arun Jaitley Stadium', city: 'New Delhi', status: 'on_sale', available: 634, from: 1200 },
  ];
  fixtures.forEach((fixture) => demoMatches.set(fixture.id, fixture));
  ['mi-rr', 'rcb-csk', 'gt-srh', 'dc-kkr'].forEach((matchId) => {
    for (let index = 0; index < 36; index += 1) {
      const row = String.fromCharCode(65 + Math.floor(index / 9));
      const number = (index % 9) + 1;
      const key = `${matchId}:W-${row}-${String(number).padStart(2, '0')}`;
      demoSeats.set(key, { id: key, matchId, seatCode: key.split(':')[1], stand: 'West', block: 'A', row, number, faceValue: Math.floor(index / 9) < 2 ? 2200 : 1800, state: index === 3 || index === 26 ? 'locked' : index === 6 || index === 29 ? 'booked' : index === 14 || index === 15 ? 'resale' : 'available' });
    }
  });
}

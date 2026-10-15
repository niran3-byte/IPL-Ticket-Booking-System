import 'dotenv/config';
import mongoose from 'mongoose';
import { Match, Seat } from './models.js';

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required to seed Atlas');
await mongoose.connect(process.env.MONGODB_URI);
const fixtures = [
  { slug: 'mi-vs-rr', homeTeam: 'Mumbai Indians', awayTeam: 'Rajasthan Royals', startsAt: new Date('2025-04-18T19:30:00+05:30'), stadium: 'Wankhede Stadium', city: 'Mumbai', status: 'on_sale' },
  { slug: 'rcb-vs-csk', homeTeam: 'Royal Challengers Bengaluru', awayTeam: 'Chennai Super Kings', startsAt: new Date('2025-04-19T19:30:00+05:30'), stadium: 'M. Chinnaswamy Stadium', city: 'Bengaluru', status: 'queue' },
  { slug: 'gt-vs-srh', homeTeam: 'Gujarat Titans', awayTeam: 'Sunrisers Hyderabad', startsAt: new Date('2025-04-20T15:30:00+05:30'), stadium: 'Narendra Modi Stadium', city: 'Ahmedabad', status: 'on_sale' },
  { slug: 'dc-vs-kkr', homeTeam: 'Delhi Capitals', awayTeam: 'Kolkata Knight Riders', startsAt: new Date('2025-04-22T19:30:00+05:30'), stadium: 'Arun Jaitley Stadium', city: 'New Delhi', status: 'on_sale' },
];
for (const fixture of fixtures) {
  const match = await Match.findOneAndUpdate({ slug: fixture.slug }, fixture, { upsert: true, new: true, setDefaultsOnInsert: true });
  const seats = [];
  for (let index = 0; index < 36; index += 1) {
    const row = String.fromCharCode(65 + Math.floor(index / 9));
    const number = (index % 9) + 1;
    seats.push({ matchId: match._id, seatCode: `W-${row}-${String(number).padStart(2, '0')}`, stand: 'West', block: 'A', row, number, faceValue: Math.floor(index / 9) < 2 ? 2200 : 1800, state: 'available' });
  }
  await Seat.bulkWrite(seats.map((seat) => ({ updateOne: { filter: { matchId: seat.matchId, seatCode: seat.seatCode }, update: { $setOnInsert: seat }, upsert: true } })));
}
console.log(`Seeded ${fixtures.length} matches and their seats.`);
await mongoose.disconnect();

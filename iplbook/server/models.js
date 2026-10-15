import mongoose from 'mongoose';

const { Schema } = mongoose;
const timestamps = { timestamps: true };

export const User = mongoose.models.User || mongoose.model('User', new Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
}, timestamps));

export const Match = mongoose.models.Match || mongoose.model('Match', new Schema({
  slug: { type: String, required: true, unique: true, index: true }, homeTeam: { type: String, required: true }, awayTeam: { type: String, required: true }, startsAt: { type: Date, required: true, index: true }, stadium: { type: String, required: true }, city: { type: String, required: true }, status: { type: String, enum: ['draft', 'on_sale', 'queue', 'sold_out', 'complete'], default: 'draft', index: true },
}, timestamps));

export const Seat = mongoose.models.Seat || mongoose.model('Seat', new Schema({
  matchId: { type: Schema.Types.ObjectId, required: true, index: true }, seatCode: { type: String, required: true }, stand: { type: String, required: true }, block: { type: String, required: true }, row: { type: String, required: true }, number: { type: Number, required: true }, faceValue: { type: Number, required: true, min: 0 }, state: { type: String, enum: ['available', 'locked', 'booked', 'resale'], default: 'available', index: true }, lockOwnerId: { type: String, default: null }, lockExpiresAt: { type: Date, default: null, index: true },
}, timestamps));
Seat.schema.index({ matchId: 1, seatCode: 1 }, { unique: true });

export const Booking = mongoose.models.Booking || mongoose.model('Booking', new Schema({
  reference: { type: String, required: true, unique: true, index: true }, userId: { type: Schema.Types.ObjectId, required: true, index: true }, matchId: { type: Schema.Types.ObjectId, required: true, index: true }, seatIds: [{ type: Schema.Types.ObjectId, required: true }], amount: { type: Number, required: true, min: 0 }, paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending', index: true }, paymentReference: { type: String, default: null },
}, timestamps));

export const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', new Schema({
  ticketId: { type: String, required: true, unique: true, index: true }, bookingId: { type: Schema.Types.ObjectId, required: true, index: true }, ownerId: { type: Schema.Types.ObjectId, required: true, index: true }, qrVersion: { type: Number, default: 1 }, qrRevokedAt: { type: Date, default: null }, scannedAt: { type: Date, default: null, index: true }, resaleStatus: { type: String, enum: ['not_listed', 'listed', 'transferred'], default: 'not_listed', index: true },
}, timestamps));

export const ResaleListing = mongoose.models.ResaleListing || mongoose.model('ResaleListing', new Schema({
  ticketId: { type: Schema.Types.ObjectId, required: true, unique: true, index: true }, sellerId: { type: Schema.Types.ObjectId, required: true, index: true }, faceValue: { type: Number, required: true, min: 0 }, status: { type: String, enum: ['listed', 'checkout', 'completed', 'cancelled'], default: 'listed', index: true }, buyerId: { type: Schema.Types.ObjectId, default: null, index: true },
}, timestamps));

import mongoose, { Schema, Document } from 'mongoose';

export interface IBus extends Document {
  operator: string;
  route: string; // e.g. "NY - DC"
  departureTime: Date;
  arrivalTime: Date;
  price: number;
  availableSeats: number;
  createdAt: Date;
  updatedAt: Date;
}

const BusSchema: Schema = new Schema({
  operator: { type: String, required: true },
  route: { type: String, required: true },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  price: { type: Number, required: true },
  availableSeats: { type: Number, required: true }
}, { timestamps: true });

export const Bus = mongoose.model<IBus>('Bus', BusSchema);

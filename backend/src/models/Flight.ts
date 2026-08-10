import mongoose, { Schema, Document } from 'mongoose';

export interface IFlight extends Document {
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  price: number;
  availableSeats: number;
  createdAt: Date;
  updatedAt: Date;
}

const FlightSchema: Schema = new Schema({
  airline: { type: String, required: true },
  flightNumber: { type: String, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  price: { type: Number, required: true },
  availableSeats: { type: Number, required: true }
}, { timestamps: true });

export const Flight = mongoose.model<IFlight>('Flight', FlightSchema);

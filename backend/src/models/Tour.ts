import mongoose, { Schema, Document } from 'mongoose';

export interface ITour extends Document {
  title: string;
  destination: string;
  durationDays: number;
  price: number;
  rating: number;
  availableSlots: number;
  createdAt: Date;
  updatedAt: Date;
}

const TourSchema: Schema = new Schema({
  title: { type: String, required: true },
  destination: { type: String, required: true },
  durationDays: { type: Number, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  availableSlots: { type: Number, required: true }
}, { timestamps: true });

export const Tour = mongoose.model<ITour>('Tour', TourSchema);

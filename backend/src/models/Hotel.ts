import mongoose, { Schema, Document } from 'mongoose';

export interface IHotel extends Document {
  name: string;
  location: string;
  rating: number;
  amenities: string[];
  pricePerNight: number;
  availableRooms: number;
  createdAt: Date;
  updatedAt: Date;
}

const HotelSchema: Schema = new Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  rating: { type: Number, default: 0 },
  amenities: [{ type: String }],
  pricePerNight: { type: Number, required: true },
  availableRooms: { type: Number, required: true }
}, { timestamps: true });

export const Hotel = mongoose.model<IHotel>('Hotel', HotelSchema);

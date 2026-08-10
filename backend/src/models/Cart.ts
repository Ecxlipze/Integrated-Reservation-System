import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  productType: 'flight' | 'bus' | 'hotel' | 'tour';
  productId: string;
  quantity: number;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema({
  productType: { type: String, enum: ['flight', 'bus', 'hotel', 'tour'], required: true },
  productId: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1, min: 1 }
}, { _id: false });

const CartSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [CartItemSchema]
}, { timestamps: true });

export const Cart = mongoose.model<ICart>('Cart', CartSchema);

import mongoose, { Schema, Document } from 'mongoose';

export enum DiscountType {
  Percentage = 'percentage',
  Flat = 'flat'
}

export interface ICoupon extends Document {
  code: string;
  discountType: DiscountType;
  value: number;
  minCartAmount: number;
  startDate: Date;
  endDate: Date;
  applicableProductTypes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: Object.values(DiscountType), required: true },
  value: { type: Number, required: true },
  minCartAmount: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  applicableProductTypes: [{ type: String, enum: ['flight', 'bus', 'hotel', 'tour'] }]
}, { timestamps: true });

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);

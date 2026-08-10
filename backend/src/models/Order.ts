import mongoose, { Schema, Document } from 'mongoose';

export enum OrderStatus {
  Draft = 'draft',
  PaymentPending = 'payment_pending',
  Paid = 'paid',
  BookingInProgress = 'booking_in_progress',
  Confirmed = 'confirmed',
  PartiallyConfirmed = 'partially_confirmed',
  Failed = 'failed',
  Cancelled = 'cancelled',
  RefundPending = 'refund_pending',
  Refunded = 'refunded',
  Completed = 'completed',
  Disputed = 'disputed'
}

export enum PaymentStatus {
  Pending = 'pending',
  Authorized = 'authorized',
  Captured = 'captured',
  Failed = 'failed',
  Refunded = 'refunded'
}

export interface IOrder extends Document {
  orderNumber: string;
  customerId: mongoose.Types.ObjectId;
  totalAmount: number;
  discountAmount: number;
  netAmount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  couponCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema({
  orderNumber: { type: String, required: true, unique: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  totalAmount: { type: Number, required: true },
  discountAmount: { type: Number, required: true, default: 0 },
  netAmount: { type: Number, required: true },
  currency: { type: String, required: true, default: 'USD' },
  paymentStatus: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.Pending },
  status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.Draft },
  couponCode: { type: String }
}, { timestamps: true });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);

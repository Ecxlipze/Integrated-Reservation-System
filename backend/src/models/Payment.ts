import mongoose, { Schema, Document } from 'mongoose';

export enum PaymentStatus {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
  Refunded = 'refunded'
}

export interface IPayment extends Document {
  orderId: mongoose.Types.ObjectId;
  transactionId?: string;
  amount: number;
  paymentMethod: string;
  status: PaymentStatus;
  gatewayResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  transactionId: { type: String, unique: true, sparse: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.Pending },
  gatewayResponse: { type: Schema.Types.Mixed }
}, { timestamps: true });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);

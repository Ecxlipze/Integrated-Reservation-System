import mongoose, { Schema, Document } from 'mongoose';

export enum OrderItemStatus {
  PendingSupplier = 'pending_supplier',
  Confirmed = 'confirmed',
  Ticketed = 'ticketed',
  VoucherIssued = 'voucher_issued',
  PartiallyCancelled = 'partially_cancelled',
  Cancelled = 'cancelled',
  RescheduleRequested = 'reschedule_requested',
  RefundInProcess = 'refund_in_process',
  RefundCompleted = 'refund_completed'
}

export interface IOrderItem extends Document {
  orderId: mongoose.Types.ObjectId;
  supplierId: mongoose.Types.ObjectId;
  productType: 'flight' | 'bus' | 'hotel' | 'tour';
  productId: string;
  productDetails: any; // Flexible JSON for snapshot of what was booked
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: OrderItemStatus;
  cancellationPolicy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema: Schema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
  productType: { type: String, enum: ['flight', 'bus', 'hotel', 'tour'], required: true },
  productId: { type: String, required: true },
  productDetails: { type: Schema.Types.Mixed, required: true },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: Object.values(OrderItemStatus), default: OrderItemStatus.PendingSupplier },
  cancellationPolicy: { type: String }
}, { timestamps: true });

export const OrderItem = mongoose.model<IOrderItem>('OrderItem', OrderItemSchema);

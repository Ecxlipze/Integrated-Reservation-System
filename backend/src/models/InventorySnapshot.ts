import mongoose, { Schema, Document } from 'mongoose';

export interface IInventorySnapshot extends Document {
  productType: 'flight' | 'bus' | 'hotel' | 'tour';
  productId: string;
  supplierId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  snapshotData: any; // Flexible JSON snapshot (fare, availability, rules)
  snapshotHash: string; // Used to check if inventory changed between search and payment
  expiresAt: Date; // TTL for temporary holds
  status: 'locked' | 'fulfilled' | 'released' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

const InventorySnapshotSchema: Schema = new Schema({
  productType: { type: String, enum: ['flight', 'bus', 'hotel', 'tour'], required: true },
  productId: { type: String, required: true },
  supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  snapshotData: { type: Schema.Types.Mixed, required: true },
  snapshotHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
  status: { type: String, enum: ['locked', 'fulfilled', 'released', 'expired'], default: 'locked' }
}, { timestamps: true });

export const InventorySnapshot = mongoose.model<IInventorySnapshot>('InventorySnapshot', InventorySnapshotSchema);

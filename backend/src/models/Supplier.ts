import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
  name: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  taxId?: string;
  commissionRate: number; // percentage
  status: 'active' | 'inactive' | 'suspended';
  linkedUserId: mongoose.Types.ObjectId; // The user account managing this supplier
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema: Schema = new Schema({
  name: { type: String, required: true },
  contactPerson: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
  taxId: { type: String },
  commissionRate: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  linkedUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const Supplier = mongoose.model<ISupplier>('Supplier', SupplierSchema);

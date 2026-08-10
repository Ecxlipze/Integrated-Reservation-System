import mongoose, { Schema, Document } from 'mongoose';

export enum TransactionType {
  Credit = 'credit',
  Debit = 'debit'
}

export interface IWalletTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  type: TransactionType;
  description: string;
  relatedOrderId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WalletTransactionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: Object.values(TransactionType), required: true },
  description: { type: String, required: true },
  relatedOrderId: { type: Schema.Types.ObjectId, ref: 'Order' }
}, { timestamps: true });

export const WalletTransaction = mongoose.model<IWalletTransaction>('WalletTransaction', WalletTransactionSchema);

import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export enum UserRole {
  Customer = 'Customer',
  Supplier = 'Supplier',
  Agent = 'Agent',
  Support = 'Support',
  Admin = 'Admin'
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended';
  referralCode: string;
  referredBy?: mongoose.Types.ObjectId;
  hasCompletedFirstOrder: boolean;
  currentChallenge?: string;
  authenticators: Array<{
    credentialID: string;
    credentialPublicKey: string;
    counter: number;
    credentialDeviceType: string;
    credentialBackedUp: boolean;
    transports?: string[];
  }>;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.Customer },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  referralCode: { type: String, required: true, unique: true },
  referredBy: { type: Schema.Types.ObjectId, ref: 'User' },
  hasCompletedFirstOrder: { type: Boolean, default: false },
  
  // WebAuthn Fields
  currentChallenge: { type: String },
  authenticators: [{
    credentialID: { type: String, required: true },
    credentialPublicKey: { type: String, required: true },
    counter: { type: Number, required: true },
    credentialDeviceType: { type: String, required: true },
    credentialBackedUp: { type: Boolean, required: true },
    transports: [{ type: String }]
  }]
}, { timestamps: true });

UserSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash as string, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', UserSchema);

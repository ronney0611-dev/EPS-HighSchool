import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  email: string
  password: string
  isPaid: boolean
  paidUntil: Date | null
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  isPaid: { type: Boolean, default: false },
  paidUntil: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
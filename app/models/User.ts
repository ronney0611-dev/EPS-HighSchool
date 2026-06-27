import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: 'user' | 'admin'
  isPaid: boolean
  paidUntil: Date | null
  level: 'lycee' | 'cem' | 'primaire'
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  name: { type: String, default: '' },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isPaid: { type: Boolean, default: false },
  paidUntil: { type: Date, default: null },
  level: { type: String, enum: ['lycee', 'cem', 'primaire'], default: 'lycee' },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
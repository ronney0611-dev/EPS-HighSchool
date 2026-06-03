import mongoose, { Schema, Document } from 'mongoose'

export type PaymentMethod = 'BARIDIMOB' | 'CHARGILY'
export type SubscriptionPlan = 'MONTHLY' | 'YEARLY'
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface IManualPayment extends Document {
  userId: mongoose.Types.ObjectId
  method: PaymentMethod
  plan: SubscriptionPlan
  amount: number
  receiptUrl: string
  transactionNumber?: string
  status: PaymentStatus
  adminNotes?: string
  createdAt: Date
  updatedAt: Date
}

const ManualPaymentSchema = new Schema<IManualPayment>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  method: { type: String, enum: ['BARIDIMOB', 'CHARGILY'], required: true },
  plan: { type: String, enum: ['MONTHLY', 'YEARLY'], required: true },
  amount: { type: Number, required: true },
  receiptUrl: { type: String, required: true },
  transactionNumber: { type: String },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  adminNotes: { type: String },
}, { timestamps: true })

export default mongoose.models.ManualPayment || mongoose.model<IManualPayment>('ManualPayment', ManualPaymentSchema)
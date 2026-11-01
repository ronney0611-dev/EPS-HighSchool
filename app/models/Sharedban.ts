// app/models/SharedBan.ts
// A teacher blocked by the admin from commenting and publishing (the rest of the app still works for him).
import mongoose, { Document, Schema, Model } from "mongoose";

export interface ISharedBan extends Document {
  userId: mongoose.Types.ObjectId;
  reason: string;
  createdAt: Date;
}

const SharedBanSchema = new Schema<ISharedBan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    reason: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const SharedBan: Model<ISharedBan> =
  (mongoose.models.SharedBan as Model<ISharedBan>) || mongoose.model<ISharedBan>("SharedBan", SharedBanSchema);

export default SharedBan;
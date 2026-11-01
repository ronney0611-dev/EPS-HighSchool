import mongoose, { Document, Schema, Model } from "mongoose";

export interface ISharedReport extends Document {
  targetType: "comment" | "item";
  targetId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const SharedReportSchema = new Schema<ISharedReport>(
  {
    targetType: { type: String, enum: ["comment", "item"], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

SharedReportSchema.index({ targetType: 1, targetId: 1, userId: 1 }, { unique: true });

const SharedReport: Model<ISharedReport> =
  (mongoose.models.SharedReport as Model<ISharedReport>) || mongoose.model<ISharedReport>("SharedReport", SharedReportSchema);

export default SharedReport;
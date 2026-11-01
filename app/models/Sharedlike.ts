// app/models/SharedLike.ts
// One row per teacher per item per kind -> a teacher counts only once.
// "copy" is used so the copies counter grows once per teacher (copying twice does not inflate it).
import mongoose, { Document, Schema, Model } from "mongoose";

export type LikeKind = "useful" | "tried" | "copy";

export interface ISharedLike extends Document {
  itemId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  kind: LikeKind;
  createdAt: Date;
}

const SharedLikeSchema = new Schema<ISharedLike>(
  {
    itemId: { type: Schema.Types.ObjectId, ref: "SharedItem", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    kind: { type: String, enum: ["useful", "tried", "copy"], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

SharedLikeSchema.index({ itemId: 1, userId: 1, kind: 1 }, { unique: true });
SharedLikeSchema.index({ userId: 1, kind: 1 });

const SharedLike: Model<ISharedLike> =
  (mongoose.models.SharedLike as Model<ISharedLike>) || mongoose.model<ISharedLike>("SharedLike", SharedLikeSchema);

export default SharedLike;
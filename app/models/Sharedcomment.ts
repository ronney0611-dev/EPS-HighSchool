// app/models/SharedComment.ts
// Comments under a shared item. parentId = the comment it answers (one level of replies).
import mongoose, { Document, Schema, Model } from "mongoose";

export const COMMENT_MAX = 1500;

export interface ISharedComment extends Document {
  itemId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  authorName: string;
  text: string;
  parentId: mongoose.Types.ObjectId | null;
  reports: number;
  hidden: boolean;   // true after 3 reports or by the admin
  createdAt: Date;
  updatedAt: Date;
}

const SharedCommentSchema = new Schema<ISharedComment>(
  {
    itemId: { type: Schema.Types.ObjectId, ref: "SharedItem", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, default: "" },
    text: { type: String, required: true, trim: true, maxlength: COMMENT_MAX },
    parentId: { type: Schema.Types.ObjectId, ref: "SharedComment", default: null },
    reports: { type: Number, default: 0 },
    hidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

SharedCommentSchema.index({ itemId: 1, createdAt: -1 });
SharedCommentSchema.index({ userId: 1, createdAt: -1 }); // the 5 seconds rule
SharedCommentSchema.index({ hidden: 1, reports: -1 });   // admin page

const SharedComment: Model<ISharedComment> =
  (mongoose.models.SharedComment as Model<ISharedComment>) || mongoose.model<ISharedComment>("SharedComment", SharedCommentSchema);

export default SharedComment;
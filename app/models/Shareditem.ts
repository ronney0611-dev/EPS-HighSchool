import mongoose, { Document, Schema, Model } from "mongoose";

export type SharedType = "fiche" | "wahda" | "ficheP";
export type SharedStage = "lycee" | "primaire" | "cem";

export interface ISharedItem extends Document {
  authorId: mongoose.Types.ObjectId;   // = session.user.id (same id as WahdaDoc.teacherId)
  authorName: string;                  // copied from Teacher.name when publishing
  sourceId: mongoose.Types.ObjectId | null; // the teacher's own fiche / وحدة: publishing it again UPDATES the same shared item
  type: SharedType;
  stage: SharedStage;                  // old items have no stage = lycée
  level: string;                       // "1".."3" lycée, "1".."5" primaire
  sports: string[];                    // fiche: [individual, collective] / wahda: [sport]
  label: string;                       // "تعليمية 3", "تقويم تشخيصي", "الفصل 1"...
  title: string;
  payload: Record<string, unknown>;    // fiche: {level, sessionNumber, individual, collective, fields} / wahda: {sport, trimester, sessions, kaidiIndex, ahdafIndex}
  copies: number;
  useful: number;
  tried: number;
  comments: number;
  reports: number;
  published: boolean;                  // false = unpublished by the author
  hidden: boolean;                     // true = hidden by the admin
  createdAt: Date;
  updatedAt: Date;
}

const SharedItemSchema = new Schema<ISharedItem>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    authorName: { type: String, default: "" },
    sourceId: { type: Schema.Types.ObjectId, default: null },
    type: { type: String, enum: ["fiche", "wahda", "ficheP"], required: true },
    stage: { type: String, enum: ["lycee", "primaire", "cem"], default: "lycee" },
    level: { type: String, enum: ["1", "2", "3", "4", "5"], required: true },
    sports: { type: [String], default: [] },
    label: { type: String, default: "" },
    title: { type: String, required: true, maxlength: 200 },
    payload: { type: Schema.Types.Mixed, required: true },
    copies: { type: Number, default: 0 },
    useful: { type: Number, default: 0 },
    tried: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    reports: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
    hidden: { type: Boolean, default: false },
  },
  { timestamps: true, minimize: false }
);

// library: visible items, filtered by type/level/sport, sorted by copies or date
SharedItemSchema.index({ published: 1, hidden: 1, type: 1, level: 1, copies: -1 });
SharedItemSchema.index({ published: 1, hidden: 1, createdAt: -1 });
SharedItemSchema.index({ sports: 1 });
SharedItemSchema.index({ stage: 1, level: 1 });
SharedItemSchema.index({ authorId: 1, type: 1, sourceId: 1 });
SharedItemSchema.index({ reports: -1 }); // admin page

const SharedItem: Model<ISharedItem> =
  (mongoose.models.SharedItem as Model<ISharedItem>) || mongoose.model<ISharedItem>("SharedItem", SharedItemSchema);

export default SharedItem;
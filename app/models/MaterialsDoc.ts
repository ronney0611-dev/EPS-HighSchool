import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMaterialItem {
  name: string;
  quantity: string;
  condition: { bad: string; used: string; new: string };
  note: string;
}

export interface IMaterialsDoc extends Document {
  teacherId: mongoose.Types.ObjectId;
  items: IMaterialItem[];
  createdAt: Date;
  updatedAt: Date;
}

const MaterialItemSchema = new Schema<IMaterialItem>(
  {
    name: { type: String, required: true, maxlength: 120 },
    quantity: { type: String, default: "", maxlength: 10 },
    condition: {
      bad: { type: String, default: "", maxlength: 10 },
      used: { type: String, default: "", maxlength: 10 },
      new: { type: String, default: "", maxlength: 10 },
    },
    note: { type: String, default: "", maxlength: 300 },
  },
  { _id: false }
);

const MaterialsDocSchema = new Schema<IMaterialsDoc>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: { type: [MaterialItemSchema], default: [] },
  },
  { timestamps: true }
);

const MaterialsDoc: Model<IMaterialsDoc> =
  (mongoose.models.MaterialsDoc as Model<IMaterialsDoc>) || mongoose.model<IMaterialsDoc>("MaterialsDoc", MaterialsDocSchema);

export default MaterialsDoc;
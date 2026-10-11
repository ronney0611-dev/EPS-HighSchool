import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFicheTech extends Document {
  owner: string;
  title: string;
  level: string;
  sessionNumber: unknown;
  individual: unknown;
  collective: unknown;
  fields: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const FicheTechSchema: Schema<IFicheTech> = new Schema(
  {
    owner: { type: String, required: true, index: true },
    title: { type: String, default: "" },
    level: { type: String, required: true },
    sessionNumber: { type: Schema.Types.Mixed, required: true },
    individual: { type: Schema.Types.Mixed, required: true },
    collective: { type: Schema.Types.Mixed, required: true },
    fields: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false }
);

delete (mongoose.models as Record<string, Model<IFicheTech>>)["FicheTech"];

const FicheTech: Model<IFicheTech> = mongoose.model<IFicheTech>("FicheTech", FicheTechSchema);

export default FicheTech;
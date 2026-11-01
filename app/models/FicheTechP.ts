import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFichePick {
    maidan: string;
    unitName: string | null;
    count: number;
    chosenIds: (string | null)[];
}

export interface IFicheTechP extends Document {
    teacherId: mongoose.Types.ObjectId;
    title: string;
    level: string;
    pick: IFichePick;
    fields: Record<string, string>;
    createdAt: Date;
    updatedAt: Date;
}

const FicheTechPSchema = new Schema<IFicheTechP>(
    {
        teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        title: { type: String, default: "", maxlength: 200 },
        level: { type: String, required: true, maxlength: 20 },
        pick: {
            maidan: { type: String, required: true, maxlength: 40 },
            unitName: { type: String, default: null, maxlength: 120 },
            count: { type: Number, default: 1 },
            chosenIds: { type: [String], default: [] },
        },
        fields: { type: Schema.Types.Mixed, default: {} },
    },
    { timestamps: true, minimize: false }
);

const FicheTechP: Model<IFicheTechP> =
    (mongoose.models.FicheTechP as Model<IFicheTechP>) || mongoose.model<IFicheTechP>("FicheTechP", FicheTechPSchema);

export default FicheTechP;
import mongoose, { Schema, Document, Model } from "mongoose";

interface IStudentGrade {
  name: string;
  matricule: string;
  final: number;
}

export interface ITahsiliDoc extends Document {
  classId: mongoose.Types.ObjectId;
  activity: 'sprint' | 'longjump' | 'throw';
  students: IStudentGrade[];
  createdAt: Date;
  updatedAt: Date;
}

const TahsiliDocSchema: Schema<ITahsiliDoc> = new Schema(
  {
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    activity: {
      type: String,
      enum: ['sprint', 'longjump', 'throw'],
      required: true,
    },
    students: [
      {
        name: { type: String, required: true },
        matricule: { type: String, default: "" },
        final: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

TahsiliDocSchema.index({ classId: 1, activity: 1 }, { unique: true });

delete (mongoose.models as Record<string, Model<ITahsiliDoc>>)["TahsiliDoc"];

const TahsiliDoc: Model<ITahsiliDoc> =
  mongoose.model<ITahsiliDoc>("TahsiliDoc", TahsiliDocSchema);

export default TahsiliDoc;
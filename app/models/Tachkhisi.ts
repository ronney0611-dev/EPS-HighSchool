import mongoose, { Schema, Document, Model } from "mongoose";

interface ICriteriaScore {
  t1: number;
  t2: number;
}

interface INumericalResult {
  t1: number;
  t2: number;
}

interface IStudentEvaluation {
  name: string;
  score: ICriteriaScore[];
  result?: INumericalResult;
  percentaget1: number;
  percentaget2: number;
  tatawaor: number;
  levelT1?: string;
  levelT2?: string;
}

interface IMochirAverage {
  t1: number;
  t2: number;
}

export interface ITachkhisiDoc extends Document {
  classId: mongoose.Types.ObjectId;
  sportKey: string;
  sportType: 'fardi' | 'groupe';
  mochirCount: number;
  selectedIndicatorIds: number[];
  students: IStudentEvaluation[];
  mochirAverages: IMochirAverage[]; // % per مؤشر → feeds وحدة تعلمية
  createdAt: Date;
  updatedAt: Date;
}

const TachkhisiDocSchema: Schema<ITachkhisiDoc> = new Schema(
  {
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    sportKey: {
      type: String,
      required: true,
    },
    sportType: {
      type: String,
      enum: ["fardi", "groupe"],
      required: true,
      default: "fardi",
    },
    mochirCount: {
      type: Number,
      required: true,
    },
    selectedIndicatorIds: {
      type: [Number],
      required: true,
    },
    students: [
      {
        name: { type: String, required: true },
        score: [
          {
            t1: { type: Number, default: 0 },
            t2: { type: Number, default: 0 },
          },
        ],
        result: {
          t1: { type: Number, default: 0 },
          t2: { type: Number, default: 0 },
        },
        percentaget1: { type: Number, default: 0 },
        percentaget2: { type: Number, default: 0 },
        tatawaor: { type: Number, default: 0 },
        levelT1: { type: String, default: '' },  
        levelT2: { type: String, default: '' },
      },
    ],
    mochirAverages: [
      {
        t1: { type: Number, default: 0 },
        t2: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

TachkhisiDocSchema.index(
  { classId: 1, sportKey: 1, sportType: 1 },
  { unique: true }
);

delete (mongoose.models as Record<string, Model<ITachkhisiDoc>>)["TachkhisiDoc"];

const TachkhisiDoc: Model<ITachkhisiDoc> =
  mongoose.model<ITachkhisiDoc>("TachkhisiDoc", TachkhisiDocSchema);

export default TachkhisiDoc;
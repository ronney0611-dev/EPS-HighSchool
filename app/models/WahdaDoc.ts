import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISession {
  sessionNumber: number;
  indicatorId: number;
  indicatorText: string;
  goal: string;
  isReminder: boolean;
}

// Plain Object Interface (Used by frontend state and hooks)
export interface IWahda {
  _id?: string;
  teacherId?: string; // Change from 'teacherId: string' to 'teacherId?: string'
  level: '1' | '2' | '3';
  sport: string;
  trimester: '1' | '2' | '3';
  sessions: ISession[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Mongoose Backend Document Interface
export interface IWahdaDoc extends Omit<IWahda, '_id' | 'teacherId'>, Document {
  teacherId: mongoose.Types.ObjectId;
}

const SessionSchema: Schema<ISession> = new Schema({
  sessionNumber: { type: Number, required: true },
  indicatorId: { type: Number, required: true },
  indicatorText: { type: String, required: true },
  goal: { type: String, required: true },
  isReminder: { type: Boolean, default: false },
});

const WahdaDocSchema: Schema<IWahdaDoc> = new Schema(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
      index: true,
    },
    level: {
      type: String,
      enum: ['1', '2', '3'],
      required: true,
    },
    sport: {
      type: String,
      required: true,
    },
    trimester: {
      type: String,
      enum: ['1', '2', '3'],
      required: true,
    },
    sessions: [SessionSchema],
  },
  { timestamps: true }
);

delete (mongoose.models as Record<string, Model<IWahdaDoc>>)["WahdaDoc"];
const WahdaDoc = mongoose.model<IWahdaDoc>("WahdaDoc", WahdaDocSchema);

export default WahdaDoc;
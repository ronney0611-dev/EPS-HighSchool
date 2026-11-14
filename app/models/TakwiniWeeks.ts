import mongoose, { Document } from "mongoose";

export interface ITakwiniWeeks extends Document {
    teacher: string,
    activity: string,
    weeks: number[],
}

const TakwiniWeeksSchema = new mongoose.Schema<ITakwiniWeeks>({
    teacher: { type: String, required: true },
    activity: { type: String, required: true },
    weeks: { type: [Number], default: [] },
}, { timestamps: true });

TakwiniWeeksSchema.index({ teacher: 1, activity: 1 }, { unique: true });

export default (mongoose.models.TakwiniWeeks as mongoose.Model<ITakwiniWeeks>) ||
    mongoose.model<ITakwiniWeeks>('TakwiniWeeks', TakwiniWeeksSchema);
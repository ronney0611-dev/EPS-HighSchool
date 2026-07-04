import mongoose, { Document } from "mongoose";

export interface ITakwini {
    studentId: mongoose.Types.ObjectId,
    performances: string[],
    bestFardi: number,
}

export interface ITakwiniAll extends Document {
    classId: mongoose.Types.ObjectId,
    activity: string,
    students: ITakwini[],
    groupLevels: Map<string, string>,
    groupNotes: Map<string, number>,
}

const TakwiniSchema = new mongoose.Schema<ITakwini>({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    performances: [{ type: String }],
    bestFardi: { type: Number },
});

const AllTakwiniSchema = new mongoose.Schema<ITakwiniAll>({
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    activity: { type: String },
    students: [TakwiniSchema],
    groupLevels: { type: Map, of: String },
    groupNotes: { type: Map, of: Number },
}, {
    toJSON: { flattenMaps: true },
    toObject: { flattenMaps: true },
});

AllTakwiniSchema.index({ classId: 1, activity: 1 }, { unique: true });

delete (mongoose.models as Record<string, mongoose.Model<ITakwiniAll>>)['Takwini'];
export default mongoose.model<ITakwiniAll>('Takwini', AllTakwiniSchema);
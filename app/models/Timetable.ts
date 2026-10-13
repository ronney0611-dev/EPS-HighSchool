import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITimetableSlot {
    day: number;
    start: number;
    end: number;
    classId: mongoose.Types.ObjectId;
}

export interface ITimetable extends Document {
    owner: string;
    slots: ITimetableSlot[];
    createdAt: Date;
    updatedAt: Date;
}

const TimetableSchema: Schema<ITimetable> = new Schema(
    {
        owner: { type: String, required: true, unique: true, index: true },
        slots: [
            {
                day: { type: Number, required: true, min: 0, max: 4 },
                start: { type: Number, required: true, min: 480, max: 990 },   
                end: { type: Number, required: true, min: 540, max: 1050 },
                classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
            },
        ],
    },
    { timestamps: true }
);

delete (mongoose.models as Record<string, Model<ITimetable>>)["Timetable"];

const Timetable: Model<ITimetable> = mongoose.model<ITimetable>("Timetable", TimetableSchema);

export default Timetable;
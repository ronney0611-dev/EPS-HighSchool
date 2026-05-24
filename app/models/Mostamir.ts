import mongoose, { Schema, Document, Model } from "mongoose";

interface IStudentScores {
    studentId: mongoose.Types.ObjectId;
    name: string;
    scores: number[];
    total: number;
}

export interface IMostamirDoc extends Document {
    classId: mongoose.Types.ObjectId;
    students: IStudentScores[];
    createdAt: Date;
    updatedAt: Date;
}

const MostamirDocSchema: Schema<IMostamirDoc> = new Schema(
    {
        classId: {
            type: Schema.Types.ObjectId,
            ref: "Class",
            required: true,
            unique: true,
            index: true,
        },
        students: [
            {
                studentId: {
                    type: Schema.Types.ObjectId,
                    ref: "Student",
                    required: true,
                },
                name: { type: String, required: true },
                scores: {
                    type: [Number],
                    default: [5, 5, 5, 5],
                    validate: {
                        validator: (val: number[]) => val.length === 4,
                        message: "Scores must contain exactly 4 values.",
                    },
                },
                total: { type: Number, default: 20 },
            },
        ],
    },
    { timestamps: true }
);

delete (mongoose.models as Record<string, Model<IMostamirDoc>>)["MostamirDoc"];

const MostamirDoc: Model<IMostamirDoc> =
    mongoose.model<IMostamirDoc>("MostamirDoc", MostamirDocSchema);

export default MostamirDoc;
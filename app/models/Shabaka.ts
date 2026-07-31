import mongoose, { Document, Schema } from "mongoose";

export interface IStudentCheck {
    studentId: string;
    name: string;
    checks: boolean[][]; // [maiyarIndex][mouachirIndex]
}

export interface IShabaka extends Document {
    classId: string;
    teacher: string;
    level: string;
    maidanIndex: number;
    tashkhisi?: {
        students: IStudentCheck[];
    };
    tahsili?: {
        students: IStudentCheck[];
    };
}

const StudentCheckSchema = new Schema<IStudentCheck>({
    studentId: { type: String, required: true },
    name: { type: String, required: true },
    checks: { type: [[Boolean]], required: true },
}, { _id: false });

const ShabakaSchema = new Schema<IShabaka>({
    classId: { type: String, required: true },
    teacher: { type: String, required: true },
    level: { type: String, required: true },
    maidanIndex: { type: Number, required: true },
    tashkhisi: {
        students: { type: [StudentCheckSchema], default: undefined },
    },
    tahsili: {
        students: { type: [StudentCheckSchema], default: undefined },
    },
}, { timestamps: true });

ShabakaSchema.index({ classId: 1, maidanIndex: 1, teacher: 1 }, { unique: true });

export default mongoose.models.Shabaka || mongoose.model<IShabaka>('Shabaka', ShabakaSchema);
import mongoose, { Document, Schema } from "mongoose";

export interface IStudent extends Document {
    classId: mongoose.Types.ObjectId,
    matricule: string,
    name: string,
    gender: string,
    status: string,
}

const StudentSchema = new Schema<IStudent>({
    classId: { type: mongoose.Types.ObjectId, ref: 'Class', required: true },
    matricule: { type: String, required: false },
    name: { type: String, required: true },
    gender: { type: String, required: true },
    status: { type: String, required: true },
},
    {
        timestamps: true
    });

StudentSchema.index({ classId: 1, matricule: 1 }, { unique: true, sparse: true });

export default mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);
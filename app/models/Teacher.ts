import mongoose, { Document, Schema } from "mongoose";

export interface ITeacher extends Document {
    userId: mongoose.Types.ObjectId ,
    name: string, school: string, nationality: string,
    birthday: string, birthloc: string, statu: string,
    email: string, phone: string, univerLic: string,
    anneLic: string, univerMas: string, anneMas: string,
}

const TeacherSchema = new Schema<ITeacher>({
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: false },
    school: { type: String, required: false },
    nationality: { type: String, required: false },
    birthday: { type: String, required: false },
    birthloc: { type: String, required: false },
    statu: { type: String, required: false },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    univerLic: { type: String, required: false },
    anneLic: { type: String, required: false },
    univerMas: { type: String, required: false },
    anneMas: { type: String, required: false },
});

export default mongoose.models.Teacher || mongoose.model<ITeacher>('Teacher', TeacherSchema);
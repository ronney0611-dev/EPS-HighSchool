import mongoose, { Document, Schema } from "mongoose";

export interface IGroupStudent {
    _id: mongoose.Types.ObjectId;
    name: string;
    gender: string;
    level: string;
}

export interface IGroup {
    name: string;
    leader: string | undefined;
    students: IGroupStudent[];
}

export interface IGroupe extends Document {
    classId: mongoose.Types.ObjectId;
    groupe: IGroup[];
}

const GroupStudentSchema = new Schema<IGroupStudent>({
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    name: { type: String },
    gender: { type: String },
    level: { type: String },
});

const GroupeSchema = new Schema<IGroup>({
    name: { type: String },
    leader: { type: String },
    students: [GroupStudentSchema],
});

const GroupeDocSchema = new Schema<IGroupe>({
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    groupe: [GroupeSchema],
});

delete (mongoose.models as Record<string, mongoose.Model<IGroupe>>)['Groupe'];

export default mongoose.model<IGroupe>('Groupe', GroupeDocSchema);
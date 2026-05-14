import mongoose, { Document, Schema } from "mongoose";


export interface IClass extends Document {
    name: string,
    teacher: string,
    level: string,
}

const ClassSchema = new Schema<IClass>({
    name: {type: String, required: true},
    teacher: {type: String, required: true},
    level: {type: String, required: true},
},
{    timestamps: true
});
ClassSchema.index({ teacher:1});

export default mongoose.models.Class || mongoose.model<IClass>('Class', ClassSchema); 

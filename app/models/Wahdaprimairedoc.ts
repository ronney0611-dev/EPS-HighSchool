// app/models/WahdaPrimaireDoc.ts
import mongoose, { Schema, model, models, Document } from 'mongoose'

export interface ISessionPrimaire {
    type: 'diagnostic' | 'learning' | 'integration' | 'summative'
    unit_name: string
    kafa_components: string
    knowledge_resources: string
    learning_content: string
    execution_content: string
    guidelines: string
}

export interface IWahdaPrimaireDoc extends Document {
    teacherId: string
    classId: string
    level: string   // s1..s5
    maidanId: number
    maidanName: string
    kafaKhitamya: string
    sessions: ISessionPrimaire[]
    createdAt?: Date
    updatedAt?: Date
}

const SessionPrimaireSchema = new Schema<ISessionPrimaire>({
    type: { type: String, required: true },
    unit_name: { type: String, default: '' },
    kafa_components: { type: String, default: '' },
    knowledge_resources: { type: String, default: '' },
    learning_content: { type: String, default: '' },
    execution_content: { type: String, default: '' },
    guidelines: { type: String, default: '' },
}, { _id: false })

const WahdaPrimaireSchema = new Schema<IWahdaPrimaireDoc>({
    teacherId: { type: String, required: true, index: true },
    classId: { type: String, required: true, index: true },
    level: { type: String, required: true },
    maidanId: { type: Number, required: true },
    maidanName: { type: String, default: '' },
    kafaKhitamya: { type: String, default: '' },
    sessions: { type: [SessionPrimaireSchema], default: [] },
}, { timestamps: true })

WahdaPrimaireSchema.index(
    { teacherId: 1, classId: 1, level: 1, maidanId: 1},
    { unique: true }
)

export default (models.WahdaPrimaireDoc as mongoose.Model<IWahdaPrimaireDoc>) ||
    model<IWahdaPrimaireDoc>('WahdaPrimaireDoc', WahdaPrimaireSchema)
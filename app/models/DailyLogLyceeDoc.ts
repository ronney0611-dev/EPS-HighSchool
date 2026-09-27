import mongoose, { Schema, model, models, Document } from 'mongoose'

export interface IDailyLogLyceeEntry extends Document {
    teacherId: string
    classId: string
    className: string
    institution: string
    date: string
    time: string
    sport: string
    done: boolean
    reason: string
    nextTime: string
    createdAt?: Date
    updatedAt?: Date
}

const DailyLogLyceeSchema = new Schema<IDailyLogLyceeEntry>({
    teacherId: { type: String, required: true, index: true },
    classId: { type: String, required: true, index: true },
    className: { type: String, default: '' },
    institution: { type: String, default: '' },
    date: { type: String, required: true },
    time: { type: String, default: '' },
    sport: { type: String, required: true },
    done: { type: Boolean, required: true },
    reason: { type: String, default: '' },
    nextTime: { type: String, default: '' },
}, { timestamps: true })

DailyLogLyceeSchema.index({ teacherId: 1, date: 1 })

export default (models.DailyLogLyceeDoc as mongoose.Model<IDailyLogLyceeEntry>) ||
    model<IDailyLogLyceeEntry>('DailyLogLyceeDoc', DailyLogLyceeSchema)
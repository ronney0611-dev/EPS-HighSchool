import mongoose, { Schema, model, models, Document } from 'mongoose'

export interface IDailyLogEntry extends Document {
    teacherId: string
    classId: string
    className: string      // snapshot of القسم at time of entry
    institution: string    // snapshot of المؤسسة at time of entry
    date: string            // free text / ISO date, e.g. "2026-09-29"
    time: string             // free text, e.g. "8:30 - 9:30"
    teachingContent: string // التعلمات — pulled from wahda session (kafa_components)
    learningContent: string // محتوى التعلم — pulled from wahda session (learning_content)
    notes: string            // الملاحظات
    level?: string
    maidanId?: number
    sessionIndex?: number
    createdAt?: Date
    updatedAt?: Date
}

const DailyLogSchema = new Schema<IDailyLogEntry>({
    teacherId: { type: String, required: true, index: true },
    classId: { type: String, required: true, index: true },
    className: { type: String, default: '' },
    institution: { type: String, default: '' },
    date: { type: String, required: true },
    time: { type: String, default: '' },
    teachingContent: { type: String, default: '' },
    learningContent: { type: String, default: '' },
    notes: { type: String, default: '' },
    level: { type: String },
    maidanId: { type: Number },
    sessionIndex: { type: Number },
}, { timestamps: true })

DailyLogSchema.index({ teacherId: 1, date: 1 })

export default (models.DailyLogDoc as mongoose.Model<IDailyLogEntry>) ||
    model<IDailyLogEntry>('DailyLogDoc', DailyLogSchema)
import mongoose, { Document, Schema } from "mongoose";

export interface IAttendance {
    studentId: mongoose.Types.ObjectId,
    sessions: string[],
}

export interface IAttendanceAll extends Document {
    classId: mongoose.Types.ObjectId,
    attendance: [IAttendance],
}

const AttendanceSchema = new Schema<IAttendance>({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    sessions: [{ type: String }],
});

const AllAttendanceSchema = new Schema<IAttendanceAll>({
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    attendance: [AttendanceSchema],
});

export default mongoose.models.Attendance || mongoose.model<IAttendanceAll>('Attandence', AllAttendanceSchema);


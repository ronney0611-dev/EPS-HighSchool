import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { connectDB } from '@/app/lib/mongo'
import DailylogdocLycee from '@/app/models/DailyLogLyceeDoc'

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    try {
        await connectDB()
        const teacherId = (session.user as { id: string }).id
        const entries = await DailylogdocLycee.find({ teacherId }).sort({ date: 1, createdAt: 1 }).lean()
        return NextResponse.json({ entries })
    } catch (error) {
        console.error('Error fetching lycee daily log:', error)
        return NextResponse.json({ error: 'حدث خطأ أثناء جلب الدفتر اليومي' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { classId, className, institution, date, time, sport, done, reason, nextTime } = body

        if (!classId || !date || !sport) {
            return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
        }

        await connectDB()
        const teacherId = (session.user as { id: string }).id

        const entry = await DailylogdocLycee.create({
            teacherId, classId, className, institution, date, time,
            sport, done, reason, nextTime,
        })

        return NextResponse.json({ entry })
    } catch (error) {
        console.error('Error saving lycee daily log entry:', error)
        return NextResponse.json({ error: 'حدث خطأ أثناء الحفظ' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
        return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
    }

    try {
        await connectDB()
        const teacherId = (session.user as { id: string }).id
        await DailylogdocLycee.deleteOne({ _id: id, teacherId })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting lycee daily log entry:', error)
        return NextResponse.json({ error: 'حدث خطأ أثناء الحذف' }, { status: 500 })
    }
}
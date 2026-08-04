
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { connectDB } from '@/app/lib/mongo'
import Wahdaprimairedoc from '@/app/models/Wahdaprimairedoc'


export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const classId = searchParams.get('classId')
    const level = searchParams.get('level')
    const maidanId = searchParams.get('maidanId')

    if (!classId || !level || !maidanId ) {
        return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
    }

    try {
        await connectDB()
        const doc = await Wahdaprimairedoc.findOne({
            teacherId: (session.user as { id: string }).id,
            classId,
            level,
            maidanId: Number(maidanId),
        }).lean()

        return NextResponse.json({ wahda: doc || null })
    } catch (error) {
        console.error('Error fetching primaire wahda:', error)
        return NextResponse.json({ error: 'حدث خطأ أثناء جلب البيانات' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { classId, level, maidanId, maidanName, kafaKhitamya, sessions } = body

        if (!classId || !level || maidanId === undefined || !Array.isArray(sessions)) {
            return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
        }

        await connectDB()
        const teacherId = (session.user as { id: string }).id

        const doc = await Wahdaprimairedoc.findOneAndUpdate(
            { teacherId, classId, level, maidanId: Number(maidanId) },
            { teacherId, classId, level, maidanId: Number(maidanId), maidanName, kafaKhitamya, sessions },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).lean()

        return NextResponse.json({ wahda: doc })
    } catch (error) {
        console.error('Error saving primaire wahda:', error)
        return NextResponse.json({ error: 'حدث خطأ أثناء الحفظ' }, { status: 500 })
    }
}
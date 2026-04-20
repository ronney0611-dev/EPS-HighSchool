'use client'
import { useTeacher } from '@/hooks/useTeacher'
import Image from 'next/image'
import Link from 'next/link'

const ManageTeacherProfile = () => {
    const { teacher, setTeacher } = useTeacher()

    return (
        <div dir='rtl' className='flex flex-row flex-3 gap-1 bg-black text-white p-4'>
            <div className='flex-1'>

            </div>

            <div className='flex-1'>
                <div>
                    <div className="flex flex-col my-2 border p-2 gap-2">
                        <label>حمل صورتك الشخصية</label>
                        <input className='cursor-pointer' onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) {
                                const reader = new FileReader()
                                reader.onload = () => setTeacher({ ...teacher, photo: reader.result as string })
                                reader.readAsDataURL(file)
                            }
                        }} type="file" accept="image/*" />
                        {teacher.photo && (
                            <Image src={teacher.photo} alt="profile" width={100} height={100} className="w-24 h-24 rounded-full object-cover" />
                        )}
                    </div>
                    <div className='my-4 text-2xl font-bold'>
                        <h1>بطاقة المعلومات الشخصية</h1>
                    </div>
                </div>
                <div className='flex flex-col gap-2 px-2 py-4 text-lg'>
                    <div className='flex gap-2 border p-2'>
                        <label>الاسم واللقب:</label>
                        <input type="text" placeholder='الاسم واللقب' value={teacher.name} onChange={e => setTeacher({ ...teacher, name: e.target.value })} />
                    </div>
                    <div className='flex gap-2 border p-2'>
                        <label>الثانوية:</label>
                        <input type="text" placeholder='الثانوية' value={teacher.school} onChange={e => setTeacher({ ...teacher, school: e.target.value })} />
                    </div>
                    <div className='flex gap-2 border p-2'>
                        <label>الولاية:</label>
                        <input type="text" placeholder='الولاية' value={teacher.birthloc} onChange={e => setTeacher({ ...teacher, birthloc: e.target.value })} />
                    </div>
                    <div className='flex gap-2 border p-2'>
                        <label>الجنسية:</label>
                        <input type="text" placeholder='الجنسية' value={teacher.nationality} onChange={e => setTeacher({ ...teacher, nationality: e.target.value })} />
                    </div>
                    <div className='flex gap-2 border p-2'>
                        <label>تاريخ الميلاد:</label>
                        <input type="date" value={teacher.birthday} onChange={e => setTeacher({ ...teacher, birthday: e.target.value })} />
                    </div>
                    <div className='flex gap-2 border p-2'>
                        <label>الحالة المدنية:</label>
                        <input type="text" placeholder='الحالة المدنية' value={teacher.statu} onChange={e => setTeacher({ ...teacher, statu: e.target.value })} />
                    </div>
                    <div className='flex gap-2 border p-2'>
                        <label>email:</label>
                        <input type="email" placeholder='your email' value={teacher.email} onChange={e => setTeacher({ ...teacher, email: e.target.value })} />
                    </div>
                    <div className='flex gap-2 border p-2'>
                        <label>phone:</label>
                        <input type="text" placeholder='Your phone number' value={teacher.phone} onChange={e => setTeacher({ ...teacher, phone: e.target.value })} />
                    </div>
                    <div className='flex gap-2 border p-2'>
                        <label>الجامعة - ليسانس:</label>
                        <input type="text" placeholder='الجامعة' value={teacher.univerLic} onChange={e => setTeacher({ ...teacher, univerLic: e.target.value })} />
                    </div>
                    <div className='flex gap-2 border p-2'>
                        <label>تاريخ ليسانس:</label>
                        <input type="text" placeholder='التاريخ' value={teacher.anneLic} onChange={e => setTeacher({ ...teacher, anneLic: e.target.value })} />
                    </div>
                    <div className='flex gap-2 border p-2'>
                        <label>الجامعة - ماستر:</label>
                        <input type="text" placeholder='الجامعة' value={teacher.univerMas} onChange={e => setTeacher({ ...teacher, univerMas: e.target.value })} />
                    </div>
                    <div className='flex gap-2 border p-2'>
                        <label>تاريخ ماستر:</label>
                        <input type="text" placeholder='التاريخ' value={teacher.anneMas} onChange={e => setTeacher({ ...teacher, anneMas: e.target.value })} />
                    </div>
                </div>
                <Link href="/profile">
                    <button
                        onClick={() => alert('تم الحفظ ✓')}
                        className='bg-green-500 text-white px-6 py-3 rounded-xl font-bold mt-4 w-full'>
                        حفظ المعلومات
                    </button>
                </Link>

            </div>

            <div className='flex-1'>

            </div>
        </div>
    )
}

export default ManageTeacherProfile
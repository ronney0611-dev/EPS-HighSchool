'use client'
import { useTeacher } from '@/hooks/useTeacher'
import { useClasses } from '@/hooks/useClasses'
import Image from 'next/image'
import Link from 'next/link'
import ManageClasses from '@/pages/ManageClasses'
import GradientText from '../../components/GradientText'

const ProfilePage = () => {
    const { teacher } = useTeacher()
    const { classes } = useClasses()

    const totalStudents = classes.reduce((acc, c) => acc + c.students.length, 0)
    const totalMalade = classes.reduce((acc, c) => acc + c.students.filter(s => s.status === 'malade').length, 0)
    const totalSpecial = classes.reduce((acc, c) => acc + c.students.filter(s => s.status === 'special').length, 0)

    return (
        <div dir="rtl" className='min-h-screen p-6 flex flex-col items-center gap-6'>

            {/* profile card */}
            <div className='bg-white text-black rounded-2xl p-6 w-full max-w-md flex flex-col items-center gap-4 shadow-lg'>
                <div className='w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500'>
                    {teacher.photo
                        ? <Image src={teacher.photo} alt="profile" width={96} height={96} className='w-full h-full object-cover' />
                        : <div className='w-full h-full bg-gray-300 flex items-center justify-center text-3xl'>👤</div>
                    }
                </div>
                <h1 className='text-2xl font-bold'>{teacher.name || 'اسم الأستاذ'}</h1>
                <p className='text-gray-500'>{teacher.school || 'اسم الثانوية'}</p>
                <p className='text-gray-500'>{teacher.birthloc || 'اسم الثانوية'}</p>
                <Link href="/manage-profile" className='bg-blue-500 text-white px-4 py-2 rounded-xl text-sm'>
                    تعديل الملف
                </Link>
            </div>

            {/* stats */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl'>
                <div className='bg-blue-100 text-blue-800 rounded-xl p-4 text-center'>
                    <p className='text-3xl font-bold'>{classes.length}</p>
                    <p className='text-sm mt-1'>الأقسام</p>
                </div>
                <div className='bg-green-100 text-green-800 rounded-xl p-4 text-center'>
                    <p className='text-3xl font-bold'>{totalStudents}</p>
                    <p className='text-sm mt-1'>التلاميذ</p>
                </div>
                <div className='bg-red-100 text-red-800 rounded-xl p-4 text-center'>
                    <p className='text-3xl font-bold'>{totalMalade}</p>
                    <p className='text-sm mt-1'>الإعفاءات</p>
                </div>
                <div className='bg-yellow-100 text-yellow-800 rounded-xl p-4 text-center'>
                    <p className='text-3xl font-bold'>{totalSpecial}</p>
                    <p className='text-sm mt-1'>حالات شاذة</p>
                </div>
            </div>

            {/* classes summary */}
            <div className='w-full max-w-2xl flex flex-col gap-3'>
                <h2 className='text-xl font-bold'>الأقسام</h2>
                {classes.map((c, i) => (
                    <div key={i} className='bg-white text-black rounded-xl p-4 flex justify-between items-center'>
                        <span className='font-bold text-lg'>{c.name}</span>
                        <div className='flex gap-3 text-sm'>
                            <span className='bg-blue-200 px-2 py-1 rounded-full'>{c.students.filter(s => s.gender === 'male').length} ذكر</span>
                            <span className='bg-pink-200 px-2 py-1 rounded-full'>{c.students.filter(s => s.gender === 'female').length} أنثى</span>
                            <span className='bg-gray-200 px-2 py-1 rounded-full'>{c.students.length} مجموع</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className='flex w-full flex-col justify-center items-center'>
                <hr className='border border-white w-full my-4 mx-8' />
                <div className='flex justify-center text-center '>
                    <GradientText
                        colors={["#ffffff", "#1600eb", "#ffffff"]}
                        animationSpeed={5}
                        showBorder={false}
                        className="custom-class my-6 text-5xl md:text-6xl lg:text-6xl"
                    >
                        ادارة الاقسام
                    </GradientText>
                </div>
                <div className='w-full border border-gray-200 my-4 rounded-2xl overflow-hidden'>
                    <ManageClasses />
                </div>
                <hr className='border border-white w-full my-4 mx-8' />
            </div>
            <button
                type='submit'
                onClick={() => {
                    alert('تم الحفظ ✓')
                    window.location.reload()
                }}
                className='bg-green-500 text-white px-6 py-3 rounded-xl font-bold mt-4'>
                حفظ المعلومات
            </button>
        </div>
    )
}

export default ProfilePage
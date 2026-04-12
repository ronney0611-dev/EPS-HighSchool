'use client'
import Image from 'next/image';
import { useState } from 'react'

const ProfileDoc = () => {
    const [teacherInfo, setTeacherInfo] = useState({
        picture: '',
        name: '',
        nationality: '',
        birthday: '',
        birthloc: '',
        statu: '',
        school: '',
        email: '',
        phone: '',
        experience: '',
        univerLic: '',
        anneLic: '',
        univerMas: '',
        anneMas: '',
    });
    return (
        <div dir="rtl" className=' flex flex-col lg:flex-row lg:my-10 lg:mx-10 p-2 lg:p-10 '>
            {/* info card */}
            <div className=' flex-1 gap-1  bg-black text-white p-4' >
                <div>
                    <div className="flex flex-col my-2 border p-2 gap-2">
                        <label>حمل صورتك الشخصية</label>
                        <input className=' cursor-pointer' onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) {
                                const url = URL.createObjectURL(file)
                                setTeacherInfo({ ...teacherInfo, picture: url })
                            }
                        }} type="file" accept="image/*" />
                        {teacherInfo.picture && (
                            <Image src={teacherInfo.picture} alt="profile" width={100} height={100} className="w-24 h-24 rounded-full object-cover" />
                        )}
                    </div>
                    <div className='my-4 text-2xl font-bold'>
                        <h1>بطاقة المعلومات الشخصية</h1>
                    </div>
                </div>
                <div className='flex flex-col gap-2 px-2 py-4 text-lg'>
                    <div>
                        <div className='flex gap-2 border p-2'>
                            <label htmlFor="">الاسم واللقب:</label>
                            <input type="text" placeholder='الاسم واللقب' value={teacherInfo.name} onChange={e => setTeacherInfo({ ...teacherInfo, name: e.target.value })} />
                        </div>
                        <div className='flex gap-2 border p-2'>
                            <label htmlFor="">الثانوية:</label>
                            <input value={teacherInfo.school} onChange={e => setTeacherInfo({ ...teacherInfo, school: e.target.value })} type="text" placeholder='الثانوية' />
                        </div>
                        <div className='flex gap-2 border p-2'>
                            <label htmlFor="">الجنسية:</label>
                            <input value={teacherInfo.nationality} onChange={e => setTeacherInfo({ ...teacherInfo, nationality: e.target.value })} type="text" placeholder='الجنسية' />
                        </div>
                        <div className='flex gap-2 border p-2'>
                            <label htmlFor="">تاريخ الميلاد:</label>
                            <input value={teacherInfo.birthday} onChange={e => setTeacherInfo({ ...teacherInfo, birthday: e.target.value })} type="date" placeholder='تاريخ الميلاد' />
                        </div>
                        <div className='flex gap-2 border p-2'>
                            <label htmlFor="">الولاية:</label>
                            <input value={teacherInfo.birthloc} onChange={e => setTeacherInfo({ ...teacherInfo, birthloc: e.target.value })} type="text" placeholder='الولاية' />
                        </div>
                        <div className='flex gap-2 border p-2'>
                            <label htmlFor="">الحالة المدنية:</label>
                            <input value={teacherInfo.statu} onChange={e => setTeacherInfo({ ...teacherInfo, statu: e.target.value })} type="text" placeholder='الحالة المدنية' />
                        </div>
                        <div className='flex gap-2 border p-2'>
                            <label htmlFor="">email:</label>
                            <input value={teacherInfo.email} onChange={e => setTeacherInfo({ ...teacherInfo, email: e.target.value })} type="email" placeholder='your email' />
                        </div>
                        <div className='flex gap-2 border p-2'>
                            <label htmlFor="">phone:</label>
                            <input value={teacherInfo.phone} onChange={e => setTeacherInfo({ ...teacherInfo, phone: e.target.value })} type="number" placeholder='Your phone number' />
                        </div>
                    </div>
                    <div>
                        <div className='flex gap-2 border p-2'>
                            <label htmlFor="">الجامعة المتحلصل فيها على شهادة ليسانس:</label>
                            <input value={teacherInfo.univerLic} onChange={e => setTeacherInfo({ ...teacherInfo, univerLic: e.target.value })} type="text" placeholder='الجامعة' />
                        </div>
                        <div className='flex gap-2 border p-2'>
                            <label htmlFor="">تاريخ شهادة ليسانس:</label>
                            <input value={teacherInfo.anneLic} onChange={e => setTeacherInfo({ ...teacherInfo, anneLic: e.target.value })} type="number" placeholder='التاريخ' />
                        </div>
                    </div>
                    <div>
                        <div className='flex gap-2 border p-2'>
                            <label htmlFor="">الجامعة المتحلصل فيها على شهادة الماستر:</label>
                            <input value={teacherInfo.univerMas} onChange={e => setTeacherInfo({ ...teacherInfo, univerMas: e.target.value })} type="text" placeholder='الجامعة' />
                        </div>
                        <div className='flex gap-2 border p-2'>
                            <label htmlFor="">تاريخ شهادة الماستر:</label>
                            <input value={teacherInfo.anneMas} onChange={e => setTeacherInfo({ ...teacherInfo, anneMas: e.target.value })} type="number" placeholder='التاريخ' />
                        </div>
                    </div>
                </div>
            </div>
            {/* how it look */}
            <div dir="rtl" className='flex-1 border h-full bg-white text-black my-6 p-4' >
                <div className='flex justify-center items-center border border-gray-400 bg-blue-600 text-white font-bold text-xl py-4 rounded-2xl my-2 ' >
                    <h1>بطاقة المعلومات الشخصية</h1>
                </div>
                <div>
                    <div className='items-center relative' >
                        <Image className=' rounded-full flex justify-center text-center items-center  absolute left-2 top-4 object-cover lg:h-50 lg:w-50 h-20 w-20' src={teacherInfo.picture || '/placeholder.png'} alt='حمل الصورة الخاصة بك' width={200} height={200} />
                    </div>
                    <div className='flex flex-col justify-end my-6 gap-2 mx-2' >
                        <p className='text-xl font-bold text-blue-600' >الاسم و اللقب: <span className='font-medium text-black mx-2' >{teacherInfo.name}</span> </p>
                        <p className='text-xl font-bold text-blue-600' >الثانوية: <span className='font-medium text-black mx-2'>{teacherInfo.school}</span></p>
                        <p className='text-xl font-bold text-blue-600' >الجنسية:<span className='font-medium text-black mx-2'>{teacherInfo.nationality}</span></p>
                        <div>
                            <p className='text-xl font-bold text-blue-600' >تاريخ الميلاد:<span className='font-medium text-black mx-2'>{teacherInfo.birthday}</span></p>
                            <p className='text-xl font-bold text-blue-600' >الولاية:<span className='font-medium text-black mx-2'>{teacherInfo.birthloc}</span></p>
                        </div>
                        <p className='text-xl font-bold text-blue-600' >الحالة:<span className='font-medium text-black mx-2'>{teacherInfo.statu}</span></p>
                        <p className='text-xl font-bold text-blue-600' >البريد الالكتروني:<span className='font-medium text-black mx-2'>{teacherInfo.email}</span></p>
                        <p className='text-xl font-bold text-blue-600' >رقم الهاتف:<span className='font-medium text-black mx-2'>{teacherInfo.phone}</span></p>
                        <div className='border py-2 px-4 w-30 rounded-2xl bg-green-200 border-none my-4' >
                            <p className='text-xl flex text-center justify-center font-bold text-red-700'>المؤهلات</p>
                        </div>
                        <table className='border'>
                            <thead className='border' >
                                <tr className='border'>
                                    <th className='border'>الشهادة</th>
                                    <th className='border'>الجامعة </th>
                                    <th className='border'>التاريخ</th>
                                </tr>
                            </thead>
                            <tbody className='border'>
                                <tr className='border'>
                                    <td className='border text-center'>ليسانس</td>
                                    <td className='border text-center'>{teacherInfo.univerLic}</td>
                                    <td className='border text-center'>{teacherInfo.anneLic}</td>
                                </tr>
                                <tr className='border'>
                                    <td className='border text-center'>ماستر</td>
                                    <td className='border text-center'>{teacherInfo.univerMas}</td>
                                    <td className='border text-center'>{teacherInfo.anneMas}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div className='flex justify-center text-center font-bold my-2' >
                            <p>السنةالدراسية: 2026/2027</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfileDoc

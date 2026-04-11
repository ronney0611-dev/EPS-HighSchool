'use client'
import Image from 'next/image';
import { useState } from 'react'

const ProfileDoc = () => {
    const [teacherInfo, setTeacherInfo] = useState({
        picture: null,
        name: '',
        nationality: '',
        birthday: '',
        birthloc: '',
        statu: '',
        school: '',
        email: '',
        phone: '',
        experience: '',
    });
    return (
        <div>
            {/* info card */}
            <div>
                <div>
                    <div className="flex flex-col gap-2">
                        <label>Upload Picture</label>
                        <input onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) {
                                const url = URL.createObjectURL(file)
                                setTeacherInfo({ ...teacherInfo, picture: url })
                            }
                        }} type="file" accept="image/*" />
                        {teacherInfo.picture && (
                            <img src={teacherInfo.picture} alt="profile" className="w-24 h-24 rounded-full object-cover" />
                        )}
                    </div>
                    <div>
                        <h1>Teacher Information Card</h1>
                    </div>
                </div>
                <div>
                    <div>
                        <div>
                            <label htmlFor="">Name</label>
                            <input type="text" placeholder='Place your Name' value={teacherInfo.name} onChange={e => setTeacherInfo({ ...teacherInfo, name: e.target.value })} />
                        </div>
                        <div>
                            <label htmlFor="">nationality</label>
                            <input value={teacherInfo.nationality} onChange={e => setTeacherInfo({ ...teacherInfo, nationality: e.target.value })} type="text" placeholder='nationality' />

                        </div>
                        <div>
                            <label htmlFor="">birthday</label>
                            <input value={teacherInfo.birthday} onChange={e => setTeacherInfo({ ...teacherInfo, birthday: e.target.value })} type="date" placeholder='Your birthday' />
                        </div>
                        <div>
                            <label htmlFor="">Wilaya</label>
                            <input value={teacherInfo.birthloc} onChange={e => setTeacherInfo({ ...teacherInfo, birthloc: e.target.value })} type="text" placeholder='Wilaya' />
                        </div>

                        <div>
                            <label htmlFor="">School</label>
                            <input value={teacherInfo.school} onChange={e => setTeacherInfo({ ...teacherInfo, school: e.target.value })} type="text" placeholder='School' />
                        </div>
                        <div>
                            <label htmlFor="">email</label>
                            <input value={teacherInfo.email} onChange={e => setTeacherInfo({ ...teacherInfo, email: e.target.value })} type="email" placeholder='your email' />
                        </div>
                        <div>
                            <label htmlFor="">phone</label>
                            <input value={teacherInfo.phone} onChange={e => setTeacherInfo({ ...teacherInfo, phone: e.target.value })} type="number" placeholder='Your phone number' />
                        </div>


                    </div>
                    <div>
                        <div>
                            <label htmlFor="">experience</label>
                            <input value={teacherInfo.experience} onChange={e => setTeacherInfo({ ...teacherInfo, experience: e.target.value })} type="text" placeholder='experience' />
                        </div>
                    </div>
                </div>
            </div>
            {/* how it look */}
            <div dir="rtl" className='border' >
                <div>
                    <h1>teacher Informations</h1>
                </div>
                <div>
                    <div>
                        {/*<Image className='' src={} alt='' width={} height={} />*/}
                    </div>
                    <div>
                        <p className='text-xl font-bold' >الاسم و اللقب <span className='text-lg font-medium' >{teacherInfo.name}</span> </p>
                        <p>school</p>
                        <p>nationality</p>
                        <div>
                            <p>birthday</p>
                            <p>bithloc</p>
                        </div>
                        <p>state</p>
                        <p>email</p>
                        <p>phone</p>
                        <div>
                            <p>experience</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfileDoc

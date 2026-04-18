'use client'

import { useState } from "react"

const TakwimTshHeader = () => {

    const [headerCard, setHeaderCard] = useState({
        activity: '',
        school: '',
        level: '',
        teacher: '',
        class: '',
        bigGaol: '',
        gaol: '',
    });

    return (
        <header dir="rtl" className="mt-10 mx-10  text-black p-4 overflow-x-auto text-center bg-white" >
            <div className="flex  justify-center  gap-2 border border-black py-1 bg-blue-200" >
                <h1 className="text-xl font-bold text-center " >بطاقة التقويم التشخيصي :
                    <input className="mr-2 text-center px-1 border-none text-black" type="text" placeholder="activity" onChange={e => setHeaderCard({ ...headerCard, activity: e.target.value })} />
                </h1>
            </div>
            <div className="grid  lg:grid-cols-4 bg-blue-200 " >
                <div className="border border-black py-1" >
                    <h1 >  المؤسسة :
                        <input className=" border-none px-1" type="text" placeholder="highschool" onChange={e => setHeaderCard({ ...headerCard, school: e.target.value })} />
                    </h1>
                </div>
                <div className="border border-black py-1">
                    <h1> المستوى:
                        <input className=" border-none px-1" type="text" placeholder="level" onChange={e => setHeaderCard({ ...headerCard, level: e.target.value })} />
                    </h1>
                </div>
                <div className="border border-black py-1">
                    <h1>الأستاذ :
                        <input className=" border-none px-1" type="text" placeholder="teacher name" onChange={e => setHeaderCard({ ...headerCard, teacher: e.target.value })} />
                    </h1>
                </div>
                <div className="border border-black py-1">
                    <h1> القسم:
                        <input className="px-1" type="text" placeholder="class" onChange={e => setHeaderCard({ ...headerCard, class: e.target.value })} />
                    </h1>
                </div>
            </div>
            <div className="border border-black bg-blue-200" >
                <h1 className="border-b border-black py-1 pr-2 flex" >الكفاءة القاعدية
                    <input className="mr-4 border-r border-black pr-4 flex-1 " type="text" placeholder="الكفاءة القاعدية" onChange={e => setHeaderCard({ ...headerCard, bigGaol: e.target.value })} />
                </h1>
                <h1 className="py-1 pr-2 flex" > الهدف التعلمي
                    <input className="mr-5 border-r border-black pr-4 flex-1" type="text" placeholder="الهدف التعلمي" onChange={e => setHeaderCard({ ...headerCard, gaol: e.target.value })} />
                </h1>
            </div>
        </header>
    )
}

export default TakwimTshHeader

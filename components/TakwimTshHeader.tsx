'use client'

import { useState } from "react"

const TakwimTshHeader = () => {

    const [headerCard, setHeaderCard] = useState({
        activity : '',
        school : '',
        level: '',
        teacher: '',
        class: '',
        bigGaol: '',
        gaol: '',
    });

    return (
        <header dir="rtl" className="mt-10 mx-10" >
            <div className="flex justify-center gap-2 border py-1 " >
                <h1 className="text-xl font-bold" >بطاقة التقويم التشخيصي 
                    <input className="mr-2 px-1 border-none text-white" type="text" placeholder="activity" onChange={e => setHeaderCard({...headerCard, activity : e.target.value})} />
                </h1>
            </div>
            <div className="flex py-1 justify-between border px-2 " >
                <div className="border-l" >
                    <h1 >  المؤسسة :
                        <input className="mr-2 border-none px-1" type="text" placeholder="highschool" onChange={e => setHeaderCard({...headerCard, school : e.target.value})}  />
                    </h1>
                </div>
                <div className="border-l">
                    <h1> المستوى:
                        <input className="mr-2 border-none px-1" type="text" placeholder="level" onChange={e => setHeaderCard({...headerCard, level : e.target.value})}  />
                    </h1>
                </div>
                <div className="border-l">
                    <h1>الأستاذ :
                        <input className="mr-2 border-none px-1" type="text" placeholder="teacher name" onChange={e => setHeaderCard({...headerCard, teacher : e.target.value})}  />
                    </h1>
                </div>
                <div>
                    <h1> القسم:
                        <input className="px-1" type="text" placeholder="class" onChange={e => setHeaderCard({...headerCard, class : e.target.value})}  />
                    </h1>
                </div>
            </div>
            <div className="border" >
                <h1 className="border-b py-1 pr-2 flex" >الكفاءة القاعدية
                    <input className="mr-4 border-r pr-4 flex-1 " type="text" placeholder="الكفاءة القاعدية" onChange={e => setHeaderCard({...headerCard, bigGaol : e.target.value})}  />
                </h1>
                <h1 className="py-1 pr-2 flex" > الهدف التعلمي
                    <input className="mr-5 border-r pr-4 flex-1" type="text" placeholder="الهدف التعلمي" onChange={e => setHeaderCard({...headerCard, gaol : e.target.value})}  />
                </h1>
            </div>
        </header>
    )
}

export default TakwimTshHeader

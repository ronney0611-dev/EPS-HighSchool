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
        <header>
            <div>
                <h1>بطاقة التقويم التشخيصي 
                    <input type="text" placeholder="activity" onChange={e => setHeaderCard({...headerCard, activity : e.target.value})} />
                </h1>
            </div>
            <div>
                <div>
                    <h1> المؤسسة
                        <input type="text" placeholder="highschool" onChange={e => setHeaderCard({...headerCard, school : e.target.value})}  />
                    </h1>
                </div>
                <div>
                    <h1> المستوى:
                        <input type="text" placeholder="level" onChange={e => setHeaderCard({...headerCard, level : e.target.value})}  />
                    </h1>
                </div>
                <div>
                    <h1>الأستاذ
                        <input type="text" placeholder="teacher name" onChange={e => setHeaderCard({...headerCard, teacher : e.target.value})}  />
                    </h1>
                </div>
                <div>
                    <h1> القسم
                        <input type="text" placeholder="class" onChange={e => setHeaderCard({...headerCard, class : e.target.value})}  />
                    </h1>
                </div>
            </div>
            <div>
                <h1>الكفاءة القاعدية
                    <input type="text" placeholder="الكفاءة القاعدية" onChange={e => setHeaderCard({...headerCard, bigGaol : e.target.value})}  />
                </h1>
                <h1> الهدف التعلمي
                    <input type="text" placeholder="الهدف التعلمي" onChange={e => setHeaderCard({...headerCard, gaol : e.target.value})}  />
                </h1>
            </div>
        </header>
    )
}

export default TakwimTshHeader

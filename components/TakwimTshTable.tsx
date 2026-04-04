'use client'

import { useState } from "react"

const TakwimTshTable = () => {

    const [mochir, setMochir] = useState(3);

    return (
        <section>
            {/* المؤشر */}
        <div>
            <select name="" id="" onChange={e => setMochir(Number(e.target.value))} >
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
            </select>
        </div>
            {/* students */}
            
        </section>
    )
}

export default TakwimTshTable

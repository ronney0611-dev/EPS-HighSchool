'use client'

import { useState } from "react"


const MaterialsCalc = () => {
    const [newMaterial, setNewMaterial] = useState('');
    const [material, setMaterial] = useState<{
        name: string,
        quantity: string,
        quandition: {
            bad: string,
            good: string,
            new: string,
        },
        note: string,
    }[]>([]);
    const [info, setInfo] = useState({
        name: '',
        school: '',
    });
    const addMaterial = () => {
        setMaterial([...material, {
            name: newMaterial,
            quantity: '',
            quandition: {
                bad: '',
                good: '',
                new: '',
            },
            note: '',
        }]);
        setNewMaterial('');
    }
    const updateMaterial = (index: number, field: string, value: string) => {
        const newMaterials = [...material];
        newMaterials[index] = { ...newMaterials[index], [field]: value };
        setMaterial(newMaterials);
    }
    const updateCondition = (index: number, field: string, value: string) => {
        const newMaterials = [...material];
        newMaterials[index] = {
            ...newMaterials[index],
            quandition: { ...newMaterials[index].quandition, [field]: value }
        };
        setMaterial(newMaterials);
    }
    return (
        <div dir="rtl" className="m-6 lg:m-10 flex flex-col" >
            {/*informations handler */}
            <div className="flex flex-col my-4  p-2 lg:p-6 gap-2" >
                <div className='flex gap-2 border p-2'>
                    <label htmlFor="">الاستاذ:</label>
                    <input type="text" value={info.name} onChange={e => setInfo({ ...info, name: e.target.value })} placeholder="الاسم واللقب" />
                </div>
                <div className='flex gap-2 border p-2'>
                    <label htmlFor="">المؤسسة:</label>
                    <input type="text" value={info.school} onChange={e => setInfo({ ...info, school: e.target.value })} name="" id="" placeholder="مكان العمل" />
                </div>
                <div className='flex-col lg:flex lg:flex-row gap-2 border p-2'>
                    <div className="flex flex-row items-center gap-2 p-2">
                        <label htmlFor="">الوسائل التدريبية</label>
                        <input type="text" value={newMaterial} onChange={e => setNewMaterial(e.target.value)} placeholder="اسم الوسيلة" name="" id="" />
                    </div>
                    <button onClick={addMaterial} className="rounded-full cursor-pointer bg-red-600 text-white p-1" >ادخال</button>
                </div>
            </div>
            {/* Materials Calc form */}
            <div className="border p-2 lg:p-6 bg-white text-black" >
                {/*page header */}
                <div>
                    <div className='flex justify-center items-center border border-gray-400 bg-blue-600 text-white font-bold text-xl py-4 rounded-2xl my-2 '>
                        <h1>قائمة جرد وسائل التربية البدنية والرياضية</h1>
                    </div>
                    <div className="flex flex-col my-2" >
                        <p className='text-xl font-bold text-blue-600'> الاستاذ :<span className=' font-medium text-black mx-2'>{info.name}</span> </p>
                        <p className='text-xl font-bold text-blue-600'> المؤسسة :<span className='font-medium text-black mx-2'>{info.school}</span> </p>
                    </div>
                </div>
                {/*tabel */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                        <thead className="">
                            <tr className="">
                                <th className=""></th>
                                <th className=""> </th>
                                <th className=""></th>
                                <th className="border" colSpan={3} >حالة العتاد</th>
                                <th className=""></th>
                            </tr>
                            <tr className="border">
                                <th className="border">الرقم</th>
                                <th className="border">اسم العتاد</th>
                                <th className="border">العدد</th>
                                <th className="border">سيئ</th>
                                <th className="border">مستعمل</th>
                                <th className="border">جديد</th>
                                <th className="border">ملاحظات</th>
                            </tr>
                        </thead>
                        <tbody className="border">
                            <tr className="border">
                                <td></td>
                            </tr>
                            {
                                material.map((m, i) => {
                                    return (
                                        <tr className="border" key={i}>
                                            <td className="border text-center font-semibold"> {i + 1} </td>
                                            <td className="border text-center font-semibold">{m.name}</td>
                                            <td className="border text-center">
                                                <input className="w-full text-center" type="number" value={m.quantity} onChange={e => updateMaterial(i, 'quantity', e.target.value)} />
                                            </td>
                                            <td className="border text-center">
                                                <input className="w-full text-center" type="number" value={m.quandition.bad} onChange={e => updateCondition(i, 'bad', e.target.value)} />
                                            </td>
                                            <td className="border text-center">
                                                <input className="w-full text-center" type="number" value={m.quandition.good} onChange={e => updateCondition(i, 'good', e.target.value)} />
                                            </td>
                                            <td className="border text-center">
                                                <input className="w-full text-center" type="number" value={m.quandition.new} onChange={e => updateCondition(i, 'new', e.target.value)} />
                                            </td>
                                            <td className="border text-center" >
                                                <input className="w-full text-center" type="text" value={m.note} onChange={e => updateMaterial(i, 'note', e.target.value)} />
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
                {/*footer */}
                <div className="my-6 font-semibold flex justify-between" >
                    <div>الاستاذ</div>
                    <div>المقتصد</div>
                    <div>المدير</div>
                </div>
            </div>
        </div>
    )
}

export default MaterialsCalc

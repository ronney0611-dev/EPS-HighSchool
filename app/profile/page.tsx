'use client'
import { useTeacher } from '@/hooks/useTeacher'
import { useClasses } from '@/hooks/useClasses'
import Image from 'next/image'
import Link from 'next/link'
import ManageClasses from '@/pages/ManageClasses'
import GradientText from '../../components/GradientText'
import { useState } from 'react'
import * as XLSX from 'xlsx'
import AllNotes from '@/components/AllNotes'

const getLevel = (name: string) => {
    if (name.startsWith('1')) return 'أولى ثانوي'
    if (name.startsWith('2')) return 'ثانية ثانوي'
    if (name.startsWith('3')) return 'ثالثة ثانوي'
    return ''
}

const ProfilePage = () => {
    const { teacher } = useTeacher()
    const { classes, setClasses } = useClasses()

    const totalStudents = classes.reduce((acc, c) => acc + c.students.length, 0)
    const totalMalade = classes.reduce((acc, c) => acc + c.students.filter(s => s.status === 'malade').length, 0)
    const totalSpecial = classes.reduce((acc, c) => acc + c.students.filter(s => s.status === 'special').length, 0)

    const [parsedSheets, setParsedSheets] = useState<{ name: string, students: { id: string, matricule: string, name: string, gender: 'male' | 'female', status: 'active' | 'malade' | 'special' }[] }[]>([])
    const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
    const [customNames, setCustomNames] = useState<{ [key: string]: string }>({});
    const [showModal, setShowModal] = useState(false)

    const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (evt) => {
            const data = new Uint8Array(evt.target?.result as ArrayBuffer)
            const workbook = XLSX.read(data, { type: 'array' })

            const sheets = workbook.SheetNames
                .filter(name => name !== 'Worksheet')
                .map(name => {
                    const sheet = workbook.Sheets[name]
                    const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 })
                    const headerRowIndex = rows.findIndex(row => row.includes('matricule'))
                    if (headerRowIndex === -1) return null

                    const dataRows = rows.slice(headerRowIndex + 2)
                    const students = dataRows
                        .filter(row => row[0] && row[1])
                        .map(row => ({
                            id: crypto.randomUUID(),
                            matricule: String(row[0]),
                            name: `${row[1]} ${row[2]}`.trim(),
                            gender: 'male' as const,
                            status: String(row[4]) === 'اعفاء' ? 'malade' as const : 'active' as const
                        }))

                    // find class info row
                    const infoRow = rows.find(row => row.join('').includes('الفوج التربوي'))
                    let className = name // fallback to sheet code

                    if (infoRow) {
                        const text = infoRow.join(' ')
                        const level = text.includes('أولى') ? '1' : text.includes('ثانية') ? '2' : text.includes('ثالثة') ? '3' : ''

                        // extract section: everything after the level keyword
                        const sectionMatch = text.match(/(?:أولى|ثانية|ثالثة)\s+ثانوي\s+(.+)/)
                        const section = sectionMatch ? sectionMatch[1].replace(/مادة\s*:.*/, '').trim() : '';

                        className = section ? `${level}${section}` : name
                    }

                    return { name: className, students }
                })
                .filter(Boolean) as { name: string, students: { id: string, matricule: string, name: string, gender: 'male' | 'female', status: 'active' | 'malade' | 'special' }[] }[];

            setParsedSheets(sheets)
            setSelectedSheets(sheets.map(s => s.name))
            setShowModal(true)
        }
        reader.readAsArrayBuffer(file)
    }

    const handleImportConfirm = () => {
        const toImport = parsedSheets.filter(s => selectedSheets.includes(s.name))
        const newClasses = toImport.map(sheet => ({
            name: customNames[sheet.name] || sheet.name,
            level: getLevel(customNames[sheet.name] || sheet.name),
            students: sheet.students
        }))

        // merge with existing — avoid duplicates by name
        const existingNames = classes.map(c => c.name)
        const filtered = newClasses.filter(c => !existingNames.includes(c.name))
        setClasses([...classes, ...filtered])
        setShowModal(false)
        setParsedSheets([])
        setSelectedSheets([])
    }

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
                <p className='text-gray-500'>{teacher.birthloc || ' الولاية'}</p>
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

            {/* Excel import button */}
            <div className='w-full max-w-2xl'>
                <label className='flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-xl cursor-pointer font-semibold w-full'>
                    📥 استيراد الأقسام من Excel
                    <input
                        type="file"
                        accept=".xlsx"
                        className="hidden"
                        onChange={handleExcelUpload}
                    />
                </label>
            </div>

            {/* classes summary */}
            <div className='w-full max-w-2xl flex flex-col gap-3'>
                <h2 className='text-xl font-bold text-center'>الأقسام</h2>
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
                <div className='flex justify-center text-center'>
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
                    <ManageClasses classes={classes} setClasses={setClasses} />
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

            {/* Modal */}
            {showModal && (
                <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'>
                    <div dir="rtl" className='bg-white text-black rounded-2xl p-6 w-full max-w-md flex flex-col gap-4 max-h-[80vh] overflow-y-auto'>
                        <h2 className='text-xl font-bold'>اختر الأقسام للاستيراد</h2>
                        <p className='text-sm text-gray-500'>تم العثور على {parsedSheets.length} قسم</p>

                        <div className='flex flex-col gap-2'>
                            {parsedSheets.map((sheet) => (
                                <label key={sheet.name} className='flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50'>
                                    <input
                                        type="checkbox"
                                        checked={selectedSheets.includes(sheet.name)}
                                        onChange={e => {
                                            if (e.target.checked) setSelectedSheets([...selectedSheets, sheet.name])
                                            else setSelectedSheets(selectedSheets.filter(s => s !== sheet.name))
                                        }}
                                        className='w-4 h-4'
                                    />
                                    <span className='font-medium'>{sheet.name}</span>
                                    <input
                                        type="text"
                                        placeholder="اسم مخصص (اختياري)"
                                        className='border rounded px-2 py-1 text-sm flex-1 text-right'
                                        onChange={e => setCustomNames({ ...customNames, [sheet.name]: e.target.value })}
                                    />
                                    <span className='text-gray-400 text-sm mr-auto'>{sheet.students.length} تلميذ</span>
                                </label>
                            ))}
                        </div>

                        <div className='flex gap-3'>
                            <button
                                onClick={handleImportConfirm}
                                className='bg-green-600 text-white px-6 py-2 rounded-xl flex-1 font-semibold cursor-pointer'>
                                استيراد
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className='bg-gray-300 text-black px-6 py-2 rounded-xl flex-1 cursor-pointer'>
                                إلغاء
                            </button>
                        </div>
                    </div>
                    
                </div>
            )}
            <div className='w-full max-w-2xl'>
                        <AllNotes />
                    </div>
        </div>
    )
}

export default ProfilePage
'use client'
import { useClasses } from '@/hooks/useClasses'
import { loadTahsili } from '@/hooks/useTahsili'
import { loadMostamir } from '@/hooks/useMostamir'
import * as XLSX from 'xlsx'

const AllNotes = () => {
    const { classes } = useClasses()

    const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('file selected:', e.target.files?.[0]?.name)
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()

        reader.onload = (evt) => {
            const data = new Uint8Array(evt.target?.result as ArrayBuffer)
            const workbook = XLSX.read(data, { type: 'array' })

            workbook.SheetNames.forEach(sheetName => {
                const sheet = workbook.Sheets[sheetName]
                const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 })

                console.log('processing sheet:', sheetName, 'rows:', rows.length)

                const headerRowIndex = rows.findIndex(row =>
                    row.includes('رقم التعريف') || row.includes('اللقب') || row.includes('matricule')
                )
                console.log('headerRowIndex:', headerRowIndex)
                if (headerRowIndex === -1) return

                // 2. match class by first student matricule
                const firstMatricule = String(rows[headerRowIndex + 2]?.[0] ?? '')
                console.log('firstMatricule:', firstMatricule)
                const appClass = classes.find(c =>
                    c.students.some(s => s.matricule === firstMatricule)
                )
                console.log('appClass:', appClass?.name)
                if (!appClass) return

                const tahsili = loadTahsili(appClass.name)
                const mostamir = loadMostamir(appClass.name)

                console.log('sheet:', sheetName, '→ class:', appClass.name)
                console.log('tahsili:', tahsili)
                console.log('mostamir:', mostamir)

                // 3. fill grades
                for (let i = headerRowIndex + 1; i < rows.length; i++) {
                    const matricule = String(rows[i][0] ?? '')
                    if (!matricule) continue

                    const student = appClass.students.find(s => s.matricule === matricule)
                    if (!student) continue

                    if (student.status === 'malade') {
                        rows[i][4] = 'اعفاء'
                        rows[i][6] = 'اعفاء'
                        continue
                    }

                    const studentIndex = appClass.students.indexOf(student)

                    const mostamirScore = mostamir?.[studentIndex]?.reduce((a: number, b: number) => a + b, 0) ?? ''
                    const tahsiliGrade = tahsili?.find((t: any) => t.name === student.name)?.final ?? ''

                    rows[i][4] = mostamirScore  // column E = مستمر
                    rows[i][6] = tahsiliGrade   // column G = تحصيلي
                }

                for (let i = headerRowIndex + 2; i < rows.length; i++) {
                    const matricule = String(rows[i][0] ?? '')
                    if (!matricule) continue

                    const student = appClass.students.find(s => s.matricule === matricule)
                    if (!student) continue

                    if (student.status === 'malade') {
                        sheet[XLSX.utils.encode_cell({ r: i, c: 4 })] = { v: 'اعفاء', t: 's' }
                        sheet[XLSX.utils.encode_cell({ r: i, c: 6 })] = { v: 'اعفاء', t: 's' }
                        continue
                    }

                    const studentIndex = appClass.students.indexOf(student)
                    const mostamirScore = mostamir?.[studentIndex]?.reduce((a: number, b: number) => a + b, 0) ?? ''
                    const tahsiliGrade = tahsili?.find((t: any) => t.name === student.name)?.final ?? ''

                    sheet[XLSX.utils.encode_cell({ r: i, c: 4 })] = { v: mostamirScore, t: 'n' }
                    sheet[XLSX.utils.encode_cell({ r: i, c: 6 })] = { v: tahsiliGrade, t: 'n' }
                }
            })
            console.log('sheets found:', workbook.SheetNames)
            console.log('classes in app:', classes.map(c => c.name))

            XLSX.writeFile(workbook, 'النقاط.xlsx')
        }
        reader.readAsArrayBuffer(file)
    }

    return (
        <div dir="rtl" className='flex flex-col gap-4 p-4 text-center'>
            <p className='text-xl font-bold'> ضع ملف
                Excel الخاص بك وسيتم ملؤه بالنقاط المحصل عليها تلقائيا من طرف التطبيق.
            </p>
            <label className='flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl cursor-pointer font-semibold w-full'>
                📤 رفع ملف Excel وتصدير النقاط
                <input
                    type="file"
                    accept=".xlsx"
                    className="hidden"
                    onChange={handleExcelUpload}
                />
            </label>
            <p className='text-sm text-red-900'>ملاحظة: يرجى التاكد من ملء جميع العلامات الخاصة بالتلاميذ في التطبيق قبل تصدير النقاط </p>
        </div>
    )
}

export default AllNotes
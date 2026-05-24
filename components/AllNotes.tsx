'use client'

import { useClasses } from '@/hooks/useClasses'
import * as XLSX from 'xlsx'
import axios from 'axios'
import type { Student } from '@/hooks/useClasses'
import { useState } from 'react'

const AllNotes = () => {
    const { classes } = useClasses();
    const [processing, setProcessing] = useState(false);

    const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setProcessing(true)

        const reader = new FileReader();

        reader.onload = async (evt) => {
            const data = new Uint8Array(evt.target?.result as ArrayBuffer)
            const workbook = XLSX.read(data, { type: 'array' })

            for (const sheetName of workbook.SheetNames) {
                const sheet = workbook.Sheets[sheetName]
                const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                const headerRowIndex = rows.findIndex(row =>
                    (row as unknown[]).includes('matricule')
                )
                if (headerRowIndex === -1) continue

                const firstStudentRow = headerRowIndex + 2
                const extraRows = headerRowIndex > 4 ? headerRowIndex - 4 : 0

                if (extraRows > 0) {
                    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1')
                    for (let r = 5; r <= range.e.r; r++) {
                        for (let c = range.s.c; c <= range.e.c; c++) {
                            const from = XLSX.utils.encode_cell({ r: r + extraRows, c })
                            const to = XLSX.utils.encode_cell({ r, c })
                            if (sheet[from]) sheet[to] = sheet[from]
                            else delete sheet[to]
                        }
                    }
                    range.e.r -= extraRows
                    sheet['!ref'] = XLSX.utils.encode_range(range)
                }

                const firstMatricule = String((rows[firstStudentRow] as unknown[])?.[0] ?? '')

                let appClass = null
                let appClassStudents: Student[] = []

                for (const c of classes) {
                    const res = await axios.get(`/api/classes/${c._id}/students`).catch(() => null)
                    const students = res?.data?.students || []
                    const match = students.find((s: { matricule?: string }) => s.matricule === firstMatricule)
                    if (match) {
                        appClass = c
                        appClassStudents = students
                        break
                    }
                }

                if (!appClass) continue

                const [sprintRes, jumpRes, throwRes, mostamirRes] = await Promise.all([
                    axios.get(`/api/tahsili/${appClass._id}`, { params: { activity: 'sprint' } }).catch(() => null),
                    axios.get(`/api/tahsili/${appClass._id}`, { params: { activity: 'longjump' } }).catch(() => null),
                    axios.get(`/api/tahsili/${appClass._id}`, { params: { activity: 'throw' } }).catch(() => null),
                    axios.get(`/api/mostamir/${appClass._id}`).catch(() => null),
                ])

                const tahsiliStudents: { name: string; final: number }[] =
                    (sprintRes?.data?.students?.length ?? 0) > 0 ? sprintRes!.data.students :
                    (jumpRes?.data?.students?.length ?? 0) > 0 ? jumpRes!.data.students :
                    throwRes?.data?.students ?? []

                const mostamirStudents = mostamirRes?.data?.students || []

                for (let i = firstStudentRow; i < rows.length; i++) {
                    const row = rows[i] as unknown[]
                    const matricule = String(row?.[0] ?? '')
                    if (!matricule) continue

                    const student = appClassStudents.find(s => s.matricule === matricule)
                    if (!student) continue

                    const sheetRow = i - extraRows

                    if (student.status === 'malade') {
                        sheet[XLSX.utils.encode_cell({ r: sheetRow, c: 4 })] = { v: 'اعفاء', t: 's' }
                        sheet[XLSX.utils.encode_cell({ r: sheetRow, c: 6 })] = { v: 'اعفاء', t: 's' }
                        continue
                    }

                    const studentIndex = appClassStudents.indexOf(student)
                    const mostamirScore = mostamirStudents[studentIndex]?.scores?.reduce((a: number, b: number) => a + b, 0) ?? ''
                    const tahsiliGrade = tahsiliStudents.find((t: { name: string; final: number }) => t.name === student.name)?.final ?? ''

                    sheet[XLSX.utils.encode_cell({ r: sheetRow, c: 4 })] = { v: mostamirScore, t: 'n' }
                    sheet[XLSX.utils.encode_cell({ r: sheetRow, c: 6 })] = { v: tahsiliGrade, t: 'n' }
                }
            }

            XLSX.writeFile(workbook, 'النقاط.xlsx')
            setProcessing(false)
        }

        reader.readAsArrayBuffer(file)
    }

    return (
        <div dir="rtl" className='flex flex-col gap-4 p-4 text-center'>
            <p className='text-xl font-bold'>
                ضع ملف Excel الخاص بك وسيتم ملؤه بالنقاط المحصل عليها تلقائيا من طرف التطبيق.
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
            {processing && (
                <div className='text-blue-700 font-bold text-lg animate-pulse'>
                    ⏳ جاري معالجة الملف...
                </div>
            )}
            <p className='text-sm text-red-900'>
                ملاحظة: يرجى التاكد من ملء جميع العلامات الخاصة بالتلاميذ في التطبيق قبل تصدير النقاط
            </p>
        </div>
    )
}

export default AllNotes
'use client'

import { useClasses } from '@/hooks/useClasses'
import ExcelJS from 'exceljs'
import axios from 'axios'
import type { Student } from '@/hooks/useClasses'
import type { Group } from '@/hooks/useGroupe'
import { useState } from 'react'

type TakwiniDoc = {
    students?: { studentId: string; bestFardi: number }[]
    groupNotes?: Record<string, number>
}

type ExcelRow = { rowNumber: number; matricule: string; nom: string; prenom: string }

type Report = {
    saved: number
    failedSaves: string[]
    skippedSheets: string[]
    notFound: string[]
}

// one block of the report (title + scrollable list of names)
const ReportSection = ({ title, items, tone }: { title: string; items: string[]; tone: 'red' | 'amber' }) => {
    const styles = tone === 'red'
        ? 'bg-red-50 border-red-200 text-red-800'
        : 'bg-amber-50 border-amber-200 text-amber-900'
    return (
        <div className={`rounded-xl border p-3 text-right ${styles}`}>
            <p className='font-bold mb-2'>{title} ({items.length})</p>
            <ul className='max-h-40 overflow-y-auto text-sm space-y-1'>
                {items.map((n, i) => <li key={i}>• {n}</li>)}
            </ul>
        </div>
    )
}

// makes "أحمد" / "احمد", "ة" / "ه", extra spaces, etc. compare equal
const normalize = (s: string) =>
    s.replace(/[\u064B-\u065F\u0670]/g, '')
        .replace(/[أإآ]/g, 'ا')
        .replace(/ى/g, 'ي')
        .replace(/ة/g, 'ه')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()

// 1) match by matricule  2) if no match, match by name (nom prenom OR prenom nom)
const findStudent = (students: Student[], matricule: string, nom: string, prenom: string) => {
    if (matricule) {
        const byMat = students.find(s => s.matricule === matricule)
        if (byMat) return { student: byMat, byName: false }
    }
    const a = normalize(`${nom} ${prenom}`)
    const b = normalize(`${prenom} ${nom}`)
    const byName = students.find(s => {
        const n = normalize(s.name ?? '')
        return n === a || n === b
    })
    return byName ? { student: byName, byName: true } : undefined
}

// same logic as getStudentGroupIndex in the takwini page
const getGroupIndex = (studentId: string, groupes: Group[]): number =>
    groupes.findIndex(g =>
        g.students.some(s => s.id === studentId || s._id?.toString() === studentId)
    )

// same logic as getJamaiNote + final in the takwini page
const takwiniFinal = (doc: TakwiniDoc | undefined, studentId: string, groupIndex: number): number => {
    if (!doc) return 0
    const bestFardi = doc.students?.find(s => s.studentId === studentId)?.bestFardi ?? 0
    let jamai = 0
    for (let gi = 0; gi < 6; gi++) {
        const key = groupIndex !== -1 ? `${groupIndex}-${gi}` : `nogroup-${studentId}-${gi}`
        const n = doc.groupNotes?.[key]
        if (n !== undefined && n > jamai) jamai = n
    }
    return bestFardi > 0 || jamai > 0 ? (bestFardi + jamai) / 2 : 0
}

const AllNotes = () => {
    const { classes } = useClasses();
    const [processing, setProcessing] = useState(false);
    const [report, setReport] = useState<Report | null>(null);

    const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setProcessing(true)

        const notFound: string[] = []          // Excel students not found in the app
        const skippedSheets: string[] = []     // sheets where no class was detected
        const failedSaves: string[] = []       // matricule could not be saved in the app
        let matriculesSaved = 0

        try {
            const arrayBuffer = await file.arrayBuffer()
            const workbook = new ExcelJS.Workbook()
            await workbook.xlsx.load(arrayBuffer)

            // load the students of every class ONCE (not once per sheet)
            const allClasses: { cls: (typeof classes)[number]; students: Student[] }[] = []
            for (const c of classes) {
                const res = await axios.get(`/api/classes/${c._id}/students`).catch(() => null)
                allClasses.push({ cls: c, students: res?.data?.students || [] })
            }

            for (const worksheet of workbook.worksheets) {
                // find the row that holds the English header ("matricule, nom, prenom, date_n, ...")
                let headerRowNumber = -1
                worksheet.eachRow((row, rowNumber) => {
                    if (headerRowNumber !== -1) return
                    const values = row.values as unknown[]
                    if (values.some(v => v === 'matricule')) headerRowNumber = rowNumber
                })
                if (headerRowNumber === -1) continue

                const firstStudentRow = headerRowNumber + 2

                // read all student rows of the sheet
                const rows: ExcelRow[] = []
                for (let r = firstStudentRow; r <= worksheet.rowCount; r++) {
                    const matricule = String(worksheet.getCell(r, 1).value ?? '').trim()
                    const nom = String(worksheet.getCell(r, 2).value ?? '').trim()
                    const prenom = String(worksheet.getCell(r, 3).value ?? '').trim()
                    if (!matricule && !nom) continue
                    rows.push({ rowNumber: r, matricule, nom, prenom })
                }
                if (rows.length === 0) continue

                // detect the app class: the one that matches the most Excel rows
                // (by matricule or by name). At least half must match.
                let best: (typeof allClasses)[number] | null = null
                let bestScore = 0
                for (const entry of allClasses) {
                    const score = rows.filter(r => findStudent(entry.students, r.matricule, r.nom, r.prenom)).length
                    if (score > bestScore) { best = entry; bestScore = score }
                }
                if (!best || bestScore < Math.ceil(Math.min(rows.length, best.students.length) * 0.5)) {
                    skippedSheets.push(worksheet.name)
                    continue
                }

                const appClass = best.cls
                const appClassStudents = best.students

                const [
                    sprintRes, jumpRes, throwRes, mostamirRes,
                    tkSprintRes, tkJumpRes, tkThrowRes, groupeRes,
                ] = await Promise.all([
                    axios.get(`/api/tahsili/${appClass._id}`, { params: { activity: 'sprint' } }).catch(() => null),
                    axios.get(`/api/tahsili/${appClass._id}`, { params: { activity: 'longjump' } }).catch(() => null),
                    axios.get(`/api/tahsili/${appClass._id}`, { params: { activity: 'throw' } }).catch(() => null),
                    axios.get(`/api/mostamir/${appClass._id}`).catch(() => null),
                    axios.get(`/api/takwini/${appClass._id}`, { params: { activity: 'sprint' } }).catch(() => null),
                    axios.get(`/api/takwini/${appClass._id}`, { params: { activity: 'longjump' } }).catch(() => null),
                    axios.get(`/api/takwini/${appClass._id}`, { params: { activity: 'throw' } }).catch(() => null),
                    axios.get(`/api/groupe/${appClass._id}`).catch(() => null),
                ])

                const tahsiliStudents: { name: string; final: number }[] =
                    (sprintRes?.data?.students?.length ?? 0) > 0 ? sprintRes!.data.students :
                        (jumpRes?.data?.students?.length ?? 0) > 0 ? jumpRes!.data.students :
                            throwRes?.data?.students ?? []

                const mostamirStudents = mostamirRes?.data?.students || []

                // same rule as tahsili: use the first activity that has data
                const takwiniDoc: TakwiniDoc | undefined = [tkSprintRes, tkJumpRes, tkThrowRes]
                    .map(r => r?.data?.data as TakwiniDoc | undefined)
                    .find(d => (d?.students?.length ?? 0) > 0)

                const groupes: Group[] = groupeRes?.data?.groupe?.groupe || []

                // matricules already used in this class (never give the same one twice)
                const usedMatricules = new Set(appClassStudents.map(s => s.matricule).filter(Boolean))
                const matriculeUpdates: { studentId: string; name: string; matricule: string }[] = []

                for (const row of rows) {
                    const { rowNumber, matricule, nom, prenom } = row
                    const excelName = `${nom} ${prenom}`.trim()

                    const found = findStudent(appClassStudents, matricule, nom, prenom)
                    if (!found) {
                        notFound.push(excelName)
                        continue
                    }
                    const student = found.student

                    // matched by name and the student has no matricule yet -> remember it
                    if (found.byName && matricule && !student.matricule && !usedMatricules.has(matricule)) {
                        student.matricule = matricule
                        usedMatricules.add(matricule)
                        matriculeUpdates.push({ studentId: student._id, name: student.name, matricule })
                    }

                    if (student.status === 'malade') {
                        worksheet.getCell(rowNumber, 5).value = 'اعفاء'
                        worksheet.getCell(rowNumber, 6).value = 'اعفاء'
                        worksheet.getCell(rowNumber, 7).value = 'اعفاء'
                        continue
                    }

                    const studentIndex = appClassStudents.indexOf(student)
                    const mostamirScore = mostamirStudents[studentIndex]?.scores?.reduce((a: number, b: number) => a + b, 0) ?? ''
                    const tahsiliGrade = tahsiliStudents.find((t: { name: string; final: number }) => t.name === student.name)?.final ?? ''

                    const gIndex = getGroupIndex(student._id, groupes)
                    const tk = takwiniFinal(takwiniDoc, student._id, gIndex)
                    const takwiniGrade = tk > 0 ? Math.round(tk * 100) / 100 : ''

                    worksheet.getCell(rowNumber, 5).value = mostamirScore
                    worksheet.getCell(rowNumber, 6).value = takwiniGrade
                    worksheet.getCell(rowNumber, 7).value = tahsiliGrade
                }

                // save the new matricules in the app
                // ⚠️ the URL below is a GUESS: replace it with your real "update student" route
                await Promise.all(
                    matriculeUpdates.map(u =>
                        axios
                            .patch(`/api/classes/${appClass._id}/students/${u.studentId}`, { matricule: u.matricule })
                            .then(() => { matriculesSaved++ })
                            .catch(() => { failedSaves.push(u.name) })
                    )
                )
            }

            const buffer = await workbook.xlsx.writeBuffer()
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'النقاط.xlsx'
            a.click()
            URL.revokeObjectURL(url)

            // always show the result (success or problems)
            setReport({ saved: matriculesSaved, failedSaves, skippedSheets, notFound })
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div dir="rtl" className='flex flex-col gap-4 p-4 text-center'>
            <p className='text-xl font-bold'>
                ضع ملف Excel الخاص بك وسيتم ملؤه بالنقاط المحصل عليها تلقائيا من طرف التطبيق.
            </p>
            <div className="bg-red-500/10 border border-red-500/20 text-red-400  rounded-xl p-3 text-center font-semibold mb-4">
                ⚠️  قريبا...
            </div>
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

            {report && (() => {
                const hasProblems =
                    report.notFound.length + report.skippedSheets.length + report.failedSaves.length > 0
                return (
                    <div
                        className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 mt-20'
                        onClick={() => setReport(null)}
                    >
                        <div
                            dir="rtl"
                            className='bg-white text-black rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto p-5 flex flex-col gap-4'
                            onClick={e => e.stopPropagation()}
                        >
                            <div className='text-center'>
                                <div className='text-4xl'>{hasProblems ? '⚠️' : '✅'}</div>
                                <h2 className='text-xl font-bold mt-1'>
                                    {hasProblems ? 'تم التصدير مع بعض الملاحظات' : 'تم تصدير النقاط بنجاح'}
                                </h2>
                            </div>

                            {report.saved > 0 && (
                                <div className='rounded-xl border border-green-200 bg-green-50 text-green-800 p-3 text-center font-semibold'>
                                    تمت إضافة الرقم التعريفي لـ {report.saved} تلميذ في التطبيق
                                </div>
                            )}

                            {report.notFound.length > 0 && (
                                <ReportSection tone='amber' title='تلاميذ غير موجودين في التطبيق' items={report.notFound} />
                            )}
                            {report.skippedSheets.length > 0 && (
                                <ReportSection tone='amber' title='أوراق لم يتم التعرف على قسمها' items={report.skippedSheets} />
                            )}
                            {report.failedSaves.length > 0 && (
                                <ReportSection tone='red' title='تعذر حفظ الرقم التعريفي' items={report.failedSaves} />
                            )}

                            <button
                                onClick={() => setReport(null)}
                                className='bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-xl font-semibold cursor-pointer'
                            >
                                حسنا
                            </button>
                        </div>
                    </div>
                )
            })()}
        </div>
    )
}

export default AllNotes
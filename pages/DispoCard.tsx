'use client'

import { useClasses } from "@/hooks/useClasses";
import { useTeacher } from "@/hooks/useTeacher";
import { useEffect, useState } from "react";

const DispoCard = () => {
    const { classes, fetchStudents, studentsByClass } = useClasses();
    const { teacher } = useTeacher();
    const [classOverrides, setClassOverrides] = useState<Record<string, string>>({});

    useEffect(() => {
        classes.forEach(c => fetchStudents(c._id));
    }, [classes]);

    const studentClass = classes.flatMap(c =>
        (studentsByClass[c._id] || [])
            .filter(s => s.status === 'malade')
            .map(s => ({ ...s, className: c.name }))
    );

    const handlePrint = () => {
        window.print();
    };

    return (
        <div dir="rtl" className="min-h-screen  bg-gray-100 p-4 font-sans text-gray-900 antialiased">

            {/* Action Bar / Print Button (Hidden during print) */}
            <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden ">
                <h1 className="text-xl font-bold text-gray-800">معاينة قائمة الإعفاءات</h1>
                <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2.5 rounded-lg shadow transition-colors duration-150 cursor-pointer"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    طباعة الوثيقة
                </button>
            </div>

            {/* Printable Document Container */}
            <div className="max-w-4xl  mx-auto bg-white p-8 md:p-12 shadow-lg rounded-sm border border-black print:shadow-none print:border-none print:p-0 print:m-0 print:w-full print:max-w-none">

                {/* Official Header */}
                <header className="text-center border-b-2 border-gray-800 pb-4 mb-6">
                    <h2 className="text-base font-bold tracking-wide">الجمهورية الجزائرية الديمقراطية الشعبية</h2>
                    <h3 className="text-sm font-semibold text-gray-700 mt-1">وزارة التربية الوطنية</h3>

                    <div className="grid grid-cols-2 text-sm font-semibold mt-6 text-right">
                        <div>
                            <p><span className="text-gray-600">المؤسسة:</span> {teacher.school} </p>
                            <p className="mt-1"><span className="text-gray-600">الأستاذ(ة):</span> {teacher.name} </p>
                        </div>
                        <div className="text-left">
                            <p><span className="text-gray-600">السنة الدراسية:</span> 2026 / 2027</p>
                            <p className="mt-1"><span className="text-gray-600">المادة:</span> التربية البدنية والرياضية</p>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h1 className="text-2xl font-black underline decoration-2 underline-offset-8 text-gray-900 uppercase">
                            قائمة التلاميذ المعفيين من التربية البدنية
                        </h1>
                    </div>
                </header>

                {/* Main Content Table */}
                <main className="my-6">
                    <table className="w-full text-right border-collapse border border-gray-800 text-sm">
                        <thead>
                            <tr className="bg-gray-100 text-gray-900 font-bold border-b border-gray-800">
                                <th className="border border-gray-800 p-2.5 text-center w-16">الرقم</th>
                                <th className="border border-gray-800 p-2.5">الإسم واللقب</th>
                                <th className="border border-gray-800 p-2.5 text-center w-48">القسم </th>
                                <th className="border border-gray-800 p-2.5 text-center w-40">ملاحظات </th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentClass.length > 0 ? (
                                studentClass.map((student, index) => (
                                    <tr key={student._id} className="border-b border-gray-300 print:border-gray-800">
                                        <td className="border border-gray-800 p-0.5 text-center font-medium">{index + 1}</td>
                                        <td className="border border-gray-800 p-0.5 font-semibold">{student.name}</td>
                                        <td className="border border-gray-800 p-0.5 text-center">
                                            <textarea
                                                className="resize-none border-none text-center bg-transparent w-full"
                                                rows={1}
                                                value={classOverrides[student._id] ?? student.className}
                                                onChange={e => setClassOverrides(prev => ({ ...prev, [student._id]: e.target.value }))}
                                            />
                                        </td>
                                        <td className="border border-gray-800 p-0.5 text-center">
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="border border-gray-800 p-4 text-center text-gray-500">
                                        لا يوجد تلاميذ معفيين مسجلين حالياً.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </main>

                {/* Footer Signatures */}
                <footer className="mt-12 pt-4">
                    <div className="grid grid-cols-3 text-center text-sm font-bold gap-4">
                        <div>
                            <p className="underline mb-12"> أستاذ المادة</p>
                            
                        </div>
                        <div>
                            <p className="underline mb-12">الطبيب</p>
                            
                        </div>
                        <div>
                            <p className="underline mb-12">مدير المؤسسة</p>
                            
                        </div>
                    </div>
                </footer>

            </div>

            {/* Global CSS for Single-Page Printing */}
            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 12mm;
                    }
                    body {
                        background: white !important;
                        color: black !important;
                        -webkit-print-color-adjust: exact;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    * {
                        background: white !important;
                    }
                    }
            `}</style>

        </div>
    );
}

export default DispoCard;
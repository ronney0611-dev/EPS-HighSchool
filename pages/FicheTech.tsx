"use client";

import { useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTeacher } from "@/hooks/useTeacher";
import { useClasses } from "@/hooks/useClasses";

const SPORT_NAMES: Record<string, string> = {
    sprint: "سباق السرعة",
    long_jump: "الوثب الطويل",
    shot_put: "دفع الجلة",
    basketball: "كرة السلة",
    handball: "كرة اليد",
    volleyball: "الكرة الطائرة",
};

const LEVEL_NAMES: Record<string, string> = {
    "1": "السنة الأولى ثانوي",
    "2": "السنة الثانية ثانوي",
    "3": "السنة الثالثة ثانوي",
};

const GOAL_PREFIX = "أن يكون التلميذ قادرا على";

// مكون فرعي لمعالجة متغيرات الطباعة بشكل آمن داخل Suspense
function PrintContent() {
    const rawParams = useSearchParams();
    const { teacher } = useTeacher();
    const { classes } = useClasses();

    const level = rawParams?.get("level") ?? "";
    const sport = rawParams?.get("sport") ?? "";
    const trimester = rawParams?.get("trimester") ?? "";
    const sessionNumber = rawParams?.get("session") ?? "";
    const indicatorText = rawParams?.get("indicatorText") ?? "";
    const rawGoal = rawParams?.get("goal") ?? "";

    const goal = rawGoal.startsWith(GOAL_PREFIX)
        ? rawGoal.slice(GOAL_PREFIX.length).trim()
        : rawGoal;

    const sportName = SPORT_NAMES[sport] ?? sport;
    const levelName = LEVEL_NAMES[level] ?? `المستوى ${level}`;

    const levelClasses = useMemo(
        () => classes?.filter((c) => String(c.level) === String(level)) ?? [],
        [classes, level]
    );

    useEffect(() => {
        const timer = setTimeout(() => window.print(), 800);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            {/* أزرار التحكم في الشاشة (تختفي تلقائياً عند الطباعة) */}
            <div className="print-hidden controls-ribbon">
                <button onClick={() => window.print()} className="btn btn-primary">
                    🖨️ تأكيد الطباعة الرسمية
                </button>
                <button onClick={() => window.close()} className="btn btn-secondary">
                    ✕ إلغاء وإغلاق
                </button>
            </div>

            {/* ════════════════════════════════════════
                 الصفحة الأولى — بطاقة الوحدة التعليمية
               ════════════════════════════════════════ */}
            <div className="print-page page-break">
                {/* رأس الوثيقة التربوية */}
                <div className="document-ministry-header">
                    <p className="republic-title">الجمهورية الجزائرية الديمقراطية الشعبية</p>
                    <p>وزارة التربية الوطنية</p>
                    <div className="header-separator"></div>
                </div>

                <div className="page-title">بطاقة الوحدة التعليمية المنهجية</div>

                {/* شبكة معلومات الأستاذ والمستوى الجغرافية */}
                <div className="info-grid">
                    <div className="info-cell">
                        <span className="info-label">الأستاذ(ة):</span>
                        <span className="info-value">{teacher?.name ?? "............................"}</span>
                    </div>
                    <div className="info-cell">
                        <span className="info-label">المؤسسة:</span>
                        <span className="info-value">{teacher?.school ?? "............................"}</span>
                    </div>
                    <div className="info-cell">
                        <span className="info-label">المستوى الدراسي:</span>
                        <span className="info-value">{levelName}</span>
                    </div>
                    <div className="info-cell">
                        <span className="info-label">النشاط الرياضي:</span>
                        <span className="info-value">{sportName}</span>
                    </div>
                    <div className="info-cell">
                        <span className="info-label">رقم الحصة التعليمية:</span>
                        <span className="info-value">{sessionNumber}</span>
                    </div>
                    <div className="info-cell span-all">
                        <span className="info-label">الهدف الإجرائي :</span>
                        <span className="info-value goal-text text-gray-200">
                            ...................................................................................................
                        </span>
                    </div>
                </div>

                {/* جدول تخطيط مراحل الحصة البدنية الافتراضي */}
                <table className="lesson-table">
                    <thead>
                        <tr>
                            <th style={{ width: "8%" }}>المراحل</th>
                            <th style={{ width: "22%" }}>الأهداف الإجرائية </th>
                            <th style={{ width: "35%" }}>وضعيات التعلم  </th>
                            <th style={{ width: "8%" }}>المدة</th>
                            <th style={{ width: "12%" }}>  ظروف الإنجاز</th>
                            <th style={{ width: "15%" }}>معايير النجاح </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="stage-row warm-up-phase">
                            <td className="stage-label">المرحلة التحضيرية</td>
                            <td className="blank-cell" />
                            <td className="blank-cell" />
                            <td className="blank-cell font-mono"></td>
                            <td className="blank-cell" />
                            <td className="blank-cell" />
                        </tr>
                        <tr className="stage-row main-phase">
                            <td className="stage-label">الـمـرحـلـة<br />الـرئـيـسـيـة</td>
                            <td className="blank-cell" />
                            <td className="blank-cell" />
                            <td className="blank-cell font-mono"></td>
                            <td className="blank-cell" />
                            <td className="blank-cell" />
                        </tr>
                        <tr className="stage-row cool-down-phase">
                            <td className="stage-label">الـخـتـامـيـة </td>
                            <td className="blank-cell" />
                            <td className="blank-cell" />
                            <td className="blank-cell font-mono"></td>
                            <td className="blank-cell" />
                            <td className="blank-cell" />
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* ════════════════════════════════════════
                 الصفحة الثانية — الدفتر اليومي للأستاذ
               ════════════════════════════════════════ */}
            <div className="print-page">
                <div className="document-ministry-header">
                    <p className="republic-title">الجمهورية الجزائرية الديمقراطية الشعبية</p>
                    <p>وزارة التربية الوطنية</p>
                    <div className="header-separator"></div>
                </div>

                <div className="page-title">الدفتر اليومي لنشاطات التربية البدنية والرياضية</div>

                <div className="info-grid text-sm" style={{ marginBottom: "15px" }}>
                    <div className="info-cell">
                        <span className="info-label">الأستاذ(ة):</span>
                        <span className="info-value">{teacher?.name ?? "............................"}</span>
                    </div>
                    <div className="info-cell">
                        <span className="info-label">المؤسسة التعليمية:</span>
                        <span className="info-value">{teacher?.school ?? "............................"}</span>
                    </div>
                    <div className="info-cell">
                        <span className="info-label">تاريخ اليوم الدراسي:</span>
                        <span className="info-value font-mono">      /      /   2026 م</span>
                    </div>
                </div>

                <table className="daftar-table">
                    <thead>
                        <tr>
                            <th style={{ width: "15%" }}> القسم</th>
                            <th style={{ width: "25%" }}>النشاط </th>
                            <th style={{ width: "15%" }}>رقم الحصة التعليمية</th>
                            <th style={{ width: "25%" }}>  الإنجاز الميداني</th>
                            <th style={{ width: "20%" }}>التوجيهات والمقترحات والبدائل</th>
                        </tr>
                    </thead>
                    <tbody>
                        {levelClasses.length > 0 ? (
                            levelClasses.map((cls) => (
                                <tr key={cls.name}>
                                    <td className="font-bold">{cls.name}</td>
                                    <td>{sportName}</td>
                                    <td className="font-mono">{sessionNumber}</td>
                                    <td className="blank-cell" />
                                    <td className="blank-cell" />
                                </tr>
                            ))
                        ) : (
                            Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i}>
                                    <td className="blank-cell" />
                                    <td>{sportName}</td>
                                    <td className="font-mono">{sessionNumber}</td>
                                    <td className="blank-cell" />
                                    <td className="blank-cell" />
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* لوحة مصادقة التوقيعات أسفل المستند الإداري */}
                <div className="signature-row">
                    <div className="sig-box">
                        <div className="sig-title">إمضاء أستاذ المادة</div>
                        <div className="sig-space"></div>
                    </div>
                    <div className="sig-box">
                        <div className="sig-title">توقيع وختم الإدارة</div>
                        <div className="sig-space"></div>
                    </div>
                    <div className="sig-box">
                        <div className="sig-title">تأشيرة السيد(ة) المفتش(ة)</div>
                        <div className="sig-space"></div>
                    </div>
                </div>
            </div>
        </>
    );
}

// المكون الرئيسي المغلف بـ Suspense لحماية خط أنابيب الـ Next Client Render
export default function WahdaPrintPage() {
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');

                * { box-sizing: border-box; margin: 0; padding: 0; }

                body {
                    font-family: 'Cairo', sans-serif;
                    direction: rtl;
                    background: #f1f5f9;
                    color: #0f172a;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }

                /* حاوية الورقة المعيارية المطبوعة */
                .print-page {
                    width: 210mm;
                    height: 296mm;
                    margin: 0 auto;
                    padding: 15mm 12mm;
                    background: white;
                    position: relative;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                }

                .page-break {
                    page-break-after: always;
                    break-after: page;
                }

                /* الترويسة الوزارية العلوية */
                .document-ministry-header {
                    text-align: center;
                    font-size: 11px;
                    font-weight: 700;
                    line-height: 1.6;
                    margin-bottom: 10px;
                    color: #334155;
                }
                .republic-title {
                    font-size: 12px;
                    font-weight: 800;
                    letter-spacing: 0.3px;
                }
                .header-separator {
                    width: 60px;
                    height: 1px;
                    background: #64748b;
                    margin: 4px auto 0 auto;
                }

                .page-title {
                    text-align: center;
                    font-size: 16px;
                    font-weight: 800;
                    margin: 10px 0 15px 0;
                    padding: 6px;
                    background: #f8fafc;
                    border: 2px solid #0f172a;
                    border-radius: 6px;
                    color: #0f172a;
                }

                /* جدول البيانات الفوقي الهيدر */
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 8px;
                    margin-bottom: 15px;
                    border: 2px solid #0f172a;
                    padding: 10px;
                    background: #fff;
                    border-radius: 4px;
                }
                .info-cell {
                    display: flex;
                    align-items: center;
                    font-size: 12px;
                    gap: 4px;
                }
                .span-all {
                    grid-column: 1 / -1;
                }
                .info-label {
                    font-weight: 800;
                    color: #1e293b;
                    white-space: nowrap;
                }
                .info-value {
                    border-bottom: 1px dotted #94a3b8;
                    flex: 1;
                    padding-bottom: 2px;
                    color: #334155;
                    font-weight: 600;
                }
                .goal-text {
                    color: #1e3a8a;
                    font-weight: 700;
                }

                /* الجداول المخصصة للملف التربوي */
                .lesson-table, .daftar-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 12px;
                }
                .lesson-table th, .daftar-table th {
                    background: #0f172a !important;
                    color: white !important;
                    font-weight: 700;
                    font-size: 11px;
                    border: 1px solid #0f172a;
                    padding: 6px 4px;
                }
                .lesson-table td, .daftar-table td {
                    border: 1px solid #0f172a;
                    padding: 6px;
                    text-align: center;
                    vertical-align: middle;
                    font-size: 11px;
                    color: #1e293b;
                }
                .stage-label {
                    font-weight: 800;
                    background: #f8fafc !important;
                    color: #0f172a;
                    font-size: 11px;
                    line-height: 1.4;
                }

                /* الارتفاعات الدقيقة لتناسب مساحة الـ A4 ورقة كاملة */
                .warm-up-phase .blank-cell { height: 180px; }
                .main-phase .blank-cell { height: 380px; }
                .cool-down-phase .blank-cell { height: 110px; }
                
                .daftar-table td.blank-cell { height: 75px; }

                /* الملاحظات السفلية التقييمية */
                .notes-container {
                    border: 1px dashed #0f172a;
                    padding: 8px;
                    background: #fff;
                    margin-top: 10px;
                    border-radius: 4px;
                }
                .notes-label {
                    font-weight: 800;
                    font-size: 11px;
                    display: block;
                    margin-bottom: 6px;
                }
                .notes-lines {
                    height: 35px;
                    border-bottom: 1px dotted #cbd5e1;
                }

                /* التواقيع أسفل الورقة */
                .signature-row {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 30px;
                    position: absolute;
                    bottom: 20mm;
                    left: 12mm;
                    right: 12mm;
                }
                .sig-box {
                    text-align: center;
                    width: 28%;
                }
                .sig-title {
                    font-weight: 800;
                    font-size: 12px;
                    border-bottom: 2px double #0f172a;
                    padding-bottom: 4px;
                    color: #0f172a;
                }
                .sig-space {
                    height: 65px;
                }

                /* شريط لوحة التحكم في العرض على المتصفح */
                .controls-ribbon {
                    position: sticky;
                    top: 0;
                    z-index: 999;
                    background: #0f172a;
                    padding: 12px;
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .btn {
                    padding: 8px 24px;
                    font-family: 'Cairo', sans-serif;
                    font-size: 13px;
                    font-weight: 700;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-primary { background: #2563eb; color: white; }
                .btn-primary:hover { background: #1d4ed8; }
                .btn-secondary { background: #475569; color: white; }
                .btn-secondary:hover { background: #334155; }

                /* تهيئة كود الطباعة وإخفاء العناصر غير المرغوبة */
                @media print {
                    .print-hidden { display: none !important; }
                    body { background: white; padding: 0; }
                    .print-page { 
                        box-shadow: none !important; 
                        margin: 0 !important; 
                        padding: 0 !important;
                        width: 210mm;
                        height: 296mm;
                    }
                }
            `}</style>

            <Suspense fallback={<div style={{ textAlign: "center", padding: "40px", fontFamily: "sans-serif" }}>جاري تحميل ملف الطباعة التربوي...</div>}>
                <PrintContent />
            </Suspense>
        </>
    );
}
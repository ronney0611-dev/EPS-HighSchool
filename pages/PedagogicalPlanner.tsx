import React, { useState } from 'react';
import rawCurriculumData from './curriculumData.json';

// --- TS Type Definitions ---
interface Indicator {
  id: number;
  text: string;
  goal_base: string;
}

interface ActivityGroup {
  activity: string;
  indicators: Indicator[];
}

interface TrimesterData {
  kafaa_kaadia: string;
  jamai: ActivityGroup;
  fardi: ActivityGroup;
}

interface LevelData {
  kafaa_khatamia: string;
  T1: TrimesterData;
  [key: string]: any; // Allows extensibility for T2/T3
}

interface CurriculumStructure {
  [level: string]: LevelData;
}

// Cast import into our type-safe schema interface
const curriculumData = rawCurriculumData as CurriculumStructure;

interface SchoolClass {
  id: string;
  name: string;
  level: "1" | "2" | "3";
}

interface PlanRow {
  mochirText: string;
  averagePercentage: string;
  allocatedSessions: number;
  operationalGoalPhrase: string;
}

interface GeneratedPlanPayload {
  schoolYear: string;
  levelName: string;
  sportActivity: string;
  kafaaKhatamia: string;
  kafaaKaadia: string;
  rows: PlanRow[];
}

// --- Mock Datasets ---
const SCHOOL_CLASSES: SchoolClass[] = [
  { id: "c1", name: "1 ج م ع ت 1", level: "1" },
  { id: "c2", name: "1 ج م أدب 2", level: "1" },
  { id: "c3", name: "2 ع ت 1", level: "2" },
  { id: "c4", name: "2 ج م لغات", level: "2" },
  { id: "c5", name: "3 ع ت 1", level: "3" },
  { id: "c6", name: "3 تقني رياضي", level: "3" }
];

export default function PedagogicalPlanner(): JSX.Element {
  // TS Enforced Component Local States
  const [currentClassId, setCurrentClassId] = useState<string>("");
  const [level, setLevel] = useState<"1" | "2" | "3" | "">("");
  const [trimester, setTrimester] = useState<string>("T1");
  const [sportType, setSportType] = useState<"fardi" | "jamai">("fardi");
  const [mochirMaxCount, setMochirMaxCount] = useState<number>(4);
  const [checkedMochirs, setCheckedMochirs] = useState<Indicator[]>([]);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlanPayload | null>(null);

  // Cross-Class Calculated Data Matrix Simulation
  const [classScores] = useState<Record<string, number[]>>({
    "c1": [15, 45, 60, 85], "c2": [20, 35, 55, 90],
    "c3": [72, 12, 40, 95], "c4": [64, 24, 48, 80],
    "c5": [10, 38, 62, 88], "c6": [18, 42, 58, 82]
  });

  // Automatically extract level based on chosen class string
  const handleClassSelection = (classId: string): void => {
    setCurrentClassId(classId);
    const selectedClass = SCHOOL_CLASSES.find(c => c.id === classId);
    if (selectedClass) {
      setLevel(selectedClass.level);
      setCheckedMochirs([]); // Wipe array clean on change
      setGeneratedPlan(null);
    } else {
      setLevel("");
    }
  };

  // Safe list manipulation with item limits checks
  const handleMochirCheckbox = (mochirObj: Indicator): void => {
    const isAlreadyChecked = checkedMochirs.some(item => item.id === mochirObj.id);

    if (isAlreadyChecked) {
      setCheckedMochirs(checkedMochirs.filter(item => item.id !== mochirObj.id));
    } else {
      if (checkedMochirs.length < mochirMaxCount) {
        setCheckedMochirs([...checkedMochirs, mochirObj]);
      } else {
        alert(`يمكنك اختيار ${mochirMaxCount} مؤشرات فقط كحد أقصى حسب إعداداتك!`);
      }
    }
  };

  // Core Math Calculation Strategy Engine
  const executeCoreGeneration = (): void => {
    if (!level || !currentClassId || checkedMochirs.length === 0) {
      alert("الرجاء إكمال كافة الاختيارات وتحديد المؤشرات أولاً!");
      return;
    }

    // 1. Isolate sister classes sharing the same level
    const siblingClasses = SCHOOL_CLASSES.filter(c => c.level === level);

    // 2. Compute cross-class averages safely
    let summedPercentages = Array(mochirMaxCount).fill(0);
    let populatedClassesCount = 0;

    siblingClasses.forEach(cls => {
      if (classScores[cls.id]) {
        populatedClassesCount++;
        for (let i = 0; i < mochirMaxCount; i++) {
          summedPercentages[i] += classScores[cls.id][i];
        }
      }
    });

    const globalAverages = summedPercentages.map(total => total / (populatedClassesCount || 1));

    // 3. Map values using your 4-Tier Scale logic
    const fullFinalGridReport: PlanRow[] = checkedMochirs.map((mochir, idx) => {
      const currentAvgScore = globalAverages[idx] || 0;
      let sessionsWeight = 0.5;
      let actionVerb = "أن يتقن";

      if (currentAvgScore <= 25) {
        sessionsWeight = 3;
        actionVerb = "أن يتمكن";
      } else if (currentAvgScore <= 50) {
        sessionsWeight = 2;
        actionVerb = "أن يتمكن";
      } else if (currentAvgScore <= 75) {
        sessionsWeight = 1;
        actionVerb = "أن يتقن";
      } else {
        sessionsWeight = 0.5;
        actionVerb = "أن يتقن";
      }

      // Exact phrase blueprint assignment
      const formattedOperationalGoal = `${actionVerb} التلميذ ${mochir.goal_base}`;

      return {
        mochirText: mochir.text,
        averagePercentage: currentAvgScore.toFixed(1),
        allocatedSessions: sessionsWeight,
        operationalGoalPhrase: formattedOperationalGoal
      };
    });

    // 4. Mount strongly typed output object state
    const metadataSource = curriculumData[level][trimester][sportType];
    
    setGeneratedPlan({
      schoolYear: "2025 / 2026",
      levelName: level === "1" ? "السنة الأولى ثانوي" : level === "2" ? "السنة الثانية ثانوي" : "السنة الثالثة ثانوي",
      sportActivity: metadataSource.activity,
      kafaaKhatamia: curriculumData[level].kafaa_khatamia,
      kafaaKaadia: curriculumData[level][trimester].kafaa_kaadia,
      rows: fullFinalGridReport
    });
  };

  // Safely grab live options array from typed database
  const activeCurriculumPool: Indicator[] = (level && curriculumData[level] && curriculumData[level][trimester])
    ? curriculumData[level][trimester][sportType].indicators
    : [];

  return (
    <div style={{ padding: '30px', direction: 'rtl', fontFamily: 'Courier New, sans-serif', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      
      {/* Control Setup Module Box Container */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '25px' }}>
        <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>⚙️ إعدادات البطاقة التربوية للوحدة التعلمية (TS V1)</h2>
        
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '15px' }}>
          <div>
            <label style={{ fontWeight: 'bold', display: 'block' }}>1. اختر الفوج التربوي (الصف):</label>
            <select value={currentClassId} onChange={(e) => handleClassSelection(e.target.value)} style={{ padding: '8px', width: '180px', marginTop: '5px' }}>
              <option value="">-- اختر القسم --</option>
              {SCHOOL_CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {level && (
            <div style={{ backgroundColor: '#eef7ff', padding: '5px 15px', borderRadius: '5px', height: 'fit-content', alignSelf: 'flex-end' }}>
              <strong>المستوى المرصود تلقائياً:</strong> السنة {level} ثانوي
            </div>
          )}

          <div>
            <label style={{ fontWeight: 'bold', display: 'block' }}>2. اختر النشاط الرياضي:</label>
            <select value={sportType} onChange={(e) => { setSportType(e.target.value as "fardi" | "jamai"); setCheckedMochirs([]); setGeneratedPlan(null); }} style={{ padding: '8px', width: '180px', marginTop: '5px' }}>
              <option value="fardi">نشاط فردي (سباقات / وثب)</option>
              <option value="jamai">نشاط جماعي (كرات)</option>
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 'bold', display: 'block' }}>3. عدد المؤشرات المراد تقييمها:</label>
            <select value={mochirMaxCount} onChange={(e) => { setMochirMaxCount(Number(e.target.value)); setCheckedMochirs([]); setGeneratedPlan(null); }} style={{ padding: '8px', width: '100px', marginTop: '5px' }}>
              <option value={3}>3 مؤشرات</option>
              <option value={4}>4 مؤشرات</option>
              <option value={5}>5 مؤشرات</option>
            </select>
          </div>
        </div>

        {/* Level Verified UI Render Strategy Block */}
        {level && (
          <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#fffbe6', borderRadius: '6px', border: '1px solid #ffe58f' }}>
            <h4 style={{ margin: '0 0 10px 0' }}>📋 حدد المؤشرات المستهدفة من المنهاج الوزاري الرسمي ({checkedMochirs.length} من {mochirMaxCount}):</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {activeCurriculumPool.map((mochir) => (
                <label key={mochir.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '5px' }}>
                  <input 
                    type="checkbox" 
                    checked={checkedMochirs.some(item => item.id === mochir.id)} 
                    onChange={() => handleMochirCheckbox(mochir)} 
                  />
                  <span>{mochir.text}</span>
                </label>
              ))}
            </div>
            
            <button 
              onClick={executeCoreGeneration}
              style={{ marginTop: '20px', padding: '10px 25px', backgroundColor: '#0066cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              🔄 معالجة البيانات وتوليد الوثيقة الختامية
            </button>
          </div>
        )}
      </div>

      {/* Printable Sheet Report Core Paper View */}
      {generatedPlan && (
        <div id="printable-pedagogical-document" style={{ backgroundColor: '#fff', padding: '40px', border: '2px solid #000', boxShadow: '0 4px 8px rgba(0,0,0,0.05)', maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px double #000', paddingBottom: '15px' }}>
            <div>
              <h4 style={{ margin: '3px 0' }}>المؤسسة: ثانوية سويح الهواري</h4>
              <h4 style={{ margin: '3px 0' }}>الأستاذ: بن حمادة محمد</h4>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ margin: '0' }}>الوحدة التعلمية: {generatedPlan.sportActivity}</h2>
            </div>
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ margin: '3px 0' }}>السنة الدراسية: {generatedPlan.schoolYear}</h4>
              <h4 style={{ margin: '3px 0' }}>المستوى: {generatedPlan.levelName}</h4>
            </div>
          </div>

          <div style={{ marginTop: '20px', lineHeight: '1.6' }}>
            <p style={{ margin: '6px 0' }}><strong><span style={{ color: '#008000' }}>الكفاءة القاعدة:</span></strong> {generatedPlan.kafaaKaadia}</p>
            <p style={{ margin: '6px 0' }}><strong><span style={{ color: '#0044cc' }}>الكفاءة الختامية الحاكمة:</span></strong> {generatedPlan.kafaaKhatamia}</p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '25px', textAlign: 'center' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ border: '1px solid #000', padding: '12px', width: '12%' }}>طبيعة الحصة</th>
                <th style={{ border: '1px solid #000', padding: '12px', width: '30%' }}>المعايير (المؤشرات الوزارية المعتمدة)</th>
                <th style={{ border: '1px solid #000', padding: '12px', width: '10%' }}>نسبة الفوج</th>
                <th style={{ border: '1px solid #000', padding: '12px', width: '10%' }}>توزيع الحصص</th>
                <th style={{ border: '1px solid #000', padding: '12px', width: '38%' }}>الأهداف الإجرائية الرئيسية (مؤتمتة)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #000', padding: '10px', fontWeight: 'bold', color: 'red' }}>منافسة أولية</td>
                <td style={{ border: '1px solid #000', padding: '10px', fontStyle: 'italic' }} colSpan={3}>إجراء التقويم التشخيصي الميداني ورصد ثغرات التحكم الجماعي للأقسام</td>
                <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right' }}>• رصد وتجميع النقاط الأساسية لبناء خطة الدورة.</td>
              </tr>

              {generatedPlan.rows.map((row, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #000', padding: '10px', fontWeight: 'bold' }}>تعليمية 0{index + 1}</td>
                  <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right' }}>{row.mochirText}</td>
                  <td style={{ border: '1px solid #000', padding: '10px', fontWeight: 'bold' }}>{row.averagePercentage}%</td>
                  <td style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#fafafa', fontWeight: 'bold' }}>{row.allocatedSessions} حصة</td>
                  <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>
                    {row.operationalGoalPhrase}
                  </td>
                </tr>
              ))}

              <tr>
                <td style={{ border: '1px solid #000', padding: '10px', fontWeight: 'bold', color: 'red' }}>منافسة نهائية</td>
                <td style={{ border: '1px solid #000', padding: '10px', fontStyle: 'italic' }} colSpan={3}>إجراء التقويم التحصيلي الختامي للوقوف على مدى تطور مؤشرات القياس</td>
                <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right' }}>• تحقيق أفضل نتيجة رياضية ممكنة وتجاوز نسب العجز السابقة للتحكم.</td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}>
            <div><strong>توقيع أستاذ المادة:</strong></div>
            <div><strong>مصادقة السيد المفتش:</strong></div>
          </div>

          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <button onClick={() => window.print()} style={{ padding: '8px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              🖨️ طباعة الوثيقة الرسمية للوحدة التعلمية
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
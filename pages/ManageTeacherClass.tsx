'use client'
import { useTeacher } from '@/hooks/useTeacher'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-toastify'

const fields = [
    { label: 'الاسم واللقب', key: 'name', type: 'text', placeholder: 'الاسم واللقب' },
    { label: 'الثانوية', key: 'school', type: 'text', placeholder: 'ثانوية ...' },
    { label: 'الولاية', key: 'birthloc', type: 'text', placeholder: 'الولاية' },
    { label: 'الجنسية', key: 'nationality', type: 'text', placeholder: 'جزائري' },
    { label: 'تاريخ الميلاد', key: 'birthday', type: 'date', placeholder: '' },
    { label: 'الحالة المدنية', key: 'statu', type: 'text', placeholder: 'متزوج / أعزب' },
    { label: 'البريد الإلكتروني', key: 'email', type: 'email', placeholder: 'example@mail.com' },
    { label: 'رقم الهاتف', key: 'phone', type: 'text', placeholder: '0550 000 000' },
    { label: 'جامعة الليسانس', key: 'univerLic', type: 'text', placeholder: 'جامعة...' },
    { label: 'سنة الليسانس', key: 'anneLic', type: 'text', placeholder: '2015' },
    { label: 'جامعة الماستر', key: 'univerMas', type: 'text', placeholder: 'جامعة...' },
    { label: 'سنة الماستر', key: 'anneMas', type: 'text', placeholder: '2017' },
]

const ManageTeacherProfile = () => {
    const { teacher, setTeacher, updateTeacher } = useTeacher();
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateTeacher(teacher);
            toast("تم حفظ المعلومات بنجاح !", { type: "success" });
            router.push('/profile');
        } catch {
            toast("فشل حفظ المعلومات، حاول مرة أخرى", { type: "error" });
        } finally {
            setSaving(false);
        }
    };


    return (
        <div dir="rtl" className="min-h-screen bg-[#0a0a0f] text-white p-6 flex justify-center">
            <div className="w-full max-w-2xl flex flex-col gap-6">

                {/* Header */}
                <div className="text-center pt-4">
                    <h1 className="text-2xl font-bold text-white">الملف الشخصي</h1>
                    <p className="text-gray-500 text-sm mt-1">أدخل معلوماتك الشخصية والمهنية</p>
                </div>

                {/* Photo upload */}
                <div className="bg-[#0f0f14] border border-white/8 rounded-2xl p-6 flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-500/40 bg-white/5 flex items-center justify-center">
                        {teacher.photo
                            ? <Image src={teacher.photo} alt="profile" width={96} height={96} className="w-full h-full object-cover" />
                            : <span className="text-4xl">👤</span>
                        }
                    </div>
                    <label className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white px-5 py-2.5 rounded-xl cursor-pointer text-sm font-medium transition-all">
                        📷 تغيير الصورة
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                                const file = e.target.files?.[0]
                                if (file) {
                                    const reader = new FileReader()
                                    reader.onload = () => setTeacher({ ...teacher, photo: reader.result as string })
                                    reader.readAsDataURL(file)
                                }
                            }}
                        />
                    </label>
                </div>

                {/* Form */}
                <div className="bg-[#0f0f14] border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">المعلومات الشخصية والمهنية</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {fields.map(({ label, key, type, placeholder }) => (
                            <div key={key} className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-400">{label}</label>
                                <input
                                    type={type}
                                    placeholder={placeholder}
                                    value={(teacher as Record<string, string>)?.[key] ?? ''}
                                    onChange={e => setTeacher({ ...teacher, [key]: e.target.value })}
                                    className="h-11 bg-white/4 border border-white/8 hover:border-white/15 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10 rounded-xl px-4 text-white text-sm outline-none transition-all placeholder:text-gray-600"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                {/* Save button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full h-13 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] rounded-2xl text-white font-bold text-base transition-all duration-200 shadow-[0_0_30px_rgba(16,185,129,0.2)] disabled:opacity-50"
                >
                    {saving ? '...جاري الحفظ' : '💾 حفظ المعلومات'}
                </button>
            </div>
        </div >
    )
}

export default ManageTeacherProfile
"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED";

interface PaymentUser {
    _id: string;
    name: string;
    email: string;
    isPaid: boolean;
    paidUntil?: string;
}

interface Payment {
    _id: string;
    userId: PaymentUser;
    method: "BARIDIMOB" | "CHARGILY";
    plan: string;
    amount: number;
    receiptUrl: string;
    transactionNumber: string;
    status: PaymentStatus;
    adminNotes?: string;
    createdAt: string;
}

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    isPaid: boolean;
    paidUntil?: string;
    createdAt: string;
}

interface Pagination {
    total: number;
    page: number;
    pages: number;
}

function formatDate(date?: string) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("ar-DZ", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function StatusBadge({ status }: { status: PaymentStatus }) {
    const styles: Record<PaymentStatus, string> = {
        PENDING: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
        APPROVED: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
        REJECTED: "bg-red-500/10 text-red-400 border border-red-500/30",
    };
    const labels: Record<PaymentStatus, string> = {
        PENDING: "قيد الانتظار",
        APPROVED: "مقبول",
        REJECTED: "مرفوض",
    };
    return (
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}

function PaymentActionModal({
    payment,
    onClose,
    onDone,
}: {
    payment: Payment;
    onClose: () => void;
    onDone: () => void;
}) {
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleAction(action: "APPROVE" | "REJECT") {
        setLoading(true);
        setError("");
        try {
            await axios.patch(`/api/admin/payments/${payment._id}`, {
                action,
                adminNotes: notes,
            });
            onDone();
        } catch (e) {
            const err = e as { response?: { data?: { error?: string } } };
            setError(err?.response?.data?.error || "حدث خطأ");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#0f1117] border border-emerald-500/20 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-4 text-right">معالجة الدفعة</h3>

                <div className="bg-[#1a1f2e] rounded-xl p-4 mb-4 space-y-2 text-sm text-right">
                    <div className="flex justify-between">
                        <span className="text-emerald-400">{payment.userId?.name}</span>
                        <span className="text-gray-400">الاسم</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white">{payment.amount} دج</span>
                        <span className="text-gray-400">المبلغ</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white">{payment.transactionNumber}</span>
                        <span className="text-gray-400">رقم العملية</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white">{payment.method}</span>
                        <span className="text-gray-400">طريقة الدفع</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <a
                            href={payment.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 underline text-xs"
                        >
                            عرض الوصل ↗
                        </a>
                        <span className="text-gray-400">الوصل</span>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-1 text-right">
                        ملاحظات (اختياري)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        dir="rtl"
                        className="w-full bg-[#1a1f2e] border border-emerald-500/20 rounded-xl px-4 py-2 text-white text-sm resize-none focus:outline-none focus:border-emerald-500/50"
                        placeholder="أضف ملاحظة للمستخدم..."
                    />
                </div>

                {error && (
                    <p className="text-red-400 text-sm text-right mb-3">{error}</p>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={() => handleAction("REJECT")}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition text-sm font-medium disabled:opacity-50"
                    >
                        رفض
                    </button>
                    <button
                        onClick={() => handleAction("APPROVE")}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition text-sm font-medium disabled:opacity-50"
                    >
                        {loading ? "جارٍ..." : "موافقة"}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition text-sm disabled:opacity-50"
                    >
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
}

function PaymentsTab() {
    const [activeStatus, setActiveStatus] = useState<PaymentStatus>("PENDING");
    const [payments, setPayments] = useState<Payment[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, pages: 1 });
    const [loading, setLoading] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    const fetchPayments = useCallback(async (status: PaymentStatus, page = 1) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/admin/payments?status=${status}&page=${page}`);
            setPayments(res.data.payments);
            setPagination(res.data.pagination);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPayments(activeStatus);
    }, [activeStatus, fetchPayments]);

    const statusTabs: PaymentStatus[] = ["PENDING", "APPROVED", "REJECTED"];
    const statusLabels: Record<PaymentStatus, string> = {
        PENDING: "قيد الانتظار",
        APPROVED: "مقبولة",
        REJECTED: "مرفوضة",
    };

    return (
        <div>
            {/* Status Tabs */}
            <div className="flex gap-2 mb-6 bg-[#0f1117] p-1 rounded-xl w-fit">
                {statusTabs.map((s) => (
                    <button
                        key={s}
                        onClick={() => setActiveStatus(s)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeStatus === s
                            ? "bg-emerald-500 text-black"
                            : "text-gray-400 hover:text-white"
                            }`}
                    >
                        {statusLabels[s]}
                    </button>
                ))}
            </div>
            {/* Table */}
            {loading ? (
                <div className="text-center text-gray-500 py-16">جارٍ التحميل...</div>
            ) : payments.length === 0 ? (
                <div className="text-center text-gray-500 py-16">لا توجد دفعات</div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-emerald-500/10">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-[#0f1117] text-gray-400 border-b border-emerald-500/10">
                            <tr>
                                <th className="px-4 py-3">المستخدم</th>
                                <th className="px-4 py-3">الطريقة</th>
                                <th className="px-4 py-3">المبلغ</th>
                                <th className="px-4 py-3">رقم العملية</th>
                                <th className="px-4 py-3">التاريخ</th>
                                <th className="px-4 py-3">الحالة</th>
                                {activeStatus === "PENDING" && <th className="px-4 py-3">إجراء</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-500/5">
                            {payments.map((p) => (
                                <tr key={p._id} className="hover:bg-emerald-500/5 transition">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-white">{p.userId?.name}</div>
                                        <div className="text-gray-500 text-xs">{p.userId?.email}</div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-300">{p.method}</td>
                                    <td className="px-4 py-3 text-emerald-400 font-medium">{p.amount} دج</td>
                                    <td className="px-4 py-3 text-gray-300 font-mono text-xs">{p.transactionNumber}</td>
                                    <td className="px-4 py-3 text-gray-400">{formatDate(p.createdAt)}</td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={p.status} />
                                    </td>
                                    {activeStatus === "PENDING" && (
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => setSelectedPayment(p)}
                                                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition text-xs"
                                            >
                                                معالجة
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => fetchPayments(activeStatus, p)}
                            className={`w-8 h-8 rounded-lg text-sm transition ${pagination.page === p
                                ? "bg-emerald-500 text-black font-bold"
                                : "bg-white/5 text-gray-400 hover:bg-white/10"
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}

            {/* Modal */}
            {selectedPayment && (
                <PaymentActionModal
                    payment={selectedPayment}
                    onClose={() => setSelectedPayment(null)}
                    onDone={() => {
                        setSelectedPayment(null);
                        fetchPayments(activeStatus, pagination.page);
                    }}
                />
            )}
        </div>
    );
}

function UsersTab() {
    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, pages: 1 });
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState("");

    const fetchUsers = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/admin/users?page=${page}`);
            setUsers(res.data.users);
            setPagination(res.data.pagination);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    async function handleToggle(user: User) {
        const action = user.isPaid ? "DEACTIVATE" : "ACTIVATE";
        setActionLoading(user._id);
        setError("");
        try {
            await axios.patch(`/api/admin/users/${user._id}`, { action });
            fetchUsers(pagination.page);
        } catch (e) {
            const err = e as { response?: { data?: { error?: string } } };
            setError(err?.response?.data?.error || "حدث خطأ");
        } finally {
            setActionLoading(null);
        }
    }

    return (
        <div>
            {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-right">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center text-gray-500 py-16">جارٍ التحميل...</div>
            ) : users.length === 0 ? (
                <div className="text-center text-gray-500 py-16">لا يوجد مستخدمون</div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-emerald-500/10">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-[#0f1117] text-gray-400 border-b border-emerald-500/10">
                            <tr>
                                <th className="px-4 py-3">المستخدم</th>
                                <th className="px-4 py-3">الدور</th>
                                <th className="px-4 py-3">الاشتراك</th>
                                <th className="px-4 py-3">ينتهي في</th>
                                <th className="px-4 py-3">تاريخ التسجيل</th>
                                <th className="px-4 py-3">إجراء</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-500/5">
                            {users.map((u) => (
                                <tr key={u._id} className="hover:bg-emerald-500/5 transition">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-white">{u.name}</div>
                                        <div className="text-gray-500 text-xs">{u.email}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-1 rounded-full ${u.role === "admin"
                                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                                            : "bg-white/5 text-gray-400 border border-white/10"
                                            }`}>
                                            {u.role === "admin" ? "مشرف" : "مستخدم"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.isPaid
                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                                            }`}>
                                            {u.isPaid ? "مفعّل" : "غير مفعّل"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400">{formatDate(u.paidUntil)}</td>
                                    <td className="px-4 py-3 text-gray-400">{formatDate(u.createdAt)}</td>
                                    <td className="px-4 py-3">
                                        {u.role !== "admin" && (
                                            <button
                                                onClick={() => handleToggle(u)}
                                                disabled={actionLoading === u._id}
                                                className={`px-3 py-1.5 rounded-lg border text-xs transition disabled:opacity-50 ${u.isPaid
                                                    ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                                                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                                                    }`}
                                            >
                                                {actionLoading === u._id
                                                    ? "جارٍ..."
                                                    : u.isPaid
                                                        ? "إلغاء التفعيل"
                                                        : "تفعيل"}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => fetchUsers(p)}
                            className={`w-8 h-8 rounded-lg text-sm transition ${pagination.page === p
                                ? "bg-emerald-500 text-black font-bold"
                                : "bg-white/5 text-gray-400 hover:bg-white/10"
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<"payments" | "users">("payments");

    return (
        <div
            dir="rtl"
            className="min-h-screen bg-[#0a0a0f] text-white p-6"
        >
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">لوحة الإدارة</h1>
                <p className="text-gray-500 text-sm mt-1">إدارة المدفوعات والمستخدمين</p>
            </div>

            {/* Main Tabs */}
            <div className="flex gap-1 mb-8 bg-[#0f1117] p-1 rounded-xl w-fit border border-emerald-500/10">
                <button
                    onClick={() => setActiveTab("payments")}
                    className={`px-6 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === "payments"
                        ? "bg-emerald-500 text-black"
                        : "text-gray-400 hover:text-white"
                        }`}
                >
                    المدفوعات
                </button>
                <button
                    onClick={() => setActiveTab("users")}
                    className={`px-6 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === "users"
                        ? "bg-emerald-500 text-black"
                        : "text-gray-400 hover:text-white"
                        }`}
                >
                    المستخدمون
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === "payments" ? <PaymentsTab /> : <UsersTab />}
        </div>
    );
}
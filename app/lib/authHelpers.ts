import mongoose from "mongoose";
import User from "@/app/models/User";
import Class, { IClass } from "@/app/models/Class";

interface LeanUserPaidStatus {
  isPaid?: boolean;
}

/**
 * Confirms the given user has an active paid account.
 * Always does a fresh DB lookup — never trust isPaid from the client/session/cookies.
 */
export async function requirePaidUser(userId: string): Promise<
  | { ok: true }
  | { ok: false; response: Response }
> {
  const user = await User.findById(userId)
    .select("isPaid")
    .lean<LeanUserPaidStatus | null>();

  if (!user || !user.isPaid) {
    return {
      ok: false,
      response: Response.json(
        { message: "يجب تفعيل الحساب للتمكن من تحميل الاقسام" },
        { status: 403 }
      ),
    };
  }

  return { ok: true };
}

/**
 * Confirms the given classId belongs to the given teacher (userId).
 * Prevents one teacher from reading/writing another teacher's classes or students.
 * Returns the class doc on success so callers can reuse it if needed.
 */
export async function requireOwnedClass(classId: string, userId: string): Promise<
  | { ok: true; classDoc: mongoose.HydratedDocument<IClass> }
  | { ok: false; response: Response }
> {
  const classDoc = await Class.findOne({ _id: classId, teacher: userId });

  if (!classDoc) {
    return {
      ok: false,
      response: Response.json(
        { message: "اعد المحاولة لاحقا" },
        { status: 404 }
      ),
    };
  }

  return { ok: true, classDoc };
}
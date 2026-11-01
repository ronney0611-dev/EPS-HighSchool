import mongoose from "mongoose";
import DOMPurify from "isomorphic-dompurify";
import Teacher from "@/app/models/Teacher";
import SharedBan from "@/app/models/Sharedban";

export const SPORT_NAMES: Record<string, string> = {
  sprint: "السرعة", long_jump: "الوثب الطويل", shot_put: "دفع الجلة",
  basketball: "كرة السلة", handball: "كرة اليد", volleyball: "الكرة الطائرة",
};

export const isObjectId = (v: unknown): v is string =>
  typeof v === "string" && mongoose.Types.ObjectId.isValid(v);

export async function authorNameOf(userId: string): Promise<string> {
  const t = await Teacher.findOne({ userId }).select("name").lean<{ name?: string }>();
  return (t?.name ?? "").trim() || "أستاذ";
}

// admin = an email listed in ADMIN_EMAILS (.env), comma separated: ADMIN_EMAILS=me@mail.com,other@mail.com
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  return list.includes(email.trim().toLowerCase());
}

export const REPORTS_TO_HIDE = 3;

export async function isBanned(userId: string): Promise<boolean> {
  return !!(await SharedBan.exists({ userId }));
}

// text typed in the fiche (contentEditable HTML): nothing that can run in the browser of another teacher.
// DOMPurify = the real cleaner (scripts, on* events, javascript: links...). Forms and ids are removed too.
export const SANITIZE_OPTIONS = {
  FORBID_TAGS: ["style", "form", "input", "button", "textarea", "select", "option", "iframe", "object", "embed"],
  FORBID_ATTR: ["id", "name", "contenteditable"],
};
export const cleanHtml = (html: unknown): string =>
  DOMPurify.sanitize(String(html ?? "").slice(0, 20000), SANITIZE_OPTIONS);

export const PUBLISH_PER_DAY = 20;
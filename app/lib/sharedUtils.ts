
import mongoose from "mongoose";
import sanitizeHtml from "sanitize-html";
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
// sanitize-html = pure JS cleaner (works on Vercel, no jsdom): only simple text formatting is kept,
// scripts, on* events, javascript: links, forms, iframes and ids are removed.
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["div", "span", "p", "br", "b", "strong", "i", "em", "u", "ul", "ol", "li", "font", "sub", "sup", "small"],
  allowedAttributes: { "*": ["style", "class", "dir"], font: ["color", "size", "face"] },
  allowedSchemes: [],
  disallowedTagsMode: "discard",
};
export const cleanHtml = (html: unknown): string =>
  sanitizeHtml(String(html ?? "").slice(0, 20000), SANITIZE_OPTIONS);

export const PUBLISH_PER_DAY = 20;
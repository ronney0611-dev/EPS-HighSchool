import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/app/lib/mongo";
import SharedItem from "@/app/models/Shareditem";
import { SPORT_NAMES, isObjectId, authorNameOf, isBanned, cleanHtml, PUBLISH_PER_DAY } from "@/app/lib/sharedUtils";

const MAX_PAYLOAD = 200_000; // characters of JSON

type Built = { stage: "lycee" | "primaire"; level: string; sports: string[]; label: string; title: string; payload: Record<string, unknown> };
const bad = (error: string) => ({ error });

/* ---------- fiche ---------- */
function buildFiche(p: Record<string, unknown>, title: unknown): Built | { error: string } {
  const levelKey = String(p.level ?? "");
  const m = /^level([123])$/.exec(levelKey);
  if (!m) return bad("المستوى غير صالح");

  const sn = p.sessionNumber;
  const okSession =
    (typeof sn === "number" && Number.isInteger(sn) && sn >= 1 && sn <= 20) ||
    sn === "تقويم تشخيصي" || sn === "تقويم تحصيلي";
  if (!okSession) return bad("رقم الحصة غير صالح");

  const pick = (v: unknown) => {
    const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
    return {
      sport: typeof o.sport === "string" && SPORT_NAMES[o.sport] ? o.sport : "",
      indicatorId: typeof o.indicatorId === "number" ? o.indicatorId : null,
      indicatorIds: Array.isArray(o.indicatorIds) ? o.indicatorIds.filter((x) => typeof x === "number").slice(0, 10) : [],
      batteryChosen: Object.fromEntries(
        Object.entries((o.batteryChosen && typeof o.batteryChosen === "object" ? o.batteryChosen : {}) as Record<string, unknown>)
          .filter(([k, v]) => /^\d+$/.test(k) && (v === null || typeof v === "string"))
          .slice(0, 10)
          .map(([k, v]) => [k, v === null ? null : String(v).slice(0, 40)])
      ),
      count: typeof o.count === "number" ? Math.min(Math.max(1, o.count), 10) : 3,
      chosenKeys: Array.isArray(o.chosenKeys) ? o.chosenKeys.slice(0, 10).map((k) => (typeof k === "string" ? k.slice(0, 40) : null)) : [],
    };
  };
  const individual = pick(p.individual);
  const collective = pick(p.collective);
  if (!individual.sport && !collective.sport) return bad("اختر النشاط قبل النشر");

  const rawFields = (p.fields && typeof p.fields === "object" ? p.fields : {}) as Record<string, unknown>;
  const fields = Object.fromEntries(
    Object.entries(rawFields)
      .filter(([k]) => /^[a-z_]{1,30}$/.test(k))
      .slice(0, 60)
      .map(([k, v]) => [k, cleanHtml(v)])
  );

  const label = typeof sn === "number" ? `تعليمية ${sn}` : sn;
  const sports = [individual.sport, collective.sport].filter(Boolean);
  const auto = `${sports.map((s) => SPORT_NAMES[s]).join(" + ")} — ${label}`;
  return {
    stage: "lycee",
    level: m[1],
    sports,
    label,
    title: (typeof title === "string" && title.trim() ? title.trim() : auto).slice(0, 200),
    payload: { level: levelKey, sessionNumber: sn, individual, collective, fields },
  };
}

/* ---------- وحدة ---------- */
function buildWahda(p: Record<string, unknown>, title: unknown): Built | { error: string } {
  const level = String(p.level ?? "");
  if (!["1", "2", "3"].includes(level)) return bad("المستوى غير صالح");
  const sport = String(p.sport ?? "");
  if (!SPORT_NAMES[sport]) return bad("النشاط غير صالح");
  const trimester = String(p.trimester ?? "");
  if (!["1", "2", "3"].includes(trimester)) return bad("الفصل غير صالح");
  if (!Array.isArray(p.sessions) || p.sessions.length === 0 || p.sessions.length > 20) return bad("الوحدة فارغة أو غير صالحة");

  const sessions = (p.sessions as Record<string, unknown>[]).map((s) => ({
    sessionNumber: Number(s?.sessionNumber) || 0,
    indicatorId: Number(s?.indicatorId) || 0,
    indicatorText: String(s?.indicatorText ?? "").slice(0, 500),
    goal: String(s?.goal ?? "").slice(0, 500),
    specialGoal: String(s?.specialGoal ?? "").slice(0, 500),
    isReminder: !!s?.isReminder,
  }));
  const kaidiIndex = [0, 1, 2].includes(Number(p.kaidiIndex)) ? Number(p.kaidiIndex) : 0;
  const ahdafIndex = Number(p.ahdafIndex) === 1 ? 1 : 0;

  const learning = sessions.filter((s) => s.sessionNumber > 0).length;
  const auto = `${SPORT_NAMES[sport]} — ${learning} حصص`;
  return {
    stage: "lycee",
    level,
    sports: [sport],
    label: `الفصل ${trimester}`,
    title: (typeof title === "string" && title.trim() ? title.trim() : auto).slice(0, 200),
    payload: { sport, trimester, sessions, kaidiIndex, ahdafIndex },
  };
}

const PAGE_SIZE = 24;
const escapeRegex = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const sp = new URL(request.url).searchParams;
    const filter: Record<string, unknown> = { published: true, hidden: false };

    const stage = sp.get("stage");
    if (stage === "primaire" || stage === "cem") filter.stage = stage;
    else if (stage === "lycee") filter.stage = { $in: ["lycee", null] }; // old items have no stage
    const type = sp.get("type");
    if (type === "fiche" || type === "wahda" || type === "ficheP") filter.type = type;
    const level = sp.get("level");
    if (level && /^[1-5]$/.test(level)) filter.level = level;
    const sport = sp.get("sport");
    if (sport && (SPORT_NAMES[sport] || MAIDANS.includes(sport))) filter.sports = sport;
    const q = (sp.get("q") ?? "").trim().slice(0, 60);
    if (q) {
      const rx = new RegExp(escapeRegex(q), "i");
      filter.$or = [{ title: rx }, { authorName: rx }, { label: rx }];
    }

    const sortKey = sp.get("sort");
    const sort: Record<string, 1 | -1> =
      sortKey === "new" ? { createdAt: -1 } : sortKey === "useful" ? { useful: -1, createdAt: -1 } : { copies: -1, createdAt: -1 };
    const page = Math.max(1, Math.min(200, Number(sp.get("page")) || 1));

    await connectDB();
    const docs = await SharedItem.find(filter)
      .sort(sort)
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE + 1)
      .select("authorName type stage level sports label title copies useful tried comments createdAt")
      .lean();

    return NextResponse.json({
      items: JSON.parse(JSON.stringify(docs.slice(0, PAGE_SIZE))),
      hasMore: docs.length > PAGE_SIZE,
    });
  } catch (error: unknown) {
    console.error("shared GET:", error);
    return NextResponse.json({ error: "خطأ في تحميل المكتبة" }, { status: 500 });
  }
}

/* ---------- fiche primaire ---------- */
const MAIDANS = ["alwad3iyat", "harakat", "alhaykala"];
function buildFicheP(p: Record<string, unknown>, title: unknown): Built | { error: string } {
  const m = /^level([1-5])$/.exec(String(p.level ?? ""));
  if (!m) return bad("المستوى غير صالح");
  const k = (p.pick && typeof p.pick === "object" ? p.pick : {}) as Record<string, unknown>;
  const maidan = String(k.maidan ?? "");
  if (!MAIDANS.includes(maidan)) return bad("الميدان غير صالح");
  const unitName = typeof k.unitName === "string" ? k.unitName.slice(0, 120) : "";
  if (!unitName) return bad("اختر الحصة قبل النشر");
  const pick = {
    maidan,
    unitName,
    count: Math.min(Math.max(Number(k.count) || 1, 1), 10),
    chosenIds: Array.isArray(k.chosenIds) ? k.chosenIds.slice(0, 10).map((x) => (typeof x === "string" ? x.slice(0, 60) : null)) : [],
  };
  const rawFields = (p.fields && typeof p.fields === "object" ? p.fields : {}) as Record<string, unknown>;
  const fields = Object.fromEntries(
    Object.entries(rawFields).filter(([key]) => /^[a-z0-9_]{1,30}$/.test(key)).slice(0, 60).map(([key, v]) => [key, cleanHtml(v)])
  );
  return {
    stage: "primaire",
    level: m[1],
    sports: [maidan],
    label: unitName,
    title: (typeof title === "string" && title.trim() ? title.trim() : unitName).slice(0, 200),
    payload: { level: `level${m[1]}`, pick, fields },
  };
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    const userId = session.user.id;

    const raw = await request.text();
    if (raw.length > MAX_PAYLOAD) return NextResponse.json({ error: "المحتوى كبير جدا" }, { status: 413 });
    let body: Record<string, unknown>;
    try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 }); }

    const type = body.type;
    const payload = (body.payload && typeof body.payload === "object" ? body.payload : null) as Record<string, unknown> | null;
    if ((type !== "fiche" && type !== "wahda" && type !== "ficheP") || !payload) {
      return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
    }

    const built = type === "fiche" ? buildFiche(payload, body.title)
      : type === "ficheP" ? buildFicheP(payload, body.title)
        : buildWahda(payload, body.title);
    if ("error" in built) return NextResponse.json({ error: built.error }, { status: 400 });

    await connectDB();
    if (await isBanned(userId)) {
      return NextResponse.json({ error: "تم إيقاف النشر في حسابك، تواصل مع الإدارة" }, { status: 403 });
    }

    const sourceId = isObjectId(body.sourceId) ? body.sourceId : null;
    const authorName = await authorNameOf(userId);
    const data = { ...built, authorName, published: true };

    // same document published again -> update it (keeps its copies, likes and comments)
    if (sourceId) {
      const existing = await SharedItem.findOne({ authorId: userId, type, sourceId });
      if (existing) {
        if (existing.hidden) {
          return NextResponse.json({ error: "هذه المشاركة موقوفة من طرف الإدارة" }, { status: 403 });
        }
        existing.set(data);
        await existing.save();
        return NextResponse.json({ item: { _id: String(existing._id), title: existing.title }, updated: true });
      }
    }

    // a NEW item: max 20 per teacher in 24h (updating an existing one is not counted)
    const today = await SharedItem.countDocuments({ authorId: userId, createdAt: { $gte: new Date(Date.now() - 86_400_000) } });
    if (today >= PUBLISH_PER_DAY) {
      return NextResponse.json({ error: `وصلت إلى الحد الأقصى للنشر اليوم (${PUBLISH_PER_DAY})، حاول غدا` }, { status: 429 });
    }

    const item = await SharedItem.create({ ...data, authorId: userId, type, sourceId });
    return NextResponse.json({ item: { _id: String(item._id), title: item.title }, updated: false });
  } catch (error: unknown) {
    console.error("shared POST:", error);
    return NextResponse.json({ error: "خطأ أثناء النشر، حاول مرة أخرى" }, { status: 500 });
  }
}
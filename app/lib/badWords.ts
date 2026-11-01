const WORDS: string[] = [
  // Arabic / Darja — complete this list yourself
  "كلب", "حمار", "تافه", "غبي", "حقير", "زبل", "قحبة", "شرموطة", "نيك", "زامل",
  // French / Latin
  "connard", "connasse", "salope", "pute", "putain", "encule", "merde", "batard", "fdp", "ntm",
];

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")            // é -> e
    .replace(/[ً-ٰٟـ]/g, "") // tashkeel + tatweel
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/(.)\1{2,}/g, "$1");               // كلللب -> كلب

const LIST = WORDS.map(normalize);

export function hasBadWords(text: string): boolean {
  const words = normalize(text).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  return words.some((w) => LIST.some((b) => w === b || (b.length >= 4 && w.includes(b))));
}
import slugify from "slugify";

const ARABIC_MAP: Record<string, string> = {
  ا: "a",
  أ: "a",
  إ: "i",
  آ: "aa",
  ء: "",
  ب: "b",
  ت: "t",
  ث: "th",
  ج: "j",
  ح: "h",
  خ: "kh",
  د: "d",
  ذ: "dh",
  ر: "r",
  ز: "z",
  س: "s",
  ش: "sh",
  ص: "s",
  ض: "d",
  ط: "t",
  ظ: "z",
  ع: "a",
  غ: "gh",
  ف: "f",
  ق: "q",
  ك: "k",
  ل: "l",
  م: "m",
  ن: "n",
  ه: "h",
  و: "w",
  ي: "y",
  ى: "a",
  ة: "a",
  ئ: "y",
  ؤ: "w",
  ڤ: "v",
  پ: "p",
  گ: "g",
  چ: "ch",
};

export function transliterateArabic(input: string): string {
  const withoutMarks = input
    .replace(/لا/g, "la")
    .replace(/[\u064B-\u065F\u0670]/g, "");
  let out = "";
  for (const char of withoutMarks) {
    out += ARABIC_MAP[char] ?? char;
  }
  return out;
}

export function slugFromTitle(title: string): string {
  const transliterated = transliterateArabic(title);
  const slug = slugify(transliterated, {
    lower: true,
    strict: true,
    trim: true,
  });
  return slug || "item";
}

export type SlugModel =
  | "product"
  | "category"
  | "service"
  | "page"
  | "post"
  | "project"
  | "author"
  | "teamMember"
  | "location"
  | "tag";

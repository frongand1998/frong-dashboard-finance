export const CATEGORY_NAME_KEYS = [
  "uncategorized",
  "food",
  "transport",
  "housing",
  "utilities",
  "shopping",
  "entertainment",
  "healthcare",
  "education",
  "salary",
  "investment",
  "bills",
  "insurance",
  "tax",
  "savings",
  "travel",
] as const;

export type CategoryNameKey = (typeof CATEGORY_NAME_KEYS)[number];

const CATEGORY_ALIAS_MAP: { key: CategoryNameKey; aliases: string[] }[] = [
  {
    key: "uncategorized",
    aliases: [
      "uncategorized",
      "uncategorised",
      "other",
      "misc",
      "ไม่ระบุ",
      "อื่นๆ",
      "อื่น",
    ],
  },
  {
    key: "food",
    aliases: [
      "food",
      "dining",
      "restaurant",
      "meal",
      "grocery",
      "อาหาร",
      "ของกิน",
      "ร้านอาหาร",
    ],
  },
  {
    key: "transport",
    aliases: [
      "transport",
      "transportation",
      "fuel",
      "gas",
      "uber",
      "taxi",
      "grab",
      "เดินทาง",
      "ขนส่ง",
      "น้ำมัน",
      "รถ",
    ],
  },
  {
    key: "housing",
    aliases: [
      "housing",
      "rent",
      "mortgage",
      "home",
      "ที่อยู่อาศัย",
      "ค่าเช่า",
      "บ้าน",
    ],
  },
  {
    key: "utilities",
    aliases: [
      "utility",
      "utilities",
      "electric",
      "water",
      "internet",
      "phone",
      "ค่าน้ำ",
      "ค่าไฟ",
      "อินเทอร์เน็ต",
      "โทรศัพท์",
      "สาธารณูปโภค",
    ],
  },
  {
    key: "shopping",
    aliases: [
      "shopping",
      "shop",
      "fashion",
      "clothes",
      "ชอป",
      "ชอปปิง",
      "ซื้อของ",
      "เสื้อผ้า",
    ],
  },
  {
    key: "entertainment",
    aliases: [
      "entertainment",
      "movie",
      "game",
      "stream",
      "subscription",
      "บันเทิง",
      "หนัง",
      "เกม",
      "สมัครสมาชิก",
    ],
  },
  {
    key: "healthcare",
    aliases: [
      "health",
      "healthcare",
      "medical",
      "hospital",
      "pharmacy",
      "สุขภาพ",
      "การแพทย์",
      "โรงพยาบาล",
      "ยา",
    ],
  },
  {
    key: "education",
    aliases: [
      "education",
      "course",
      "tuition",
      "school",
      "learning",
      "การศึกษา",
      "ค่าเรียน",
      "คอร์ส",
    ],
  },
  {
    key: "salary",
    aliases: ["salary", "payroll", "wage", "income", "เงินเดือน", "รายรับ"],
  },
  {
    key: "investment",
    aliases: [
      "investment",
      "invest",
      "stock",
      "fund",
      "crypto",
      "dividend",
      "ลงทุน",
      "หุ้น",
      "กองทุน",
      "คริปโต",
      "ปันผล",
    ],
  },
  {
    key: "bills",
    aliases: ["bill", "bills", "payment", "บิล", "ชำระ", "ค่าใช้จ่ายประจำ"],
  },
  {
    key: "insurance",
    aliases: ["insurance", "premium", "ประกัน", "เบี้ยประกัน"],
  },
  { key: "tax", aliases: ["tax", "vat", "ภาษี"] },
  { key: "savings", aliases: ["saving", "savings", "ออม", "เงินออม"] },
  {
    key: "travel",
    aliases: [
      "travel",
      "trip",
      "hotel",
      "flight",
      "ท่องเที่ยว",
      "ทริป",
      "โรงแรม",
      "ตั๋วเครื่องบิน",
    ],
  },
];

function normalize(input: string) {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

export function matchCategoryNameKey(category: string): CategoryNameKey {
  const normalized = normalize(category);
  if (!normalized) return "uncategorized";

  const matched = CATEGORY_ALIAS_MAP.find((entry) =>
    entry.aliases.some((alias) => {
      const a = normalize(alias);
      return normalized === a || normalized.includes(a);
    }),
  );

  return matched?.key ?? "uncategorized";
}

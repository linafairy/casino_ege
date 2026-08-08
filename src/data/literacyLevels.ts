import { LiteracyLevel } from "../types";

export const LITERACY_LEVELS: LiteracyLevel[] = [
  {
    level: 1,
    title: "🐣 Школьник-Новичок",
    minXp: 0,
    maxXp: 300,
    badge: "🌱",
    perk: "Базовая ставка 10 фишек",
    color: "from-slate-500 to-slate-700",
  },
  {
    level: 2,
    title: "📚 Ученик 10-11 класса",
    minXp: 300,
    maxXp: 800,
    badge: "📖",
    perk: "Открыта Рулетка Знаков",
    color: "from-blue-600 to-indigo-800",
  },
  {
    level: 3,
    title: "🎓 Абитуриент-Знаток",
    minXp: 800,
    maxXp: 1800,
    badge: "📜",
    perk: "Открыт Блэкджек 21 Задание",
    color: "from-teal-600 to-emerald-800",
  },
  {
    level: 4,
    title: "🎯 Кандидат 80+ балов",
    minXp: 1800,
    maxXp: 3500,
    badge: "🔥",
    perk: "Бонус +20% к выигрышу фишек",
    color: "from-purple-600 to-pink-800",
  },
  {
    level: 5,
    title: "🏆 Стобалльник ЕГЭ",
    minXp: 3500,
    maxXp: 6000,
    badge: "⭐",
    perk: "VIP-столы и бесплатная страховка",
    color: "from-amber-500 to-yellow-700",
  },
  {
    level: 6,
    title: "👑 Магистр Пунктуации",
    minXp: 6000,
    maxXp: 10000,
    badge: "👑",
    perk: "Множитель выигрыша x1.5 ко всем играм",
    color: "from-red-600 to-rose-900",
  },
  {
    level: 7,
    title: "🏛️ Профессор Грамотности",
    minXp: 10000,
    maxXp: 999999,
    badge: "💎",
    perk: "Абсолютный филологический суверенитет",
    color: "from-amber-300 via-yellow-500 to-amber-600",
  },
];

export function getLevelInfo(xp: number): { currentLevel: LiteracyLevel; nextLevel?: LiteracyLevel; progressPercent: number } {
  let current = LITERACY_LEVELS[0];
  for (let i = LITERACY_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LITERACY_LEVELS[i].minXp) {
      current = LITERACY_LEVELS[i];
      break;
    }
  }

  const nextIndex = LITERACY_LEVELS.findIndex((l) => l.level === current.level + 1);
  const nextLevel = nextIndex !== -1 ? LITERACY_LEVELS[nextIndex] : undefined;

  let progressPercent = 100;
  if (nextLevel) {
    const range = nextLevel.minXp - current.minXp;
    const gained = xp - current.minXp;
    progressPercent = Math.min(100, Math.max(0, Math.round((gained / range) * 100)));
  }

  return { currentLevel: current, nextLevel, progressPercent };
}

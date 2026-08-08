export type TaskType = "16" | "17" | "18" | "19" | "20" | "21";

export type QuestionType = "numbers" | "sentences";

export interface NumberQuestionOption {
  num: number;
  rule: string;
}

export interface SentenceItem {
  num: number;
  text: string;
}

export interface Question {
  id: string;
  taskNumber: TaskType;
  type: QuestionType;
  title: string;
  instruction: string;
  sentence?: string; // For 16-20
  options?: NumberQuestionOption[]; // For 16-20
  targetPunctuation?: "ТИРЕ" | "ДВОЕТОЧИЕ" | "ЗАПЯТАЯ"; // For 21
  sentencesList?: SentenceItem[]; // For 21
  ruleName?: string;
  correctAnswer: number[];
  ruleDescription: string;
  difficulty: "легкий" | "средний" | "сложный";
}

export interface LiteracyLevel {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  badge: string;
  perk: string;
  color: string;
}

export type CasinoMode = "slots" | "roulette" | "blackjack" | "practice";

export interface UserStats {
  chips: number;
  xp: number;
  streak: number;
  highestStreak: number;
  totalGames: number;
  wins: number;
  losses: number;
  totalChipsWon: number;
  taskStats: Record<TaskType, { attempted: number; correct: number }>;
  equippedTheme: "gold" | "emerald" | "neon" | "royal";
  boosters: {
    shield: number; // Insurance booster
    hint: number;   // Hint booster
    doubleXp: number; // 2x XP booster
  };
  unlockedTitles: string[];
}

export interface PunctuationRule {
  taskNumber: TaskType;
  title: string;
  shortSummary: string;
  keyPoints: string[];
  traps: string[]; // "Ловушки ЕГЭ"
  example: string;
}

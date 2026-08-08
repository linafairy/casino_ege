import React, { useState, useEffect } from "react";
import { Question, TaskType, UserStats } from "../types";
import { USE_QUESTIONS } from "../data/useQuestions";
import { QuestionCard } from "./QuestionCard";
import { casinoAudio } from "../utils/soundEffects";
import { Sparkles, Coins, Flame, ArrowRight, Zap, RefreshCw } from "lucide-react";

interface SlotMachineGameProps {
  stats: UserStats;
  onUpdateStats: (netChips: number, xpEarned: number, isWin: boolean, taskType: TaskType) => void;
  onUseBooster: (type: "shield" | "hint") => boolean;
}

const REEL_1_TASKS: TaskType[] = ["16", "17", "18", "19", "20", "21"];
const REEL_2_MULTIPLIERS = [1, 2, 3, 5, 10]; // 10 is Jackpot
const REEL_3_PERKS = ["Обычный", "Двойной XP", "Без подсказок", "Двойной XP"];

export const SlotMachineGame: React.FC<SlotMachineGameProps> = ({
  stats,
  onUpdateStats,
  onUseBooster,
}) => {
  const [bet, setBet] = useState<number>(50);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  // Reel display values
  const [reel1, setReel1] = useState<TaskType>("16");
  const [reel2, setReel2] = useState<number>(2);
  const [reel3, setReel3] = useState<string>("Обычный");

  // Active question state
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);

  // Handle slot spin lever
  const handleSpin = async () => {
    if (isSpinning || stats.chips < bet) return;

    setIsSpinning(true);
    casinoAudio.playCardFlip();

    let spins = 0;
    const maxSpins = 20;

    const interval = setInterval(() => {
      spins++;
      casinoAudio.playReelTick();

      const randomTask = REEL_1_TASKS[Math.floor(Math.random() * REEL_1_TASKS.length)];
      const randomMult = REEL_2_MULTIPLIERS[Math.floor(Math.random() * REEL_2_MULTIPLIERS.length)];
      const randomPerk = REEL_3_PERKS[Math.floor(Math.random() * REEL_3_PERKS.length)];

      setReel1(randomTask);
      setReel2(randomMult);
      setReel3(randomPerk);

      if (spins >= maxSpins) {
        clearInterval(interval);
        setIsSpinning(false);

        if (randomMult >= 5) {
          casinoAudio.playJackpotSound();
        } else {
          casinoAudio.playChipSound();
        }

        // Fetch question for the resulting task
        fetchOrPickQuestion(randomTask);
      }
    }, 100);
  };

  const fetchOrPickQuestion = async (taskNumber: TaskType) => {
    // Attempt Gemini AI question generation or fallback to database
    try {
      const res = await fetch("/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskType: taskNumber }),
      });
      const data = await res.json();
      if (data.question) {
        setActiveQuestion({
          ...data.question,
          id: `ai-${Date.now()}`,
        });
        return;
      }
    } catch {
      // Fallback
    }

    // Pick from preloaded database
    const matching = USE_QUESTIONS.filter((q) => q.taskNumber === taskNumber);
    const picked = matching[Math.floor(Math.random() * matching.length)] || USE_QUESTIONS[0];
    setActiveQuestion({
      ...picked,
      id: `local-${Date.now()}`,
    });
  };

  const handleQuestionComplete = (success: boolean, netChipsChange: number, xpEarned: number) => {
    const finalXp = reel3 === "Двойной XP" ? xpEarned * 2 : xpEarned;
    onUpdateStats(netChipsChange, finalXp, success, reel1);
    setActiveQuestion(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Active Challenge Modal / Card overlay */}
      {activeQuestion ? (
        <QuestionCard
          question={activeQuestion}
          betAmount={bet}
          multiplier={reel2}
          stats={stats}
          onComplete={handleQuestionComplete}
          onUseBooster={onUseBooster}
        />
      ) : (
        /* Slot Machine Chassis */
        <div className="bg-gradient-to-b from-slate-900 via-amber-950/40 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Neon Title Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-2">
              <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
              ЕГЭ Слот-Машина • Испытай Удачу
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Вращайте барабаны и умножайте фишки!
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/70 mt-1 max-w-lg mx-auto">
              Выбери ставку, дерни за рычаг! Выпавшее задание принесет мультипликатор к выигрышу.
            </p>
          </div>

          {/* Slot Reels Container */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 bg-slate-950 p-4 sm:p-6 rounded-2xl border-2 border-amber-500/40 shadow-inner relative">
            {/* Reel 1: Task Number */}
            <div className="flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 rounded-xl p-4 sm:p-6 shadow-md min-h-[140px]">
              <span className="text-[10px] sm:text-xs text-amber-400 font-semibold uppercase tracking-wider mb-2">
                Задание №
              </span>
              <div
                className={`text-3xl sm:text-5xl font-black text-amber-300 tracking-wider transition-all transform ${
                  isSpinning ? "scale-110 blur-[1px]" : "scale-100"
                }`}
              >
                №{reel1}
              </div>
              <span className="text-[10px] text-slate-400 mt-2 font-medium">Пунктуация</span>
            </div>

            {/* Reel 2: Multiplier */}
            <div className="flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 rounded-xl p-4 sm:p-6 shadow-md min-h-[140px]">
              <span className="text-[10px] sm:text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-2">
                Множитель
              </span>
              <div
                className={`text-3xl sm:text-5xl font-black tracking-wider transition-all transform ${
                  reel2 === 10
                    ? "text-yellow-400 animate-pulse scale-125 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]"
                    : "text-emerald-400"
                } ${isSpinning ? "blur-[1px]" : ""}`}
              >
                {reel2 === 10 ? "JACKPOT x10" : `x${reel2}`}
              </div>
              <span className="text-[10px] text-slate-400 mt-2 font-medium">К вашей ставке</span>
            </div>

            {/* Reel 3: Special Perk */}
            <div className="flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 rounded-xl p-4 sm:p-6 shadow-md min-h-[140px]">
              <span className="text-[10px] sm:text-xs text-purple-400 font-semibold uppercase tracking-wider mb-2">
                Бонус Режима
              </span>
              <div
                className={`text-sm sm:text-lg font-bold text-purple-200 text-center transition-all ${
                  isSpinning ? "blur-[1px]" : ""
                }`}
              >
                {reel3}
              </div>
              <span className="text-[10px] text-slate-400 mt-2 font-medium">Экстра преимущество</span>
            </div>
          </div>

          {/* Betting Controls & Spin Button */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-amber-500/30">
            {/* Bet Selector */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="text-xs text-amber-200 font-medium mr-1">Ставка (фишки):</span>
              {[10, 50, 100, 250, 500, 1000].map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    casinoAudio.playChipSound();
                    setBet(b);
                  }}
                  disabled={isSpinning}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    bet === b
                      ? "bg-amber-500 text-slate-950 border-amber-300 shadow-md scale-105"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            {/* Spin Lever Button */}
            <button
              onClick={handleSpin}
              disabled={isSpinning || stats.chips < bet}
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-lg tracking-wide uppercase shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                stats.chips < bet
                  ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                  : isSpinning
                  ? "bg-amber-600 text-amber-200 animate-pulse cursor-wait"
                  : "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 shadow-amber-500/30 hover:scale-105 active:scale-95"
              }`}
            >
              <RefreshCw className={`w-5 h-5 ${isSpinning ? "animate-spin" : ""}`} />
              {isSpinning ? "ВРАЩЕНИЕ..." : stats.chips < bet ? "НЕДОСТАТОЧНО ФИШЕК" : "КРУТИТЬ СЛОТЫ!"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

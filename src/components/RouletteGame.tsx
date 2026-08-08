import React, { useState } from "react";
import { Question, TaskType, UserStats } from "../types";
import { USE_QUESTIONS } from "../data/useQuestions";
import { QuestionCard } from "./QuestionCard";
import { casinoAudio } from "../utils/soundEffects";
import { Coins, Sparkles, RefreshCw, Trophy, ArrowRight } from "lucide-react";

interface RouletteGameProps {
  stats: UserStats;
  onUpdateStats: (netChips: number, xpEarned: number, isWin: boolean, taskType: TaskType) => void;
  onUseBooster: (type: "shield" | "hint") => boolean;
}

type BetSector = "red" | "black" | "green";

export const RouletteGame: React.FC<RouletteGameProps> = ({
  stats,
  onUpdateStats,
  onUseBooster,
}) => {
  const [selectedBetSector, setSelectedBetSector] = useState<BetSector>("red");
  const [betAmount, setBetAmount] = useState<number>(100);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [wheelRotation, setWheelRotation] = useState<number>(0);

  const [winningSector, setWinningSector] = useState<BetSector | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [chosenTask, setChosenTask] = useState<TaskType>("16");
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(2);

  // Spin the wheel
  const handleSpinWheel = async () => {
    if (isSpinning || stats.chips < betAmount) return;

    setIsSpinning(true);
    casinoAudio.playCardFlip();

    // Determine outcome sector
    const sectors: BetSector[] = ["red", "black", "green", "red", "black", "red", "black"];
    const outcome = sectors[Math.floor(Math.random() * sectors.length)];

    // Calculate rotation
    const baseSpins = 360 * 5; // 5 full loops
    let sectorAngle = 0;
    if (outcome === "red") sectorAngle = 45;
    else if (outcome === "black") sectorAngle = 135;
    else sectorAngle = 270;

    const newRotation = wheelRotation + baseSpins + sectorAngle + Math.floor(Math.random() * 30);
    setWheelRotation(newRotation);

    // Audio animation tick
    let ticks = 0;
    const interval = setInterval(() => {
      ticks++;
      casinoAudio.playReelTick();
      if (ticks >= 25) clearInterval(interval);
    }, 120);

    setTimeout(() => {
      setIsSpinning(false);
      setWinningSector(outcome);

      // Map outcome sector to Task number
      let taskNum: TaskType = "16";
      let mult = 2;

      if (outcome === "red") {
        taskNum = Math.random() > 0.5 ? "16" : "17";
        mult = 2;
      } else if (outcome === "black") {
        taskNum = Math.random() > 0.5 ? "18" : "19";
        mult = 2;
      } else {
        taskNum = Math.random() > 0.5 ? "20" : "21";
        mult = 5; // Green Zero VIP payout!
      }

      setChosenTask(taskNum);
      setCurrentMultiplier(mult);

      // Check if user bet matched the winning sector
      if (outcome === selectedBetSector) {
        casinoAudio.playWinFanfare();
      } else {
        casinoAudio.playLoseSound();
      }

      // Launch question
      fetchOrPickQuestion(taskNum);
    }, 3200);
  };

  const fetchOrPickQuestion = async (taskNumber: TaskType) => {
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
          id: `ai-roulette-${Date.now()}`,
        });
        return;
      }
    } catch {
      // Fallback
    }

    const matching = USE_QUESTIONS.filter((q) => q.taskNumber === taskNumber);
    const picked = matching[Math.floor(Math.random() * matching.length)] || USE_QUESTIONS[0];
    setActiveQuestion({
      ...picked,
      id: `local-roulette-${Date.now()}`,
    });
  };

  const handleQuestionComplete = (success: boolean, netChipsChange: number, xpEarned: number) => {
    onUpdateStats(netChipsChange, xpEarned, success, chosenTask);
    setActiveQuestion(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {activeQuestion ? (
        <QuestionCard
          question={activeQuestion}
          betAmount={betAmount}
          multiplier={currentMultiplier}
          stats={stats}
          onComplete={handleQuestionComplete}
          onUseBooster={onUseBooster}
        />
      ) : (
        <div className="bg-gradient-to-b from-slate-900 via-emerald-950/40 to-slate-950 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-2">
              <span>🎡</span> Рулетка Знаков • Казино
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Сделайте ставку на цвет пунктуации!
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/70 mt-1 max-w-lg mx-auto">
              Красное = Задания 16–17 • Чёрное = Задания 18–19 • Зелёное Zero = Стыки союзов (x5)!
            </p>
          </div>

          {/* Wheel & Table Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-950 p-6 rounded-2xl border border-emerald-500/30 shadow-inner">
            {/* Animated Roulette Wheel */}
            <div className="flex flex-col items-center justify-center relative">
              <div className="w-56 h-56 sm:w-64 sm:h-64 relative flex items-center justify-center">
                {/* Outer Wheel Rim */}
                <div className="absolute inset-0 rounded-full border-4 border-amber-500/80 shadow-[0_0_25px_rgba(234,179,8,0.3)] bg-gradient-to-tr from-slate-900 via-emerald-950 to-slate-900" />

                {/* Spinning Sector Wheel SVG */}
                <svg
                  className="w-full h-full p-3 transition-transform duration-[3000ms] cubic-bezier(0.15, 0.85, 0.35, 1.05)"
                  style={{ transform: `rotate(${wheelRotation}deg)` }}
                  viewBox="0 0 100 100"
                >
                  {/* Red sectors */}
                  <path d="M 50 50 L 50 0 A 50 50 0 0 1 100 50 Z" fill="#dc2626" />
                  <path d="M 50 50 L 0 50 A 50 50 0 0 1 50 100 Z" fill="#dc2626" />

                  {/* Black sectors */}
                  <path d="M 50 50 L 100 50 A 50 50 0 0 1 50 100 Z" fill="#1e293b" />
                  <path d="M 50 50 L 50 100 A 50 50 0 0 1 0 50 Z" fill="#1e293b" />

                  {/* Green zero sector */}
                  <path d="M 50 50 L 50 0 A 50 50 0 0 0 0 50 Z" fill="#059669" />

                  {/* Inner Hub */}
                  <circle cx="50" cy="50" r="18" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
                </svg>

                {/* Ball indicator needle */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-amber-400 rotate-45 border-2 border-slate-950 shadow-lg z-10 animate-pulse" />
              </div>

              {winningSector && !isSpinning && (
                <div className="mt-3 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs">
                  Шарик выпал на: {winningSector.toUpperCase()} (Задание {chosenTask})
                </div>
              )}
            </div>

            {/* Betting Table Layout */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Выберите сектор для ставки:
              </span>

              <div className="grid grid-cols-1 gap-3">
                {/* Red Sector */}
                <button
                  type="button"
                  onClick={() => {
                    casinoAudio.playChipSound();
                    setSelectedBetSector("red");
                  }}
                  disabled={isSpinning}
                  className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedBetSector === "red"
                      ? "bg-rose-600/90 border-rose-300 text-white shadow-lg shadow-rose-600/30 scale-[1.02]"
                      : "bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-rose-500 border border-white" />
                    <div>
                      <div className="font-bold text-sm">КРАСНОЕ (x2)</div>
                      <div className="text-xs opacity-80">Задания 16 & 17 (ССП и причастия)</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-black/40 px-2 py-1 rounded">2x</span>
                </button>

                {/* Black Sector */}
                <button
                  type="button"
                  onClick={() => {
                    casinoAudio.playChipSound();
                    setSelectedBetSector("black");
                  }}
                  disabled={isSpinning}
                  className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedBetSector === "black"
                      ? "bg-slate-800 border-slate-400 text-white shadow-lg shadow-slate-700/50 scale-[1.02]"
                      : "bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-950 border border-slate-400" />
                    <div>
                      <div className="font-bold text-sm">ЧЁРНОЕ (x2)</div>
                      <div className="text-xs opacity-80">Задания 18 & 19 (Вводные и СПП)</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-black/40 px-2 py-1 rounded">2x</span>
                </button>

                {/* Green Zero VIP Sector */}
                <button
                  type="button"
                  onClick={() => {
                    casinoAudio.playChipSound();
                    setSelectedBetSector("green");
                  }}
                  disabled={isSpinning}
                  className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedBetSector === "green"
                      ? "bg-emerald-600/90 border-emerald-300 text-white shadow-lg shadow-emerald-600/40 scale-[1.02]"
                      : "bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 border border-white" />
                    <div>
                      <div className="font-bold text-sm">ЗЕЛЁНОЕ ZERO VIP (x5)</div>
                      <div className="text-xs opacity-80">Задания 20 & 21 (Стыки союзов & Анализ)</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-amber-500 text-slate-950 px-2 py-1 rounded">5x</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bet Controls & Spin Action */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-emerald-500/30">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="text-xs text-emerald-200 font-medium">Размер ставки:</span>
              {[50, 100, 250, 500, 1000].map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    casinoAudio.playChipSound();
                    setBetAmount(b);
                  }}
                  disabled={isSpinning}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    betAmount === b
                      ? "bg-emerald-500 text-slate-950 border-emerald-300 shadow-md scale-105"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleSpinWheel}
              disabled={isSpinning || stats.chips < betAmount}
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-lg uppercase tracking-wider shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                stats.chips < betAmount
                  ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                  : isSpinning
                  ? "bg-emerald-600 text-emerald-200 animate-pulse"
                  : "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 shadow-emerald-500/30 hover:scale-105 active:scale-95"
              }`}
            >
              <RefreshCw className={`w-5 h-5 ${isSpinning ? "animate-spin" : ""}`} />
              {isSpinning ? "ШАРИК КРУТИТСЯ..." : "ВРАЩАТЬ РУЛЕТКУ!"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

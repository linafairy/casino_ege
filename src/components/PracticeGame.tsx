import React, { useState } from "react";
import { Question, TaskType, UserStats } from "../types";
import { USE_QUESTIONS } from "../data/useQuestions";
import { QuestionCard } from "./QuestionCard";
import { casinoAudio } from "../utils/soundEffects";
import { Sparkles, Coins, Target, Brain, ArrowRight } from "lucide-react";

interface PracticeGameProps {
  stats: UserStats;
  onUpdateStats: (netChips: number, xpEarned: number, isWin: boolean, taskType: TaskType) => void;
  onUseBooster: (type: "shield" | "hint") => boolean;
}

export const PracticeGame: React.FC<PracticeGameProps> = ({
  stats,
  onUpdateStats,
  onUseBooster,
}) => {
  const [selectedTask, setSelectedTask] = useState<TaskType>("16");
  const [betAmount, setBetAmount] = useState<number>(50);
  const [useAi, setUseAi] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);

  const tasksInfo: { task: TaskType; name: string; desc: string }[] = [
    { task: "16", name: "Задание 16", desc: "ССП и однородные члены" },
    { task: "17", name: "Задание 17", desc: "Причастные и деепричастные обороты" },
    { task: "18", name: "Задание 18", desc: "Вводные слова и обращения" },
    { task: "19", name: "Задание 19", desc: "Сложноподчинённое предложение" },
    { task: "20", name: "Задание 20", desc: "Стыки союзов (ТО, НО, ТАК)" },
    { task: "21", name: "Задание 21", desc: "Пунктуационный анализ текста" },
  ];

  const handleStartTask = async () => {
    if (stats.chips < betAmount || loading) return;

    setLoading(true);
    casinoAudio.playCardFlip();

    if (useAi) {
      try {
        const res = await fetch("/api/generate-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskType: selectedTask }),
        });
        const data = await res.json();
        if (data.question) {
          setActiveQuestion({ ...data.question, id: `practice-ai-${Date.now()}` });
          setLoading(false);
          return;
        }
      } catch {
        // Fallback
      }
    }

    // Local Question fallback
    const matching = USE_QUESTIONS.filter((q) => q.taskNumber === selectedTask);
    const picked = matching[Math.floor(Math.random() * matching.length)] || USE_QUESTIONS[0];
    setActiveQuestion({ ...picked, id: `practice-local-${Date.now()}` });
    setLoading(false);
  };

  const handleQuestionComplete = (success: boolean, netChipsChange: number, xpEarned: number) => {
    onUpdateStats(netChipsChange, xpEarned, success, selectedTask);
    setActiveQuestion(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {activeQuestion ? (
        <QuestionCard
          question={activeQuestion}
          betAmount={betAmount}
          multiplier={1.5}
          stats={stats}
          onComplete={handleQuestionComplete}
          onUseBooster={onUseBooster}
        />
      ) : (
        <div className="bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-950 border-2 border-indigo-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-2">
              <Target className="w-4 h-4 text-indigo-400" />
              ЕГЭ Тренинг Арена • Выбор задания
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Выберите номер задания для тренировки
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/70 mt-1 max-w-lg mx-auto">
              Прокачивайте конкретные задания с 16 по 21, ставьте фишки и зарабатывайте высокий рейтинг!
            </p>
          </div>

          {/* Grid of Task Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 my-6">
            {tasksInfo.map((t) => (
              <button
                key={t.task}
                type="button"
                onClick={() => {
                  casinoAudio.playChipSound();
                  setSelectedTask(t.task);
                }}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                  selectedTask === t.task
                    ? "bg-gradient-to-br from-indigo-600 to-indigo-800 border-indigo-300 text-white shadow-xl shadow-indigo-600/30 scale-[1.03]"
                    : "bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-lg text-amber-300">№{t.task}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/40 text-indigo-200">
                    x1.5
                  </span>
                </div>
                <div className="font-bold text-xs">{t.name}</div>
                <div className="text-[11px] opacity-80 mt-1 leading-tight">{t.desc}</div>
              </button>
            ))}
          </div>

          {/* Betting & AI Source Controls */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-indigo-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Bet Amount */}
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className="text-xs text-indigo-200 font-medium">Ставка:</span>
                {[10, 50, 100, 250, 500].map((b) => (
                  <button
                    key={b}
                    onClick={() => {
                      casinoAudio.playChipSound();
                      setBetAmount(b);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      betAmount === b
                        ? "bg-indigo-500 text-slate-950 border-indigo-300 shadow scale-105"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    {b} фишек
                  </button>
                ))}
              </div>

              {/* AI toggle */}
              <label className="flex items-center gap-2 text-xs font-medium text-indigo-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useAi}
                  onChange={(e) => setUseAi(e.target.checked)}
                  className="w-4 h-4 rounded border-indigo-500 text-indigo-600 focus:ring-indigo-500"
                />
                <Sparkles className="w-4 h-4 text-purple-400" />
                Генерировать задания с помощью ИИ
              </label>
            </div>

            {/* Launch Task */}
            <button
              type="button"
              onClick={handleStartTask}
              disabled={loading || stats.chips < betAmount}
              className={`w-full py-4 rounded-2xl font-black text-base uppercase tracking-wider shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                stats.chips < betAmount
                  ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                  : loading
                  ? "bg-indigo-600 text-indigo-200 animate-pulse"
                  : "bg-gradient-to-r from-amber-500 via-indigo-500 to-amber-500 text-slate-950 shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99]"
              }`}
            >
              {loading ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  ГЕНЕРАЦИЯ ЗАДАНИЯ...
                </>
              ) : (
                <>
                  НАЧАТЬ ЗАДАНИЕ №{selectedTask} (СТАВКА {betAmount})
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

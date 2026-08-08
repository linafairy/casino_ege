import React, { useState } from "react";
import { Question, UserStats } from "../types";
import { casinoAudio } from "../utils/soundEffects";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Shield,
  Coins,
  BrainCircuit,
  ArrowRight,
  Info,
  Lightbulb,
} from "lucide-react";

interface QuestionCardProps {
  question: Question;
  betAmount: number;
  multiplier: number;
  stats: UserStats;
  onComplete: (success: boolean, netChipsChange: number, xpEarned: number) => void;
  onUseBooster: (boosterType: "shield" | "hint") => boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  betAmount,
  multiplier,
  stats,
  onComplete,
  onUseBooster,
}) => {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [shieldActive, setShieldActive] = useState<boolean>(false);
  const [hintUsed, setHintUsed] = useState<boolean>(false);
  const [hintMsg, setHintMsg] = useState<string | null>(null);

  // AI explanation state
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  const potentialPayout = Math.round(betAmount * multiplier);

  // Toggle selection for numbers (1, 2, 3...)
  const toggleSelect = (num: number) => {
    if (isSubmitted) return;
    casinoAudio.playChipSound();
    setSelectedIndices((prev) =>
      prev.includes(num) ? prev.filter((i) => i !== num) : [...prev, num].sort((a, b) => a - b)
    );
  };

  // Activate Shield Booster
  const handleUseShield = () => {
    if (shieldActive || isSubmitted) return;
    const success = onUseBooster("shield");
    if (success) {
      setShieldActive(true);
      casinoAudio.playChipSound();
    }
  };

  // Activate Hint Booster
  const handleUseHint = () => {
    if (hintUsed || isSubmitted) return;
    const success = onUseBooster("hint");
    if (success) {
      setHintUsed(true);
      casinoAudio.playChipSound();

      // Find one correct number not yet selected or give rule tip
      const missing = question.correctAnswer.find((num) => !selectedIndices.includes(num));
      if (missing !== undefined) {
        setHintMsg(`💡 Подсказка Филолога: В позиции [${missing}] точно нужна запятая/знак!`);
        setSelectedIndices((prev) => [...prev, missing].sort((a, b) => a - b));
      } else {
        setHintMsg(`💡 Подсказка Филолога: Внимательно проверьте границы придаточных частей.`);
      }
    }
  };

  // Submit Answer
  const handleSubmit = () => {
    if (isSubmitted) return;

    // Check correctness
    const sortedUser = [...selectedIndices].sort((a, b) => a - b);
    const sortedCorrect = [...question.correctAnswer].sort((a, b) => a - b);

    const userEqualsCorrect =
      sortedUser.length === sortedCorrect.length &&
      sortedUser.every((val, idx) => val === sortedCorrect[idx]);

    setIsSubmitted(true);
    setIsCorrect(userEqualsCorrect);

    if (userEqualsCorrect) {
      casinoAudio.playWinFanfare();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#eab308", "#10b981", "#3b82f6"],
      });
    } else {
      casinoAudio.playLoseSound();
    }
  };

  // Finish and return payout to parent
  const handleNext = () => {
    let netChips = 0;
    let xpEarned = 0;

    if (isCorrect) {
      netChips = potentialPayout;
      xpEarned = Math.round(50 * multiplier);
    } else {
      if (shieldActive) {
        netChips = 0; // Shield prevented losing bet!
      } else {
        netChips = -betAmount;
      }
      xpEarned = 10; // Consolation XP for learning
    }

    onComplete(isCorrect, netChips, xpEarned);
  };

  // Request AI Explanation from server
  const fetchAiExplanation = async () => {
    if (aiLoading || aiExplanation) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/explain-mistake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          userAnswer: selectedIndices,
          correctAnswer: question.correctAnswer,
        }),
      });
      const data = await res.json();
      if (data.explanation) {
        setAiExplanation(data.explanation);
      } else {
        setAiExplanation("Не удалось получить разбор ИИ. Обратитесь к правилам ЕГЭ.");
      }
    } catch {
      setAiExplanation("Ошибка подключения к эксперту ИИ.");
    } finally {
      setAiLoading(false);
    }
  };

  // Render clickable interactive sentence with numbers [1], [2]...
  const renderInteractiveSentence = () => {
    if (!question.sentence) return null;

    // Replace [1], [2] with clickable inline badges
    const parts = question.sentence.split(/(\[\d+\])/g);

    return (
      <div className="p-4 sm:p-6 bg-slate-900/90 rounded-2xl border border-amber-500/30 text-lg sm:text-xl font-serif leading-relaxed tracking-wide text-amber-100 shadow-inner my-4">
        {parts.map((part, idx) => {
          const match = part.match(/^\[(\d+)\]$/);
          if (match) {
            const num = parseInt(match[1], 10);
            const isSelected = selectedIndices.includes(num);
            const isTargetCorrect = question.correctAnswer.includes(num);

            let btnStyle = "bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/40";

            if (isSubmitted) {
              if (isTargetCorrect && isSelected) {
                btnStyle = "bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/30 animate-pulse";
              } else if (isTargetCorrect && !isSelected) {
                btnStyle = "bg-amber-600 text-amber-100 border-amber-400 border-dashed animate-bounce";
              } else if (!isTargetCorrect && isSelected) {
                btnStyle = "bg-rose-600 text-white border-rose-400 line-through";
              } else {
                btnStyle = "bg-slate-800 text-slate-500 border-slate-700 opacity-60";
              }
            } else if (isSelected) {
              btnStyle = "bg-amber-500 text-slate-950 border-amber-300 font-extrabold shadow-md scale-110";
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleSelect(num)}
                disabled={isSubmitted}
                className={`inline-flex items-center justify-center px-2.5 py-1 mx-1 my-0.5 rounded-xl border text-sm font-sans font-bold transition-all transform active:scale-95 ${btnStyle}`}
              >
                [{num}]
              </button>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden text-white max-w-3xl mx-auto my-4">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row: Task Title & Bet Multiplier Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold uppercase tracking-wider">
            {question.title}
          </span>
          <span className="text-xs text-slate-400">Сложность: {question.difficulty}</span>
        </div>

        {/* Stake & Payout Display */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-amber-500/30 rounded-2xl px-4 py-1.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span>Ставка:</span>
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-amber-300">{betAmount}</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-emerald-400 font-bold">x{multiplier}</span>
            <span className="text-slate-400">=</span>
            <span className="font-extrabold text-emerald-300">{potentialPayout} фишек</span>
          </div>
        </div>
      </div>

      {/* Instruction */}
      <div className="mt-4">
        <p className="text-sm font-medium text-amber-200/90 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          {question.instruction}
        </p>
      </div>

      {/* Interactive Content Area */}
      {question.type === "numbers" ? (
        renderInteractiveSentence()
      ) : (
        /* Task 21: Sentence List Selection */
        <div className="space-y-2.5 my-4">
          <div className="text-xs text-amber-400/80 font-semibold mb-1 uppercase tracking-wider">
            Текст для анализа (Правило: {question.targetPunctuation}):
          </div>
          {question.sentencesList?.map((s) => {
            const isSelected = selectedIndices.includes(s.num);
            const isTargetCorrect = question.correctAnswer.includes(s.num);

            let rowStyle = "bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-200";

            if (isSubmitted) {
              if (isTargetCorrect && isSelected) {
                rowStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-100 font-medium";
              } else if (isTargetCorrect && !isSelected) {
                rowStyle = "bg-amber-950/80 border-amber-500 text-amber-200 border-dashed";
              } else if (!isTargetCorrect && isSelected) {
                rowStyle = "bg-rose-950/80 border-rose-500 text-rose-200 line-through";
              } else {
                rowStyle = "bg-slate-900/40 border-slate-800 opacity-50 text-slate-500";
              }
            } else if (isSelected) {
              rowStyle = "bg-amber-500/20 border-amber-400 text-amber-100 font-medium shadow-md";
            }

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => toggleSelect(s.num)}
                disabled={isSubmitted}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${rowStyle}`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    isSelected ? "bg-amber-500 text-slate-950" : "bg-slate-700 text-slate-300"
                  }`}
                >
                  ({s.num})
                </div>
                <div className="text-sm sm:text-base leading-relaxed font-serif">{s.text}</div>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Numbers Summary Badge Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 rounded-2xl p-3 border border-slate-800 my-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Ваш выбор:</span>
          {selectedIndices.length === 0 ? (
            <span className="text-xs text-slate-500 italic">
              (нажмите на цифры выше, чтобы выбрать запятые)
            </span>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap">
              {selectedIndices.map((n) => (
                <span
                  key={n}
                  className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs shadow"
                >
                  {question.type === "sentences" ? `(${n})` : `[${n}]`}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Boosters Row */}
        {!isSubmitted && (
          <div className="flex items-center gap-2">
            {/* Shield Insurance */}
            <button
              type="button"
              onClick={handleUseShield}
              disabled={shieldActive || stats.boosters.shield <= 0}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                shieldActive
                  ? "bg-emerald-900/80 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/20"
                  : stats.boosters.shield > 0
                  ? "bg-slate-800 hover:bg-slate-700 text-blue-300 border-blue-500/40"
                  : "bg-slate-900 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              {shieldActive ? "Страховка активна" : `Страховка (${stats.boosters.shield})`}
            </button>

            {/* Hint Booster */}
            <button
              type="button"
              onClick={handleUseHint}
              disabled={hintUsed || stats.boosters.hint <= 0}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                hintUsed
                  ? "bg-amber-900/80 border-amber-500 text-amber-300"
                  : stats.boosters.hint > 0
                  ? "bg-slate-800 hover:bg-slate-700 text-yellow-300 border-yellow-500/40"
                  : "bg-slate-900 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed"
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              {hintUsed ? "Подсказка взята" : `Подсказка (${stats.boosters.hint})`}
            </button>
          </div>
        )}
      </div>

      {/* Hint Message Box */}
      {hintMsg && !isSubmitted && (
        <div className="mb-4 p-3 bg-amber-950/60 border border-amber-500/50 rounded-xl text-xs text-amber-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
          <span>{hintMsg}</span>
        </div>
      )}

      {/* Action Submit Button */}
      {!isSubmitted ? (
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-extrabold text-base shadow-xl shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-5 h-5 fill-slate-950" />
          ПОДТВЕРДИТЬ И СДЕЛАТЬ СТАВКУ!
        </button>
      ) : (
        /* Result & Detailed Explanation View */
        <div className="space-y-4 pt-2 border-t border-slate-800">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              isCorrect
                ? "bg-emerald-950/80 border-emerald-500 text-emerald-200"
                : "bg-rose-950/80 border-rose-500 text-rose-200"
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-bold text-base">
                {isCorrect
                  ? `КУШ СОРВАН! +${potentialPayout} ФИШЕК!`
                  : shieldActive
                  ? "ОШИБКА, НО СТРАХОВКА СПАСЛА ВАШИ ФИШКИ!"
                  : `УВЫ, МИМО! СТАВКА -${betAmount} ФИШЕК.`}
              </h4>
              <p className="text-xs opacity-90 mt-1">
                Правильный ответ:{" "}
                <span className="font-bold underline text-white">
                  {question.correctAnswer.join(", ")}
                </span>
              </p>
            </div>
          </div>

          {/* Grammar Rule Breakdown */}
          <div className="p-4 bg-slate-950/80 border border-amber-500/30 rounded-2xl">
            <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-amber-400" />
              Филологический разбор правила ЕГЭ:
            </h5>
            <p className="text-sm text-slate-200 whitespace-pre-line leading-relaxed font-sans">
              {question.ruleDescription}
            </p>
          </div>

          {/* AI Explanation Button / Content */}
          {!isCorrect && (
            <div>
              {!aiExplanation ? (
                <button
                  type="button"
                  onClick={fetchAiExplanation}
                  disabled={aiLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/50 text-purple-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                  {aiLoading ? "Консультируемся с экспертом ИИ..." : "Спросить объяснение у ИИ-Эксперта ЕГЭ"}
                </button>
              ) : (
                <div className="p-4 bg-purple-950/70 border border-purple-500/40 rounded-2xl text-xs leading-relaxed text-purple-100 whitespace-pre-line">
                  <div className="font-bold text-purple-300 mb-1 flex items-center gap-1.5 text-sm">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Персональный разбор ИИ-Филолога:
                  </div>
                  {aiExplanation}
                </div>
              )}
            </div>
          )}

          {/* Continue / Next Question Button */}
          <button
            type="button"
            onClick={handleNext}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-base shadow-xl shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            ПРОДОЛЖИТЬ ИГРУ В КАЗИНО
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

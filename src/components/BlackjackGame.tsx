import React, { useState } from "react";
import { Question, TaskType, UserStats } from "../types";
import { USE_QUESTIONS } from "../data/useQuestions";
import { QuestionCard } from "./QuestionCard";
import { casinoAudio } from "../utils/soundEffects";
import { Sparkles, Coins, ShieldAlert, ArrowRight, ShieldCheck } from "lucide-react";

interface BlackjackGameProps {
  stats: UserStats;
  onUpdateStats: (netChips: number, xpEarned: number, isWin: boolean, taskType: TaskType) => void;
  onUseBooster: (type: "shield" | "hint") => boolean;
}

interface CardItem {
  id: string;
  value: number;
  taskNumber: TaskType;
  title: string;
}

export const BlackjackGame: React.FC<BlackjackGameProps> = ({
  stats,
  onUpdateStats,
  onUseBooster,
}) => {
  const [bet, setBet] = useState<number>(100);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  const [playerCards, setPlayerCards] = useState<CardItem[]>([]);
  const [playerScore, setPlayerScore] = useState<number>(0);

  const [dealerCards, setDealerCards] = useState<CardItem[]>([]);
  const [dealerScore, setDealerScore] = useState<number>(0);

  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [pendingCard, setPendingCard] = useState<CardItem | null>(null);

  const [gameEnded, setGameEnded] = useState<boolean>(false);
  const [gameResultMsg, setGameResultMsg] = useState<string>("");

  // Start new Blackjack round
  const startNewGame = () => {
    if (stats.chips < bet) return;
    casinoAudio.playCardFlip();

    setPlayerCards([]);
    setPlayerScore(0);
    setDealerCards([]);
    setDealerScore(0);
    setGameEnded(false);
    setGameResultMsg("");
    setGameStarted(true);

    // Initial dealer card
    const dVal = Math.floor(Math.random() * 8) + 4; // 4 to 11
    setDealerCards([{ id: "d1", value: dVal, taskNumber: "21", title: "Карта Экзаменатора" }]);
    setDealerScore(dVal);

    // Prompt player to draw their first card task
    drawCardForPlayer();
  };

  const drawCardForPlayer = async () => {
    casinoAudio.playCardFlip();

    const tasks: TaskType[] = ["16", "17", "18", "19", "20", "21"];
    const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
    const cardVal = Math.floor(Math.random() * 6) + 5; // 5 to 10 points

    const card: CardItem = {
      id: `p-${Date.now()}`,
      value: cardVal,
      taskNumber: randomTask,
      title: `Задание ${randomTask} (${cardVal} очков)`,
    };

    setPendingCard(card);

    // Fetch question
    try {
      const res = await fetch("/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskType: randomTask }),
      });
      const data = await res.json();
      if (data.question) {
        setActiveQuestion(data.question);
        return;
      }
    } catch {
      // Fallback
    }

    const matching = USE_QUESTIONS.filter((q) => q.taskNumber === randomTask);
    const picked = matching[Math.floor(Math.random() * matching.length)] || USE_QUESTIONS[0];
    setActiveQuestion(picked);
  };

  const handleQuestionComplete = (success: boolean, netChipsChange: number, xpEarned: number) => {
    if (!pendingCard) return;

    if (success) {
      const newScore = playerScore + pendingCard.value;
      const updatedPlayerCards = [...playerCards, pendingCard];
      setPlayerCards(updatedPlayerCards);
      setPlayerScore(newScore);

      if (newScore > 21) {
        // Player busted!
        setGameEnded(true);
        setGameResultMsg("ПЕРЕБОР (>21)! Экзаменатор ЕГЭ забирает ставку.");
        casinoAudio.playLoseSound();
        onUpdateStats(-bet, 15, false, pendingCard.taskNumber);
      } else if (newScore === 21) {
        // Perfect 21!
        setGameEnded(true);
        setGameResultMsg("БЛЭКДЖЕК 21! Идеальный результат ЕГЭ! Победа x3!");
        casinoAudio.playWinFanfare();
        onUpdateStats(bet * 3, 100, true, pendingCard.taskNumber);
      }
    } else {
      // Failed question: card value lost
      casinoAudio.playLoseSound();
    }

    setActiveQuestion(null);
    setPendingCard(null);
  };

  // Player decides to Stand (ХВАТИТ)
  const handleStand = () => {
    casinoAudio.playCardFlip();

    // Dealer plays automatically
    let currentDScore = dealerScore;
    const newDCards = [...dealerCards];

    while (currentDScore < 17) {
      const addVal = Math.floor(Math.random() * 7) + 5;
      currentDScore += addVal;
      newDCards.push({
        id: `d-${Date.now()}-${addVal}`,
        value: addVal,
        taskNumber: "21",
        title: `Экзаменатор (+${addVal})`,
      });
    }

    setDealerCards(newDCards);
    setDealerScore(currentDScore);
    setGameEnded(true);

    if (currentDScore > 21 || playerScore > currentDScore) {
      setGameResultMsg(`ВЫ ПОБЕДИЛИ ЭКЗАМЕНАТОРА! (${playerScore} против ${currentDScore}). Выигрыш x2!`);
      casinoAudio.playWinFanfare();
      onUpdateStats(bet * 2, 80, true, "21");
    } else if (playerScore === currentDScore) {
      setGameResultMsg(`НИЧЬЯ (${playerScore} : ${currentDScore}). Ставка возвращается.`);
      onUpdateStats(0, 30, true, "21");
    } else {
      setGameResultMsg(`ЭКЗАМЕНАТОР ПОБЕДИЛ (${currentDScore} против ${playerScore}).`);
      casinoAudio.playLoseSound();
      onUpdateStats(-bet, 10, false, "21");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {activeQuestion ? (
        <QuestionCard
          question={activeQuestion}
          betAmount={bet}
          multiplier={1}
          stats={stats}
          onComplete={handleQuestionComplete}
          onUseBooster={onUseBooster}
        />
      ) : (
        <div className="bg-gradient-to-b from-slate-900 via-teal-950/40 to-slate-950 border-2 border-teal-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-widest mb-2">
              <span>🃏</span> Блэкджек 21 • Экзаменатор ЕГЭ
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Наберите 21 очко, решая задания!
            </h2>
            <p className="text-xs sm:text-sm text-teal-200/70 mt-1 max-w-lg mx-auto">
              Каждая верно решенная карта дает очки к вашей руке. Обойдите Банкира-Экзаменатора!
            </p>
          </div>

          {!gameStarted || gameEnded ? (
            /* Start Game Box */
            <div className="bg-slate-950 p-6 rounded-2xl border border-teal-500/30 text-center space-y-4">
              {gameEnded && (
                <div
                  className={`p-4 rounded-xl border font-bold text-sm sm:text-base ${
                    playerScore <= 21 && (dealerScore > 21 || playerScore >= dealerScore)
                      ? "bg-emerald-950 border-emerald-500 text-emerald-200"
                      : "bg-rose-950 border-rose-500 text-rose-200"
                  }`}
                >
                  {gameResultMsg}
                </div>
              )}

              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="text-xs text-teal-200 font-medium">Выберите ставку:</span>
                {[50, 100, 250, 500, 1000].map((b) => (
                  <button
                    key={b}
                    onClick={() => {
                      casinoAudio.playChipSound();
                      setBet(b);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      bet === b
                        ? "bg-teal-500 text-slate-950 border-teal-300 scale-105"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    {b} фишек
                  </button>
                ))}
              </div>

              <button
                onClick={startNewGame}
                disabled={stats.chips < bet}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-500 text-slate-950 font-black text-lg tracking-wider uppercase shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                РАЗДАТЬ КАРТЫ (СТАВКА {bet})
              </button>
            </div>
          ) : (
            /* Active Game Table */
            <div className="space-y-6">
              {/* Dealer Hand Area */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Рука Экзаменатора ЕГЭ
                  </span>
                  <span className="text-sm font-extrabold text-rose-400">Сумма: {dealerScore}</span>
                </div>
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {dealerCards.map((c) => (
                    <div
                      key={c.id}
                      className="w-20 h-28 bg-gradient-to-tr from-slate-900 to-slate-800 border-2 border-rose-500/50 rounded-xl p-2 flex flex-col justify-between items-center shadow-md shrink-0"
                    >
                      <span className="text-xs font-bold text-rose-400">+{c.value}</span>
                      <span className="text-xl">🎓</span>
                      <span className="text-[9px] text-slate-400 text-center">Экзаменатор</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Player Hand Area */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-teal-500/40 shadow-inner">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                    Ваша Рука (Максимум 21)
                  </span>
                  <span
                    className={`text-base font-black ${
                      playerScore > 21
                        ? "text-rose-500 animate-pulse"
                        : playerScore === 21
                        ? "text-yellow-400 animate-bounce"
                        : "text-emerald-400"
                    }`}
                  >
                    Сумма: {playerScore} / 21
                  </span>
                </div>

                {playerCards.length === 0 ? (
                  <div className="text-xs text-slate-500 italic p-4 text-center">
                    Нажмите "Взять карту", чтобы ответить на задание и получить очки.
                  </div>
                ) : (
                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {playerCards.map((c) => (
                      <div
                        key={c.id}
                        className="w-24 h-32 bg-gradient-to-tr from-slate-900 to-teal-950 border-2 border-teal-400 rounded-xl p-2 flex flex-col justify-between items-center shadow-lg shrink-0"
                      >
                        <span className="text-xs font-bold text-amber-300">+{c.value}</span>
                        <span className="text-2xl">📖</span>
                        <span className="text-[10px] font-bold text-teal-200 text-center">
                          №{c.taskNumber}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Player Game Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={drawCardForPlayer}
                  disabled={playerScore >= 21}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  ➕ ВЗЯТЬ КАРТУ (ЕГЭ ЗАДАНИЕ)
                </button>

                <button
                  type="button"
                  onClick={handleStand}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 hover:bg-slate-700 text-white font-bold text-sm uppercase tracking-wider border border-slate-600 shadow-md transition-all cursor-pointer"
                >
                  🛑 ХВАТИТ (ОСТАНОВИТЬСЯ)
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

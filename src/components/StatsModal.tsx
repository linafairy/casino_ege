import React from "react";
import { UserStats, TaskType } from "../types";
import { getLevelInfo } from "../data/literacyLevels";
import { BarChart3, X, Trophy, Target, Flame, Coins, CheckCircle, XCircle } from "lucide-react";

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null;

  const { currentLevel, nextLevel, progressPercent } = getLevelInfo(stats.xp);
  const winRate =
    stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;

  const tasks: TaskType[] = ["16", "17", "18", "19", "20", "21"];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-amber-200">
                Статистика и Уровень Грамотности
              </h3>
              <p className="text-xs text-slate-400">Аналитика ваших игр в казино пунктуации</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Level Progress Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 rounded-2xl border border-amber-500/40">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{currentLevel.badge}</span>
              <div>
                <h4 className="font-bold text-lg text-amber-300">{currentLevel.title}</h4>
                <p className="text-xs text-amber-200/80">{currentLevel.perk}</p>
              </div>
            </div>

            {/* XP Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Прогресс уровня: {stats.xp} XP</span>
                <span>{nextLevel ? `Следующий: ${nextLevel.minXp} XP` : "МАКС. УРОВЕНЬ!"}</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">Процент побед</span>
              <span className="text-2xl font-black text-emerald-400">{winRate}%</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">Всего сыграно</span>
              <span className="text-2xl font-black text-amber-300">{stats.totalGames}</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">Рекорд серии</span>
              <span className="text-2xl font-black text-rose-400">{stats.highestStreak}x</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">Выиграно фишек</span>
              <span className="text-2xl font-black text-yellow-400">
                {stats.totalChipsWon.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Accuracy Breakdown Per Task (16-21) */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
              Успеваемость по заданиям ЕГЭ (16–21):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tasks.map((t) => {
                const s = stats.taskStats[t] || { attempted: 0, correct: 0 };
                const pct = s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0;

                return (
                  <div
                    key={t}
                    className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-200">Задание №{t}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Решено: {s.correct} из {s.attempted}
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-black text-base ${
                          pct >= 80
                            ? "text-emerald-400"
                            : pct >= 50
                            ? "text-yellow-400"
                            : "text-slate-400"
                        }`}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

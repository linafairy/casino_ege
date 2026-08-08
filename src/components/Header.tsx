import React from "react";
import { UserStats, CasinoMode } from "../types";
import { getLevelInfo } from "../data/literacyLevels";
import { casinoAudio } from "../utils/soundEffects";
import {
  Coins,
  Trophy,
  BookOpen,
  ShoppingBag,
  Volume2,
  VolumeX,
  Flame,
  Gamepad2,
  Sparkles,
  BarChart3,
  Palette,
} from "lucide-react";

interface HeaderProps {
  stats: UserStats;
  currentMode: CasinoMode;
  onSelectMode: (mode: CasinoMode) => void;
  onOpenTheory: () => void;
  onOpenShop: () => void;
  onOpenStats: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
  onChangeTheme: (theme: UserStats["equippedTheme"]) => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  currentMode,
  onSelectMode,
  onOpenTheory,
  onOpenShop,
  onOpenStats,
  onToggleMute,
  isMuted,
  onChangeTheme,
}) => {
  const { currentLevel, nextLevel, progressPercent } = getLevelInfo(stats.xp);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-amber-500/30 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6">
        {/* Top Row: Brand & Quick Stats & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="text-xl">🎰</span>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent tracking-tight">
                Казино Пунктуации
              </h1>
              <p className="text-[10px] text-amber-200/70 font-medium">
                ЕГЭ по русскому языку • Задания 16–21
              </p>
            </div>
          </div>

          {/* User Currency & XP Level Badge */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {/* Chips Counter */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-950/80 to-slate-900 border border-amber-500/40 rounded-full px-3.5 py-1.5 shadow-inner">
              <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
              <div className="flex flex-col leading-none">
                <span className="text-xs text-amber-300/80 font-medium">Фишки</span>
                <span className="text-base font-extrabold text-amber-300 tracking-wider">
                  {stats.chips.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Streak Counter */}
            {stats.streak > 0 && (
              <div className="flex items-center gap-1.5 bg-rose-950/60 border border-rose-500/40 rounded-full px-3 py-1.5">
                <Flame className="w-4 h-4 text-rose-500 fill-rose-500 animate-bounce" />
                <span className="text-xs font-bold text-rose-200">
                  {stats.streak}x Серия
                </span>
              </div>
            )}

            {/* Level & XP info */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-2xl px-3 py-1.5">
              <span className="text-lg">{currentLevel.badge}</span>
              <div className="flex flex-col">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-bold text-slate-200">{currentLevel.title}</span>
                  <span className="text-[10px] text-amber-400 font-semibold">{stats.xp} XP</span>
                </div>
                {/* XP Bar */}
                <div className="w-32 h-1.5 bg-slate-900 rounded-full overflow-hidden mt-0.5 border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Utility buttons */}
            <div className="flex items-center gap-1">
              {/* Theory Rulebook */}
              <button
                onClick={() => {
                  casinoAudio.playChipSound();
                  onOpenTheory();
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-amber-500/30 transition-all flex items-center gap-1.5 text-xs font-medium"
                title="Справочник правил ЕГЭ"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden md:inline">Правила</span>
              </button>

              {/* VIP Shop */}
              <button
                onClick={() => {
                  casinoAudio.playChipSound();
                  onOpenShop();
                }}
                className="p-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold border border-yellow-300/50 shadow-md transition-all flex items-center gap-1.5 text-xs"
                title="Магазин Казино"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden md:inline">VIP Магазин</span>
              </button>

              {/* Stats */}
              <button
                onClick={() => {
                  casinoAudio.playChipSound();
                  onOpenStats();
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                title="Статистика и Успеваемость"
              >
                <BarChart3 className="w-4 h-4" />
              </button>

              {/* Mute Audio Toggle */}
              <button
                onClick={onToggleMute}
                className={`p-2 rounded-xl border transition-all ${
                  isMuted
                    ? "bg-rose-950/60 border-rose-500/40 text-rose-400"
                    : "bg-slate-800 border-slate-700 text-emerald-400"
                }`}
                title={isMuted ? "Включить звук" : "Выключить звук"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs for Casino Modes */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              casinoAudio.playCardFlip();
              onSelectMode("slots");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              currentMode === "slots"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
          >
            <span>🎰</span>
            Слот-Машина
          </button>

          <button
            onClick={() => {
              casinoAudio.playCardFlip();
              onSelectMode("roulette");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              currentMode === "roulette"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
          >
            <span>🎡</span>
            Рулетка Знаков
          </button>

          <button
            onClick={() => {
              casinoAudio.playCardFlip();
              onSelectMode("blackjack");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              currentMode === "blackjack"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
          >
            <span>🃏</span>
            Блэкджек 21
          </button>

          <button
            onClick={() => {
              casinoAudio.playCardFlip();
              onSelectMode("practice");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              currentMode === "practice"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
          >
            <span>🎯</span>
            ЕГЭ Тренинг
          </button>
        </div>
      </div>
    </header>
  );
};

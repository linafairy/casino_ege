import React, { useState, useEffect } from "react";
import { UserStats, CasinoMode, TaskType, LiteracyLevel } from "./types";
import { getLevelInfo } from "./data/literacyLevels";
import { Header } from "./components/Header";
import { SlotMachineGame } from "./components/SlotMachineGame";
import { RouletteGame } from "./components/RouletteGame";
import { BlackjackGame } from "./components/BlackjackGame";
import { PracticeGame } from "./components/PracticeGame";
import { TheoryModal } from "./components/TheoryModal";
import { VipShopModal } from "./components/VipShopModal";
import { StatsModal } from "./components/StatsModal";
import { LevelUpModal } from "./components/LevelUpModal";
import { casinoAudio } from "./utils/soundEffects";

const INITIAL_STATS: UserStats = {
  chips: 1000,
  xp: 0,
  streak: 0,
  highestStreak: 0,
  totalGames: 0,
  wins: 0,
  losses: 0,
  totalChipsWon: 0,
  taskStats: {
    "16": { attempted: 0, correct: 0 },
    "17": { attempted: 0, correct: 0 },
    "18": { attempted: 0, correct: 0 },
    "19": { attempted: 0, correct: 0 },
    "20": { attempted: 0, correct: 0 },
    "21": { attempted: 0, correct: 0 },
  },
  equippedTheme: "gold",
  boosters: {
    shield: 2,
    hint: 3,
    doubleXp: 1,
  },
  unlockedTitles: ["🐣 Школьник-Новичок"],
};

export default function App() {
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem("casino_ege_stats_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_STATS,
          ...parsed,
          chips: typeof parsed.chips === "number" ? parsed.chips : INITIAL_STATS.chips,
          xp: typeof parsed.xp === "number" ? parsed.xp : INITIAL_STATS.xp,
          equippedTheme: parsed.equippedTheme || "gold",
          boosters: {
            ...INITIAL_STATS.boosters,
            ...(parsed.boosters || {}),
          },
          taskStats: {
            ...INITIAL_STATS.taskStats,
            ...(parsed.taskStats || {}),
          },
        };
      }
    } catch {
      // Fallback
    }
    return INITIAL_STATS;
  });

  const [currentMode, setCurrentMode] = useState<CasinoMode>("slots");
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Modals visibility
  const [showTheory, setShowTheory] = useState<boolean>(false);
  const [showShop, setShowShop] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [unlockedLevelModal, setUnlockedLevelModal] = useState<LiteracyLevel | null>(null);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem("casino_ege_stats_v1", JSON.stringify(stats));
    } catch {
      // Ignore
    }
  }, [stats]);

  // Audio mute sync
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    casinoAudio.setMuted(nextMuted);
  };

  // Update Stats after a question completion
  const handleUpdateStats = (
    netChips: number,
    xpEarned: number,
    isWin: boolean,
    taskType: TaskType
  ) => {
    setStats((prev) => {
      const oldLevelInfo = getLevelInfo(prev.xp);
      const newXp = prev.xp + xpEarned;
      const newLevelInfo = getLevelInfo(newXp);

      // Trigger level up modal if level increased
      if (newLevelInfo.currentLevel.level > oldLevelInfo.currentLevel.level) {
        setUnlockedLevelModal(newLevelInfo.currentLevel);
      }

      const newChips = Math.max(0, prev.chips + netChips);
      const newStreak = isWin ? prev.streak + 1 : 0;
      const newHighestStreak = Math.max(prev.highestStreak, newStreak);

      const oldTaskStat = prev.taskStats[taskType] || { attempted: 0, correct: 0 };
      const updatedTaskStats = {
        ...prev.taskStats,
        [taskType]: {
          attempted: oldTaskStat.attempted + 1,
          correct: oldTaskStat.correct + (isWin ? 1 : 0),
        },
      };

      return {
        ...prev,
        chips: newChips,
        xp: newXp,
        streak: newStreak,
        highestStreak: newHighestStreak,
        totalGames: prev.totalGames + 1,
        wins: prev.wins + (isWin ? 1 : 0),
        losses: prev.losses + (isWin ? 0 : 1),
        totalChipsWon: prev.totalChipsWon + (netChips > 0 ? netChips : 0),
        taskStats: updatedTaskStats,
      };
    });
  };

  // Handle Booster Consumption
  const handleUseBooster = (type: "shield" | "hint"): boolean => {
    let success = false;
    setStats((prev) => {
      if (prev.boosters[type] > 0) {
        success = true;
        return {
          ...prev,
          boosters: {
            ...prev.boosters,
            [type]: prev.boosters[type] - 1,
          },
        };
      }
      return prev;
    });
    return success;
  };

  // Handle Buying Boosters in VIP Shop
  const handleBuyBooster = (type: "shield" | "hint" | "doubleXp", cost: number) => {
    setStats((prev) => {
      if (prev.chips >= cost) {
        return {
          ...prev,
          chips: prev.chips - cost,
          boosters: {
            ...prev.boosters,
            [type]: prev.boosters[type] + 1,
          },
        };
      }
      return prev;
    });
  };

  // Convert XP to Emergency Chips
  const handleConvertXpToChips = () => {
    setStats((prev) => {
      if (prev.xp >= 100) {
        return {
          ...prev,
          xp: prev.xp - 100,
          chips: prev.chips + 500,
        };
      }
      return prev;
    });
  };

  // Theme background styles
  const themeBackgrounds: Record<UserStats["equippedTheme"], string> = {
    gold: "bg-slate-950 text-slate-100",
    emerald: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950 via-slate-950 to-slate-950 text-emerald-100",
    neon: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950 via-slate-950 to-slate-950 text-purple-100",
    royal: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-950 via-slate-950 to-slate-950 text-rose-100",
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-amber-500 selection:text-slate-950 ${themeBackgrounds[stats.equippedTheme]}`}>
      {/* Top Header */}
      <Header
        stats={stats}
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        onOpenTheory={() => setShowTheory(true)}
        onOpenShop={() => setShowShop(true)}
        onOpenStats={() => setShowStats(true)}
        onToggleMute={handleToggleMute}
        isMuted={isMuted}
        onChangeTheme={(theme) => setStats((p) => ({ ...p, equippedTheme: theme }))}
      />

      {/* Main Game Stage Area */}
      <main className="py-6">
        {currentMode === "slots" && (
          <SlotMachineGame
            stats={stats}
            onUpdateStats={handleUpdateStats}
            onUseBooster={handleUseBooster}
          />
        )}

        {currentMode === "roulette" && (
          <RouletteGame
            stats={stats}
            onUpdateStats={handleUpdateStats}
            onUseBooster={handleUseBooster}
          />
        )}

        {currentMode === "blackjack" && (
          <BlackjackGame
            stats={stats}
            onUpdateStats={handleUpdateStats}
            onUseBooster={handleUseBooster}
          />
        )}

        {currentMode === "practice" && (
          <PracticeGame
            stats={stats}
            onUpdateStats={handleUpdateStats}
            onUseBooster={handleUseBooster}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-slate-500 border-t border-slate-900/80">
        <p>🎰 Казино Пунктуации • Подготовка к ЕГЭ по русскому языку (Задания 16–21)</p>
        <p className="mt-1 text-[11px] text-slate-600">
          Зарабатывайте фишки, изучайте правила и повышайте уровень грамотности на 100 баллов!
        </p>
      </footer>

      {/* Modals */}
      <TheoryModal isOpen={showTheory} onClose={() => setShowTheory(false)} />

      <VipShopModal
        isOpen={showShop}
        onClose={() => setShowShop(false)}
        stats={stats}
        onBuyBooster={handleBuyBooster}
        onChangeTheme={(theme) => setStats((p) => ({ ...p, equippedTheme: theme }))}
        onConvertXpToChips={handleConvertXpToChips}
      />

      <StatsModal isOpen={showStats} onClose={() => setShowStats(false)} stats={stats} />

      <LevelUpModal level={unlockedLevelModal} onClose={() => setUnlockedLevelModal(null)} />
    </div>
  );
}

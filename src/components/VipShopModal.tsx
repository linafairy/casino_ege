import React from "react";
import { UserStats } from "../types";
import { casinoAudio } from "../utils/soundEffects";
import { ShoppingBag, X, Shield, Lightbulb, Zap, Coins, Palette, Check } from "lucide-react";

interface VipShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  onBuyBooster: (type: "shield" | "hint" | "doubleXp", cost: number) => void;
  onChangeTheme: (theme: UserStats["equippedTheme"]) => void;
  onConvertXpToChips: () => void;
}

export const VipShopModal: React.FC<VipShopModalProps> = ({
  isOpen,
  onClose,
  stats,
  onBuyBooster,
  onChangeTheme,
  onConvertXpToChips,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-amber-200">VIP Магазин Казино</h3>
              <p className="text-xs text-slate-400">Усилители, темы столов и обмен баллов</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-amber-300">
              <Coins className="w-3.5 h-3.5" />
              {stats.chips} Фишек
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Emergency Chip Refill using XP */}
          <div className="p-4 bg-gradient-to-r from-amber-950/60 to-slate-950 border border-amber-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-amber-300 flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                Закончились фишки? Обменяйте знания (XP) на Фишки!
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Обменяйте 100 XP опыта на +500 Фишек в любой момент.
              </p>
            </div>
            <button
              onClick={() => {
                casinoAudio.playWinFanfare();
                onConvertXpToChips();
              }}
              disabled={stats.xp < 100}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                stats.xp >= 100
                  ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md"
                  : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
              }`}
            >
              Обменять 100 XP ➔ +500 Фишек
            </button>
          </div>

          {/* Section 1: Boosters */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
              Азартные Усилители (Бустеры):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Booster 1: Shield */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-sm text-slate-200">Страховка Ставки</h5>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Защищает от потери фишек при одной ошибке в ответе.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Есть: {stats.boosters.shield}</span>
                  <button
                    onClick={() => {
                      casinoAudio.playChipSound();
                      onBuyBooster("shield", 150);
                    }}
                    disabled={stats.chips < 150}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 text-xs font-bold rounded-xl transition-all"
                  >
                    150 Фишек
                  </button>
                </div>
              </div>

              {/* Booster 2: Hint */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center mb-2">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-sm text-slate-200">Подсказка Филолога</h5>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Указывает гарантированную позицию запятой или дает подсказку.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Есть: {stats.boosters.hint}</span>
                  <button
                    onClick={() => {
                      casinoAudio.playChipSound();
                      onBuyBooster("hint", 100);
                    }}
                    disabled={stats.chips < 100}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 text-xs font-bold rounded-xl transition-all"
                  >
                    100 Фишек
                  </button>
                </div>
              </div>

              {/* Booster 3: Double XP */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-sm text-slate-200">Удвоитель XP x2</h5>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Удваивает получаемый опыт грамотности за следующие вопросы.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Есть: {stats.boosters.doubleXp}</span>
                  <button
                    onClick={() => {
                      casinoAudio.playChipSound();
                      onBuyBooster("doubleXp", 200);
                    }}
                    disabled={stats.chips < 200}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 text-xs font-bold rounded-xl transition-all"
                  >
                    200 Фишек
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Themes */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" /> Темы Оформления Казино:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: "gold", name: "Золотая Роскошь", color: "from-amber-500 to-yellow-600" },
                { id: "emerald", name: "Королевский Изумруд", color: "from-emerald-600 to-teal-800" },
                { id: "neon", name: "Кибернетический Неон", color: "from-purple-600 to-pink-600" },
                { id: "royal", name: "Бархатный Рубин", color: "from-rose-700 to-red-900" },
              ].map((theme) => {
                const isSelected = stats.equippedTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      casinoAudio.playChipSound();
                      onChangeTheme(theme.id as any);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between h-28 relative overflow-hidden ${
                      isSelected
                        ? "border-amber-400 bg-slate-900 ring-2 ring-amber-400/50 scale-105"
                        : "border-slate-800 bg-slate-950 hover:bg-slate-900"
                    }`}
                  >
                    <div className={`w-full h-8 rounded-xl bg-gradient-to-r ${theme.color}`} />
                    <div className="font-bold text-xs text-slate-200 mt-2">{theme.name}</div>
                    {isSelected && (
                      <span className="absolute top-2 right-2 p-1 rounded-full bg-amber-400 text-slate-950">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

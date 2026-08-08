import React, { useEffect } from "react";
import { LiteracyLevel } from "../types";
import { casinoAudio } from "../utils/soundEffects";
import confetti from "canvas-confetti";
import { Sparkles, Trophy, ArrowRight, Award } from "lucide-react";

interface LevelUpModalProps {
  level: LiteracyLevel | null;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ level, onClose }) => {
  useEffect(() => {
    if (level) {
      casinoAudio.playJackpotSound();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#f59e0b", "#eab308", "#10b981", "#8b5cf6"],
      });
    }
  }, [level]);

  if (!level) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 border-amber-500 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center text-white shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-1 mx-auto mb-4 shadow-xl shadow-amber-500/30 animate-bounce">
          <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-4xl">
            {level.badge}
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> НОВЫЙ УРОВЕНЬ ГРАМОТНОСТИ!
        </div>

        <h3 className="text-2xl font-black text-amber-200 tracking-tight mb-1">
          {level.title}
        </h3>

        <p className="text-xs text-slate-300 mb-6">
          Поздравляем! Ваш филологический статус в казино повысился.
        </p>

        <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 text-left mb-6 space-y-2">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <Award className="w-4 h-4" /> Ваша новая привилегия:
          </div>
          <p className="text-sm font-semibold text-slate-100">{level.perk}</p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          ПРИНЯТЬ НАГРАДУ И ПРОДОЛЖИТЬ
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

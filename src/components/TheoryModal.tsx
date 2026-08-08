import React, { useState } from "react";
import { THEORY_RULES } from "../data/theoryRules";
import { TaskType } from "../types";
import { BookOpen, X, AlertTriangle, Lightbulb, Search } from "lucide-react";

interface TheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TheoryModal: React.FC<TheoryModalProps> = ({ isOpen, onClose }) => {
  const [activeTask, setActiveTask] = useState<TaskType>("16");
  const [searchQuery, setSearchQuery] = useState<string>("");

  if (!isOpen) return null;

  const currentRule = THEORY_RULES.find((r) => r.taskNumber === activeTask) || THEORY_RULES[0];

  const filteredRules = THEORY_RULES.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.shortSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.traps.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-amber-200">
                Справочник правил и ловушек ЕГЭ (16–21)
              </h3>
              <p className="text-xs text-slate-400">Филологическая шпаргалка для игроков казино</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Task Selector Tabs */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
            {THEORY_RULES.map((r) => (
              <button
                key={r.taskNumber}
                onClick={() => setActiveTask(r.taskNumber)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
                  activeTask === r.taskNumber
                    ? "bg-amber-500 text-slate-950 border-amber-300 shadow-md scale-105"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                }`}
              >
                №{r.taskNumber}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по правилам..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Rule Details Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Rule Title & Summary */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-amber-500/30">
            <h4 className="text-xl font-bold text-amber-300 mb-2">{currentRule.title}</h4>
            <p className="text-sm text-slate-200 leading-relaxed">{currentRule.shortSummary}</p>
          </div>

          {/* Key Grammar Points */}
          <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" /> Главные правила и пунктограммы:
            </h5>
            <ul className="space-y-2">
              {currentRule.keyPoints.map((point, idx) => (
                <li key={idx} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Trap Warnings ("Ловушки ЕГЭ") */}
          <div className="bg-rose-950/40 p-5 rounded-2xl border border-rose-500/40 space-y-3">
            <h5 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
              Опасные "Ловушки" составителей ЕГЭ:
            </h5>
            <ul className="space-y-2">
              {currentRule.traps.map((trap, idx) => (
                <li key={idx} className="text-xs sm:text-sm text-rose-200 font-medium">
                  {trap}
                </li>
              ))}
            </ul>
          </div>

          {/* Example Breakdown */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              Наглядный пример:
            </div>
            <pre className="text-xs sm:text-sm font-serif text-amber-100 whitespace-pre-wrap leading-relaxed">
              {currentRule.example}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

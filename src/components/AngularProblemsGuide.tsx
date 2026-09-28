import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ChevronRight,
  Code2,
  Cpu,
  Layers,
} from 'lucide-react';
import { ANGULAR_PROBLEM_CASES } from '../data/presets';
import { AngularProblemCase } from '../types/form';

export const AngularProblemsGuide: React.FC = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(ANGULAR_PROBLEM_CASES[0].id);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const selectedCase =
    ANGULAR_PROBLEM_CASES.find((c) => c.id === selectedCaseId) || ANGULAR_PROBLEM_CASES[0];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex-1 bg-slate-900/30 overflow-y-auto p-3.5 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-4 sm:space-y-6">
        {/* Header Banner */}
        <div className="p-4 sm:p-6 rounded-xl border border-slate-800 bg-slate-950 shadow-xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40 font-semibold">
              Angular Architecture Deep Dive
            </span>
            <span className="text-xs text-slate-500 font-mono">Angular 17, 18 & 19</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Solving the 5 Classic Angular Form Problems
          </h1>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            Angular developers frequently run into frustrating hurdles with verbose Reactive Forms boilerplate,
            untyped FormArrays, leaky RxJS subscriptions, and lack of schema validation.
            Here is how <strong>NgFormCraft</strong> solves each problem using modern Standalone Components,
            Signals, Zod, and @tanstack/angular-form.
          </p>
        </div>

        {/* Mobile quick dropdown selector */}
        <div className="lg:hidden p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">
            Select Form Problem Scenario:
          </label>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="w-full p-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-rose-500 font-medium"
          >
            {ANGULAR_PROBLEM_CASES.map((item, idx) => (
              <option key={item.id} value={item.id}>
                #{idx + 1}: {item.title}
              </option>
            ))}
          </select>
        </div>

        {/* Two-Column Problem Selector & Solution Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Problem List (Desktop) */}
          <div className="hidden lg:block lg:col-span-4 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
              Select Problem Scenario
            </div>
            <div className="space-y-1.5">
              {ANGULAR_PROBLEM_CASES.map((item, idx) => {
                const isSelected = item.id === selectedCaseId;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedCaseId(item.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-rose-500 text-white shadow-md ring-1 ring-rose-500/30'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="text-[10px] font-mono text-slate-500 uppercase">
                          Case #{idx + 1}
                        </div>
                        <div className="text-xs font-semibold truncate leading-tight">
                          {item.title}
                        </div>
                        <div className="flex items-center gap-1 flex-wrap pt-1">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-slate-400"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 transition-transform ${
                          isSelected ? 'text-rose-400 translate-x-0.5' : 'text-slate-600'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Solution Detail Panel (Right) */}
          <div className="lg:col-span-8 space-y-5 w-full">
            <div className="p-4 sm:p-6 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 shadow-xl space-y-5">
              {/* Case Title and Pain Point */}
              <div className="border-b border-slate-800 pb-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-950 text-rose-400 text-xs font-bold border border-rose-800/50">
                    !
                  </span>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {selectedCase.title}
                  </h2>
                </div>
                <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 text-xs text-rose-200/90 leading-relaxed">
                  <strong className="text-rose-300 font-semibold block mb-0.5">The Pain Point:</strong>
                  {selectedCase.painPoint}
                </div>
              </div>

              {/* Side-by-side or stacked code comparison */}
              <div className="space-y-4">
                {/* Legacy Problem Code */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-400 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                      <span>The Frustrating Legacy Angular Way:</span>
                    </span>
                    <button
                      onClick={() => handleCopy(selectedCase.angularLegacyWay, 'legacy')}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'legacy' ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                    {selectedCase.angularLegacyWay}
                  </pre>
                </div>

                {/* Modern Solution Code */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>How NgFormCraft Solves It (Modern Angular 19 + Signals + Zod):</span>
                    </span>
                    <button
                      onClick={() => handleCopy(selectedCase.solutionWay, 'solution')}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'solution' ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-lg bg-slate-900 border border-emerald-900/40 text-[11px] font-mono text-emerald-300 overflow-x-auto ring-1 ring-emerald-500/20">
                    {selectedCase.solutionWay}
                  </pre>
                </div>
              </div>

              {/* Architectural Explanation */}
              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-rose-400" />
                  <span>Why this architecture works better:</span>
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {selectedCase.explanation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  Scale,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { ANGULAR_PROBLEM_CASES } from '../data/presets';

export const AngularProblemsGuide: React.FC = () => {
  const [activeView, setActiveView] = useState<'decision-matrix' | 'problem-cases'>('decision-matrix');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(ANGULAR_PROBLEM_CASES[0].id);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Interactive Quiz State
  const [useZod, setUseZod] = useState<boolean>(true);
  const [useMaterial, setUseMaterial] = useState<boolean>(false);
  const [multiFramework, setMultiFramework] = useState<boolean>(false);
  const [zeroDeps, setZeroDeps] = useState<boolean>(false);

  // Calculate recommendation score
  let tanstackScore = 0;
  let signalScore = 0;

  if (useZod) tanstackScore += 40;
  else signalScore += 20;

  if (useMaterial) signalScore += 40;
  else tanstackScore += 10;

  if (multiFramework) tanstackScore += 30;
  else signalScore += 15;

  if (zeroDeps) signalScore += 50;

  const winner = tanstackScore > signalScore ? 'tanstack' : 'signals';

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
              Angular Form Architecture Guide
            </span>
            <span className="text-xs text-slate-500 font-mono">TanStack vs Signal Forms</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Which is Best: @tanstack/angular-form or Angular Signal Forms?
          </h1>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            Both are powerful, modern paradigms for Angular 18/19+, but they serve fundamentally different needs.
            Use this interactive decision engine and architectural comparison to pick the best fit for your team.
          </p>

          {/* Segmented View Switcher */}
          <div className="pt-3 flex items-center gap-2">
            <button
              onClick={() => setActiveView('decision-matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeView === 'decision-matrix'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Scale className="h-3.5 w-3.5" />
              <span>TanStack vs Signals Comparison & Quiz</span>
            </button>
            <button
              onClick={() => setActiveView('problem-cases')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeView === 'problem-cases'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>5 Classic Form Problem Deep Dives</span>
            </button>
          </div>
        </div>

        {activeView === 'decision-matrix' && (
          <div className="space-y-6">
            {/* Interactive Decision Quiz */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <span>Interactive Decision Engine: Which Should You Use?</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Toggle your real project requirements below to see an instant architecture recommendation:
                  </p>
                </div>
              </div>

              {/* 4 Key Questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setUseZod(!useZod)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    useZod
                      ? 'border-rose-600 bg-rose-950/20 text-white'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">1. Uses Zod / Valibot Schema Validation</span>
                    <input
                      type="checkbox"
                      checked={useZod}
                      onChange={() => {}}
                      className="rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    You validate API payloads with Zod schemas shared with your backend or tRPC.
                  </p>
                </div>

                <div
                  onClick={() => setUseMaterial(!useMaterial)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    useMaterial
                      ? 'border-rose-600 bg-rose-950/20 text-white'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">2. Uses Angular Material or UI Component Kits</span>
                    <input
                      type="checkbox"
                      checked={useMaterial}
                      onChange={() => {}}
                      className="rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Your UI relies on `ControlValueAccessor` (Angular Material, Taiga UI, PrimeNG).
                  </p>
                </div>

                <div
                  onClick={() => setMultiFramework(!multiFramework)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    multiFramework
                      ? 'border-rose-600 bg-rose-950/20 text-white'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">3. Multi-Framework / Fullstack Team</span>
                    <input
                      type="checkbox"
                      checked={multiFramework}
                      onChange={() => {}}
                      className="rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Your team or micro-frontends also write React, Vue, or Solid and want one standard form API.
                  </p>
                </div>

                <div
                  onClick={() => setZeroDeps(!zeroDeps)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    zeroDeps
                      ? 'border-rose-600 bg-rose-950/20 text-white'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">4. Zero External Dependencies Policy</span>
                    <input
                      type="checkbox"
                      checked={zeroDeps}
                      onChange={() => {}}
                      className="rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Enterprise requirement to strictly use official Angular packages (`@angular/*`) only.
                  </p>
                </div>
              </div>

              {/* Recommendation Banner */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  winner === 'tanstack'
                    ? 'border-cyan-500/40 bg-cyan-950/20 text-cyan-200'
                    : 'border-rose-500/40 bg-rose-950/20 text-rose-200'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 border border-white/10 font-bold block w-fit mb-1">
                    Your Best Choice:
                  </span>
                  <div className="text-base font-bold text-white">
                    {winner === 'tanstack'
                      ? '👉 @tanstack/angular-form (Headless + Zod)'
                      : '👉 Angular Signal Forms (Modern Standalone Reactive Forms + Signals)'}
                  </div>
                  <p className="text-xs opacity-90 mt-0.5">
                    {winner === 'tanstack'
                      ? 'Because schema validation (Zod) and cross-framework consistency are key priorities for your app.'
                      : 'Because first-party Angular ecosystem compatibility (Material/CVA), clean template syntax, and zero 3rd-party risk take precedence.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Comprehensive Feature Comparison Matrix */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 shadow-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-900/60">
                <h3 className="text-sm font-bold text-white">Feature-by-Feature Comparison Matrix</h3>
                <p className="text-xs text-slate-400 mt-0.5">Direct head-to-head comparison of both approaches.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400">
                      <th className="p-3 font-semibold">Evaluation Criteria</th>
                      <th className="p-3 font-semibold text-cyan-300">@tanstack/angular-form</th>
                      <th className="p-3 font-semibold text-rose-300">Angular Signal Forms / Standalone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    <tr>
                      <td className="p-3 font-medium text-white">Validation Engine</td>
                      <td className="p-3 text-cyan-200">
                        <strong className="text-emerald-400">Winner: Native Zod / Valibot.</strong> First-class adapter validates onChange, onBlur, or onSubmit without custom validator boilerplate.
                      </td>
                      <td className="p-3 text-slate-300">
                        Built-in <code className="text-rose-300">Validators</code> (required, min, max). Custom validators or Zod require a manual bridge validator.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-white">UI Component Kits (Material, PrimeNG)</td>
                      <td className="p-3 text-slate-400">
                        Manual binding required. Does not natively plug into Angular's <code className="text-slate-300">ControlValueAccessor</code> without wrapper adapters.
                      </td>
                      <td className="p-3 text-emerald-300">
                        <strong>Winner: 100% Native.</strong> Works immediately with <code className="text-rose-300">[formControl]</code>, Material inputs, datepickers, and select boxes.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-white">Template HTML Syntax</td>
                      <td className="p-3 text-slate-400">
                        More verbose: Requires <code className="text-cyan-300">&lt;ng-container [tanstackField]="form" name="..."&gt; &lt;ng-template let-field&gt;</code>.
                      </td>
                      <td className="p-3 text-emerald-300">
                        <strong>Winner: Clean & Concise.</strong> Standard <code className="text-rose-300">formControlName="email"</code> with modern control flow <code className="text-rose-300">@if</code>.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-white">Cross-Framework Reuse</td>
                      <td className="p-3 text-cyan-300">
                        <strong>Winner: 100% Shared.</strong> Same form logic, validation schema, and state flow runs identically in React, Vue, Solid, and Angular.
                      </td>
                      <td className="p-3 text-slate-400">
                        Strictly Angular-specific. Cannot be used directly in React or Vue micro-frontends.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-white">Async & Debounce Handling</td>
                      <td className="p-3 text-cyan-200">
                        Built-in debounce validation, async state (<code className="text-cyan-300">isValidating</code>, <code className="text-cyan-300">isSubmitting</code>) out of the box.
                      </td>
                      <td className="p-3 text-slate-300">
                        Supported via <code className="text-slate-300">AsyncValidatorFn</code> or RxJS operators, but requires explicit pipeline setup.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-white">Package Dependencies</td>
                      <td className="p-3 text-slate-400">
                        Requires <code className="text-slate-300">@tanstack/angular-form</code> + <code className="text-slate-300">@tanstack/form-core</code>.
                      </td>
                      <td className="p-3 text-emerald-300">
                        <strong>Winner: Zero 3rd-party dependencies.</strong> Included directly in <code className="text-rose-300">@angular/forms</code> and <code className="text-rose-300">@angular/core</code>.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Verdict Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-cyan-900/40 bg-cyan-950/15 space-y-2.5">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Choose @tanstack/angular-form when:</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Your application uses <strong>Zod or Valibot</strong> as the single source of truth for schemas.</li>
                  <li>You want <strong>headless control</strong> over your HTML without Angular's legacy form baggage.</li>
                  <li>Your organization shares code across <strong>React and Angular</strong> apps or monorepos.</li>
                  <li>You need built-in async validation states (<code className="text-cyan-300">isSubmitting</code>, <code className="text-cyan-300">isValidating</code>) without RxJS piping.</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl border border-rose-900/40 bg-rose-950/15 space-y-2.5">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                  <Cpu className="h-4 w-4" />
                  <span>Choose Angular Signal Forms when:</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>You use <strong>Angular Material, PrimeNG</strong>, or custom UI libraries implementing <code className="text-rose-300">ControlValueAccessor</code>.</li>
                  <li>You prefer concise templates (<code className="text-rose-300">formControlName</code>) without <code className="text-slate-400">&lt;ng-template let-field&gt;</code> nesting.</li>
                  <li>You have a <strong>zero 3rd-party dependency policy</strong> in enterprise production.</li>
                  <li>Your team is composed of dedicated Angular engineers who want familiar reactive paradigms.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeView === 'problem-cases' && (
          <div className="space-y-4">
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

                  <div className="space-y-4">
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
        )}
      </div>
    </div>
  );
};

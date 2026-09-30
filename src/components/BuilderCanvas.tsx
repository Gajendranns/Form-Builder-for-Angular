import React, { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Copy,
  Plus,
  Sliders,
  ListPlus,
  Eye,
  Pencil,
  RotateCcw,
  Sparkles,
  Layers,
  Box,
  Palette,
  Check,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import { FormConfig, FormField, FormFieldType, FormEngine, UIFramework } from '../types/form';

export interface FrameworkStyleOption {
  id: UIFramework;
  name: string;
  tagline: string;
  icon: string;
  badgeText: string;
  pillClass: string;
  activePillClass: string;
  accentColor: string;
  containerClass: string;
  fieldCardClass: string;
  inputBaseClass: string;
  labelBaseClass: string;
  submitBtnClass: string;
}

export const UI_FRAMEWORKS: FrameworkStyleOption[] = [
  {
    id: 'tailwind',
    name: 'Tailwind UI',
    tagline: 'Modern Slate & Rose Glass',
    icon: '✨',
    badgeText: 'Tailwind CSS v4',
    pillClass: 'hover:text-rose-300 hover:bg-rose-950/30',
    activePillClass: 'bg-rose-600 text-white font-semibold shadow-sm shadow-rose-950/50',
    accentColor: '#f43f5e',
    containerClass: 'rounded-xl border border-slate-800 bg-slate-950/80 shadow-md',
    fieldCardClass: 'rounded-xl border-slate-800 bg-slate-900/60 hover:border-slate-700',
    inputBaseClass: 'rounded-lg bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30',
    labelBaseClass: 'text-xs font-semibold text-slate-300',
    submitBtnClass: 'rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-sm',
  },
  {
    id: 'material',
    name: 'Material 3',
    tagline: 'Angular Material / Google M3',
    icon: '🎨',
    badgeText: 'Angular Material M3',
    pillClass: 'hover:text-indigo-300 hover:bg-indigo-950/30',
    activePillClass: 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-950/50',
    accentColor: '#6366f1',
    containerClass: 'rounded-2xl border border-indigo-900/40 bg-[#0c0e18] shadow-2xl shadow-indigo-950/30 ring-1 ring-indigo-500/10',
    fieldCardClass: 'rounded-xl border-indigo-900/40 bg-[#121526]/80 hover:border-indigo-700/60',
    inputBaseClass: 'rounded-md bg-[#161a2e] border-indigo-500/40 text-indigo-100 placeholder:text-indigo-300/40 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20',
    labelBaseClass: 'text-[11px] font-semibold tracking-wider uppercase text-indigo-300',
    submitBtnClass: 'rounded-full uppercase tracking-wider text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50',
  },
  {
    id: 'shadcn',
    name: 'shadcn / Spartan',
    tagline: 'Minimalist Zinc & Sharp Mono',
    icon: '⚡',
    badgeText: 'Spartan UI (Angular)',
    pillClass: 'hover:text-zinc-100 hover:bg-zinc-800',
    activePillClass: 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm',
    accentColor: '#f4f4f5',
    containerClass: 'rounded-lg border border-zinc-800 bg-zinc-950 shadow-sm',
    fieldCardClass: 'rounded-lg border-zinc-800 bg-zinc-900/70 hover:border-zinc-700',
    inputBaseClass: 'rounded-md bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400',
    labelBaseClass: 'text-xs font-medium text-zinc-200',
    submitBtnClass: 'rounded-md bg-zinc-100 hover:bg-white text-zinc-900 font-semibold text-xs shadow-sm',
  },
  {
    id: 'primeng',
    name: 'PrimeNG Aura',
    tagline: 'Enterprise Cyan & Structured',
    icon: '🔷',
    badgeText: 'PrimeNG Aura Theme',
    pillClass: 'hover:text-cyan-300 hover:bg-cyan-950/30',
    activePillClass: 'bg-cyan-600 text-white font-semibold shadow-md shadow-cyan-950/50',
    accentColor: '#06b6d4',
    containerClass: 'rounded-xl border border-cyan-900/40 bg-[#0a1322] shadow-xl shadow-cyan-950/20',
    fieldCardClass: 'rounded-xl border-cyan-900/40 bg-[#0e1d33]/80 hover:border-cyan-700/60',
    inputBaseClass: 'rounded-lg bg-[#0e1c31] border-cyan-800/60 text-cyan-50 placeholder:text-cyan-400/40 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20',
    labelBaseClass: 'text-xs font-medium text-cyan-200',
    submitBtnClass: 'rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-950/40',
  },
];

interface BuilderCanvasProps {
  formConfig: FormConfig;
  selectedFieldId: string | null;
  onSelectField: (field: FormField) => void;
  onMoveField: (fieldId: string, direction: 'up' | 'down') => void;
  onDeleteField: (fieldId: string) => void;
  onDuplicateField: (field: FormField) => void;
  onAddFieldToCurrentStep: (type: FormFieldType) => void;
  activeStepIndex: number;
  setActiveStepIndex: (index: number) => void;
  onAddStep: () => void;
  onDeleteStep: (stepIndex: number) => void;
  onSelectFormLevel: () => void;
  onUpdateFormConfig?: (updates: Partial<FormConfig>) => void;
  onOpenMobileCatalog?: () => void;
  onOpenMobileInspector?: () => void;
}

/**
 * Validates a field against its validation rules for the Live Test simulation
 */
function validateTestField(
  field: FormField,
  value: any,
  allValues: Record<string, any>
): string | null {
  // Conditional visibility check: if conditional rule says hidden, ignore validation
  if (field.conditional?.enabled) {
    const depVal = allValues[field.conditional.fieldId];
    if (field.conditional.operator === 'isTruthy' && !depVal) return null;
    if (field.conditional.operator === 'equals' && String(depVal) !== String(field.conditional.value)) return null;
    if (field.conditional.operator === 'notEquals' && String(depVal) === String(field.conditional.value)) return null;
    if (field.conditional.operator === 'contains' && !String(depVal || '').includes(String(field.conditional.value))) return null;
  }

  const rules = field.validation;
  if (!rules) return null;

  // Required Check
  if (rules.required) {
    if (field.type === 'checkbox' || field.type === 'switch') {
      if (!value) {
        return rules.requiredMessage || `${field.label} must be checked`;
      }
    } else if (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '')
    ) {
      return rules.requiredMessage || `${field.label} is required`;
    }
  }

  // If empty and not required, skip value format checks
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  // Email Validator
  if (rules.emailValidator || field.type === 'email') {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(String(value))) {
      return 'Please enter a valid email address';
    }
  }

  // Min Length
  if (rules.minLength !== undefined && String(value).length < rules.minLength) {
    return `Must be at least ${rules.minLength} characters (currently ${String(value).length})`;
  }

  // Max Length
  if (rules.maxLength !== undefined && String(value).length > rules.maxLength) {
    return `Must not exceed ${rules.maxLength} characters (currently ${String(value).length})`;
  }

  // Min Numeric Value
  if (rules.min !== undefined && (field.type === 'number' || field.type === 'slider')) {
    if (Number(value) < rules.min) {
      return `Minimum allowed value is ${rules.min}`;
    }
  }

  // Max Numeric Value
  if (rules.max !== undefined && (field.type === 'number' || field.type === 'slider')) {
    if (Number(value) > rules.max) {
      return `Maximum allowed value is ${rules.max}`;
    }
  }

  // Pattern Validator
  if (rules.pattern) {
    try {
      const reg = new RegExp(rules.pattern);
      if (!reg.test(String(value))) {
        return rules.patternMessage || 'Field format requirement not met';
      }
    } catch {
      // Regex parse error fallback
    }
  }

  // Cross-Field Password Confirmation
  if (rules.passwordConfirmFieldId) {
    const targetVal = allValues[rules.passwordConfirmFieldId];
    if (targetVal !== undefined && targetVal !== value) {
      return 'Passwords do not match';
    }
  }

  return null;
}

export const BuilderCanvas: React.FC<BuilderCanvasProps> = ({
  formConfig,
  selectedFieldId,
  onSelectField,
  onMoveField,
  onDeleteField,
  onDuplicateField,
  onAddFieldToCurrentStep,
  activeStepIndex,
  setActiveStepIndex,
  onAddStep,
  onDeleteStep,
  onSelectFormLevel,
  onUpdateFormConfig,
  onOpenMobileCatalog,
  onOpenMobileInspector,
}) => {
  const [selectedFramework, setSelectedFramework] = useState<UIFramework>(
    formConfig.uiFramework || 'tailwind'
  );
  const [previewMode, setPreviewMode] = useState<'edit' | 'interactive'>('edit');
  
  // Interactive Live Test state with active validation tracking
  const [testFormData, setTestFormData] = useState<Record<string, any>>({});
  const [testTouched, setTestTouched] = useState<Record<string, boolean>>({});
  const [testErrors, setTestErrors] = useState<Record<string, string>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testSubmitAttempted, setTestSubmitAttempted] = useState(false);
  const [showFrameworkInfo, setShowFrameworkInfo] = useState(false);

  const currentTheme =
    UI_FRAMEWORKS.find((f) => f.id === selectedFramework) || UI_FRAMEWORKS[0];

  const isMultiStep = formConfig.layoutType === 'multi-step';
  const steps = isMultiStep ? formConfig.fields.filter((f) => f.type === 'step') : [];
  const currentStep = steps[activeStepIndex] || steps[0];
  const activeFields = isMultiStep ? currentStep?.children || [] : formConfig.fields;

  // Handle framework switch
  const handleSwitchFramework = (frameworkId: UIFramework) => {
    setSelectedFramework(frameworkId);
    if (onUpdateFormConfig) {
      onUpdateFormConfig({ uiFramework: frameworkId });
    }
  };

  // Handle engine switch
  const handleSwitchEngine = (engine: FormEngine) => {
    if (onUpdateFormConfig) {
      onUpdateFormConfig({ frameworkTarget: engine });
    }
  };

  // Handle interactive test changes with immediate re-validation
  const handleTestFieldChange = (name: string, value: any, fieldObj?: FormField) => {
    const nextData = { ...testFormData, [name]: value };
    setTestFormData(nextData);
    setTestSubmitted(false);

    // If the field was already touched or a submit was attempted, re-validate in real-time
    if (fieldObj && (testTouched[name] || testSubmitAttempted)) {
      const err = validateTestField(fieldObj, value, nextData);
      setTestErrors((prev) => {
        const next = { ...prev };
        if (err) {
          next[name] = err;
        } else {
          delete next[name];
        }
        return next;
      });
    }
  };

  // Handle interactive field blur
  const handleTestFieldBlur = (fieldObj: FormField) => {
    setTestTouched((prev) => ({ ...prev, [fieldObj.name]: true }));
    const err = validateTestField(fieldObj, testFormData[fieldObj.name], testFormData);
    setTestErrors((prev) => {
      const next = { ...prev };
      if (err) {
        next[fieldObj.name] = err;
      } else {
        delete next[fieldObj.name];
      }
      return next;
    });
  };

  // Handle form submission in Live Test mode with strict validation checks
  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTestSubmitAttempted(true);

    const newTouched: Record<string, boolean> = {};
    const newErrors: Record<string, string> = {};
    let hasError = false;

    // Validate every active field on the current step/page
    for (const field of activeFields) {
      newTouched[field.name] = true;
      const err = validateTestField(field, testFormData[field.name], testFormData);
      if (err) {
        newErrors[field.name] = err;
        hasError = true;
      }
    }

    setTestTouched(newTouched);
    setTestErrors(newErrors);

    if (hasError) {
      setTestSubmitted(false);
      return; // DO NOT SUBMIT: validation errors exist!
    }

    // All fields are valid!
    setTestSubmitted(true);
  };

  const handleResetTestForm = () => {
    setTestFormData({});
    setTestTouched({});
    setTestErrors({});
    setTestSubmitted(false);
    setTestSubmitAttempted(false);
  };

  return (
    <div className="flex-1 bg-slate-900/30 overflow-y-auto p-3.5 sm:p-6 lg:p-8 flex flex-col items-center relative">
      {/* Floating Preview & UI Framework Switcher Bar */}
      <div className="sticky top-1 sm:top-2 z-30 w-full flex flex-col items-center mb-4 px-1 max-w-4xl">
        <div className="w-full flex flex-wrap items-center justify-between gap-2.5 p-2 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-slate-700/70 shadow-2xl shadow-black/80 ring-1 ring-white/10 transition-all">
          {/* UI Framework Real-Time Switcher */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 pl-1.5 hidden md:inline">
              UI Framework:
            </span>
            <div className="flex items-center bg-slate-900/95 rounded-full p-0.5 border border-slate-800/90">
              {UI_FRAMEWORKS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSwitchFramework(opt.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedFramework === opt.id
                      ? `${opt.activePillClass} shadow-sm`
                      : `text-slate-400 ${opt.pillClass}`
                  }`}
                  title={`${opt.name}: ${opt.tagline}`}
                >
                  <span className="text-[11px]">{opt.icon}</span>
                  <span className="font-sans">{opt.name}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowFrameworkInfo(!showFrameworkInfo)}
              className="p-1 text-slate-400 hover:text-slate-200 rounded-full hover:bg-slate-800 transition-colors"
              title="Show UI Framework details"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Right Group: Architecture Engine + Mode Toggle */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Form Engine Quick Switch */}
            <div className="flex items-center bg-slate-900/95 rounded-full p-0.5 border border-slate-800 hidden sm:flex">
              {[
                { id: 'angular-signal-form' as FormEngine, label: 'Signals', icon: '⚡' },
                { id: 'angular-reactive-signals' as FormEngine, label: 'Reactive', icon: '🛡️' },
                { id: 'tanstack-angular-form' as FormEngine, label: 'TanStack', icon: '🎯' },
              ].map((eng) => (
                <button
                  key={eng.id}
                  type="button"
                  onClick={() => handleSwitchEngine(eng.id)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                    formConfig.frameworkTarget === eng.id
                      ? 'bg-rose-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={`Switch code generation to ${eng.label}`}
                >
                  <span className="text-[10px]">{eng.icon}</span>
                  <span>{eng.label}</span>
                </button>
              ))}
            </div>

            {/* Mode Switcher: Edit Canvas vs Live Interactive Simulation */}
            <div className="flex items-center bg-slate-900/95 rounded-full p-0.5 border border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewMode('edit')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors ${
                  previewMode === 'edit'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Edit form structure, move, duplicate, or inspect fields"
              >
                <Pencil className="h-3 w-3" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('interactive')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors ${
                  previewMode === 'interactive'
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Test typing and interacting with form controls live with active validation"
              >
                <Eye className="h-3 w-3" />
                <span className="hidden sm:inline">Live Test</span>
              </button>
            </div>
          </div>
        </div>

        {/* Framework Info Dropdown Drawer (if toggled) */}
        {showFrameworkInfo && (
          <div className="mt-2 w-full p-3 rounded-xl bg-slate-950/95 border border-slate-800 text-xs text-slate-300 shadow-xl space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">{currentTheme.icon}</span>
                <span className="font-semibold text-white">{currentTheme.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 font-mono">
                  {currentTheme.badgeText}
                </span>
              </div>
              <button
                onClick={() => setShowFrameworkInfo(false)}
                className="text-[10px] text-slate-500 hover:text-slate-300"
              >
                Close
              </button>
            </div>
            <p className="text-[11px] text-slate-400">{currentTheme.tagline}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
                <span className="block text-[10px] text-slate-500">Framework Accent</span>
                <span className="font-mono text-xs font-semibold" style={{ color: currentTheme.accentColor }}>
                  {currentTheme.accentColor}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
                <span className="block text-[10px] text-slate-500">Border Radius</span>
                <span className="font-medium text-slate-200">
                  {selectedFramework === 'material' ? 'M3 Pill / Notched' : selectedFramework === 'shadcn' ? 'Sharp rounded-md' : 'rounded-lg'}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
                <span className="block text-[10px] text-slate-500">Form Engine</span>
                <span className="font-medium text-slate-200">
                  {formConfig.frameworkTarget === 'angular-signal-form' ? 'Signal Forms' : formConfig.frameworkTarget === 'tanstack-angular-form' ? 'TanStack Form' : 'Reactive Forms'}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
                <span className="block text-[10px] text-slate-500">Field Controls</span>
                <span className="font-medium text-slate-200">{activeFields.length} controls</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Canvas Frame Container */}
      <div className="w-full max-w-4xl space-y-4 sm:space-y-6">
        {/* Interactive Mode Banner Indicator */}
        {previewMode === 'interactive' && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Live Test Active:</strong> Form controls validate rules (required, minLength, pattern) in real time. Styled in{' '}
                <span className="font-bold underline decoration-emerald-500">{currentTheme.name}</span>.
              </span>
            </div>
            <div className="flex items-center gap-2">
              {(Object.keys(testFormData).length > 0 || testSubmitAttempted) && (
                <button
                  type="button"
                  onClick={handleResetTestForm}
                  className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset Test</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setPreviewMode('edit')}
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 ml-1"
              >
                Exit Test
              </button>
            </div>
          </div>
        )}

        {/* Validation Failure Banner (shown when submit attempted with errors) */}
        {previewMode === 'interactive' && testSubmitAttempted && Object.keys(testErrors).length > 0 && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500 text-rose-100 text-xs flex items-start gap-3 animate-in fade-in duration-200 shadow-lg">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <div className="font-semibold text-rose-200 flex items-center justify-between">
                <span>
                  Validation Failed: Cannot submit because {Object.keys(testErrors).length} required field
                  {Object.keys(testErrors).length > 1 ? 's have' : ' has'} errors.
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-900/90 text-rose-300 border border-rose-700">
                  INVALID
                </span>
              </div>
              <div className="text-[11px] text-rose-300 flex flex-wrap gap-x-3 gap-y-1">
                {Object.entries(testErrors).map(([fname, msg]) => (
                  <span key={fname} className="flex items-center gap-1 bg-rose-900/40 px-2 py-0.5 rounded border border-rose-800/40">
                    <span className="font-mono text-rose-300 font-semibold">• {fname}:</span>
                    <span>{msg}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Validation Success Banner */}
        {previewMode === 'interactive' && testSubmitted && Object.keys(testErrors).length === 0 && (
          <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500 text-emerald-100 text-xs flex items-center justify-between animate-in fade-in duration-200 shadow-lg">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Validation Passed!</strong> All {activeFields.length} controls validated successfully in {currentTheme.name}. Form submission simulated.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900 border border-emerald-600 text-emerald-200">
                STATUS: VALID
              </span>
              <button
                type="button"
                onClick={handleResetTestForm}
                className="text-[11px] text-emerald-300 hover:text-white underline ml-2"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Mobile quick action bar: Toggle Catalog & Inspector */}
        <div className="lg:hidden flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={onOpenMobileCatalog}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-800 transition-colors"
          >
            <Plus className="h-3.5 w-3.5 text-rose-400" />
            <span>+ Add Controls</span>
          </button>
          <button
            type="button"
            onClick={onOpenMobileInspector}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-800 transition-colors"
          >
            <Sliders className="h-3.5 w-3.5 text-rose-400" />
            <span>{selectedFieldId ? 'Edit Field' : 'Form Settings'}</span>
          </button>
        </div>

        {/* Canvas Form Header Info Box */}
        <div
          onClick={onSelectFormLevel}
          className={`p-4 sm:p-5 transition-all cursor-pointer ${currentTheme.containerClass} ${
            selectedFieldId === null
              ? 'ring-2 ring-rose-500 shadow-lg'
              : 'hover:border-slate-700'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  {formConfig.layoutType === 'multi-step' ? 'Multi-Step Wizard' : 'Single-Page Form'}
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                  <span>{currentTheme.icon}</span>
                  <span className="font-semibold text-slate-300">{currentTheme.badgeText}</span>
                </span>
                <span
                  className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border font-semibold ${
                    formConfig.frameworkTarget === 'angular-signal-form'
                      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/50'
                      : formConfig.frameworkTarget === 'tanstack-angular-form'
                      ? 'bg-cyan-950/70 text-cyan-300 border-cyan-800/50'
                      : 'bg-rose-950/60 text-rose-300 border-rose-800/40'
                  }`}
                >
                  {formConfig.frameworkTarget === 'angular-signal-form'
                    ? '⚡ Angular 19+ Signal Forms'
                    : formConfig.frameworkTarget === 'tanstack-angular-form'
                    ? '🎯 @tanstack/angular-form'
                    : 'Angular Reactive + Signals'}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">{formConfig.title}</h1>
              <p className="text-xs text-slate-400 max-w-xl">{formConfig.description}</p>
            </div>
            <button
              type="button"
              className="self-start px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-white bg-slate-900 rounded border border-slate-800 hover:border-slate-700 transition-colors shrink-0"
            >
              Form Settings
            </button>
          </div>

          {/* Stepper Tabs if multi-step */}
          {isMultiStep && steps.length > 0 && (
            <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">Step Wizard Sections</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddStep();
                  }}
                  className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-medium"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Step</span>
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {steps.map((step, idx) => (
                  <div
                    key={step.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveStepIndex(idx);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      activeStepIndex === idx
                        ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="h-4 w-4 rounded-full bg-black/30 flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{step.stepTitle || step.label}</span>
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteStep(idx);
                        }}
                        className="ml-1 text-slate-400 hover:text-rose-400"
                        title="Delete step"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Step Header info if multi-step */}
        {isMultiStep && currentStep && (
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-rose-400">
                Step {activeStepIndex + 1} of {steps.length}: {currentStep.stepTitle || currentStep.label}
              </span>
              {currentStep.stepDescription && (
                <p className="text-[11px] text-slate-400">{currentStep.stepDescription}</p>
              )}
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {activeFields.length} controls in this step
            </span>
          </div>
        )}

        {/* Form Fields Canvas Surface */}
        <div className={`p-4 sm:p-6 transition-all ${currentTheme.containerClass}`}>
          {activeFields.length === 0 ? (
            /* Empty State */
            <div className="p-8 sm:p-12 text-center rounded-xl border-2 border-dashed border-slate-800 bg-slate-950/50 space-y-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center text-slate-500">
                <Plus className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-200">No form controls added yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Select controls from the catalog on the left or use the quick buttons below.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => onAddFieldToCurrentStep('text')}
                  className="px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-lg hover:bg-rose-900/50 transition-colors"
                >
                  + Add Text Input
                </button>
                <button
                  type="button"
                  onClick={() => onAddFieldToCurrentStep('select')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  + Add Dropdown
                </button>
              </div>
            </div>
          ) : (
            /* Grid of Form Fields */
            <div className="grid grid-cols-12 gap-3 sm:gap-4">
              {activeFields.map((field, index) => {
                const isSelected = selectedFieldId === field.id;
                const colSpanClass = getColSpanClass(field.colSpan || 12);
                
                // Real-time error state for this field in Live Test
                const fieldError =
                  previewMode === 'interactive' && (testTouched[field.name] || testSubmitAttempted)
                    ? testErrors[field.name]
                    : null;

                return (
                  <div
                    key={field.id}
                    onClick={() => {
                      if (previewMode === 'edit') {
                        onSelectField(field);
                      }
                    }}
                    className={`${colSpanClass} relative group p-3.5 sm:p-4 rounded-xl border transition-all ${
                      fieldError
                        ? 'border-rose-500/80 bg-rose-950/20 ring-1 ring-rose-500/40'
                        : isSelected && previewMode === 'edit'
                        ? 'border-rose-500 bg-slate-950 shadow-md shadow-rose-950/20 ring-1 ring-rose-500/40'
                        : `${currentTheme.fieldCardClass} ${
                            previewMode === 'edit' ? 'cursor-pointer' : ''
                          }`
                    }`}
                  >
                    {/* Top Row: Label, required, badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`${currentTheme.labelBaseClass} transition-colors`}
                          style={field.labelColor ? { color: field.labelColor } : undefined}
                        >
                          {field.label}
                        </span>
                        {field.validation?.required && (
                          <span className="text-rose-400 font-bold text-xs" title="Required field">
                            *
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-500">
                          ({field.name})
                        </span>
                        {(field.labelColor ||
                          field.borderColor ||
                          field.textColor ||
                          field.placeholderColor) && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[9px] font-mono text-slate-400">
                            {field.labelColor && (
                              <span
                                className="h-2 w-2 rounded-full inline-block border border-black/40"
                                style={{ backgroundColor: field.labelColor }}
                                title={`Label color: ${field.labelColor}`}
                              />
                            )}
                            {field.borderColor && (
                              <span
                                className="h-2 w-2 rounded-full inline-block border border-black/40"
                                style={{ backgroundColor: field.borderColor }}
                                title={`Border color: ${field.borderColor}`}
                              />
                            )}
                            {field.textColor && (
                              <span
                                className="h-2 w-2 rounded-full inline-block border border-black/40"
                                style={{ backgroundColor: field.textColor }}
                                title={`Text color: ${field.textColor}`}
                              />
                            )}
                            {field.placeholderColor && (
                              <span
                                className="h-2 w-2 rounded-full inline-block border border-black/40"
                                style={{ backgroundColor: field.placeholderColor }}
                                title={`Placeholder color: ${field.placeholderColor}`}
                              />
                            )}
                          </span>
                        )}
                      </div>

                      {/* Field Actions Toolbar (Visible in Edit mode) */}
                      {previewMode === 'edit' && (
                        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMoveField(field.id, 'up');
                            }}
                            disabled={index === 0}
                            className="p-1.5 sm:p-1 text-slate-400 hover:text-slate-200 disabled:opacity-20 rounded hover:bg-slate-800"
                            title="Move Up"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMoveField(field.id, 'down');
                            }}
                            disabled={index === activeFields.length - 1}
                            className="p-1.5 sm:p-1 text-slate-400 hover:text-slate-200 disabled:opacity-20 rounded hover:bg-slate-800"
                            title="Move Down"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDuplicateField(field);
                            }}
                            className="p-1.5 sm:p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800"
                            title="Duplicate"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteField(field.id);
                            }}
                            className="p-1.5 sm:p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/50"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Field Visual Representation / Interactive Control */}
                    <div>
                      {renderFrameworkField({
                        field,
                        framework: selectedFramework,
                        mode: previewMode,
                        value: testFormData[field.name],
                        onChange: (val) => handleTestFieldChange(field.name, val, field),
                        onBlur: () => handleTestFieldBlur(field),
                        error: fieldError,
                      })}
                    </div>

                    {/* Error message indicator in Interactive Mode */}
                    {fieldError && (
                      <div className="flex items-center justify-between gap-1.5 mt-2 text-rose-400 text-xs font-medium animate-in fade-in duration-150">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                          <span>{fieldError}</span>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-950/90 border border-rose-800/60 text-rose-300 shrink-0">
                          {formConfig.frameworkTarget === 'angular-signal-form'
                            ? '@angular/forms/signals'
                            : formConfig.frameworkTarget === 'tanstack-angular-form'
                            ? 'Zod Schema Error'
                            : 'Validators.error'}
                        </span>
                      </div>
                    )}

                    {/* Metadata Footer: Type, layout span, conditional rule indicator */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                          {field.type}
                        </span>
                        <span>
                          {field.colSpan === 6
                            ? '1/2 Width'
                            : field.colSpan === 4
                            ? '1/3 Width'
                            : field.colSpan === 8
                            ? '2/3 Width'
                            : 'Full Width'}
                        </span>
                      </div>
                      {field.conditional?.enabled && (
                        <span className="text-amber-400/90 text-[10px] font-mono">
                          ⚡ Conditional Logic
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Canvas Bottom Action Bar */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {activeFields.length} {activeFields.length === 1 ? 'control' : 'controls'} configured
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onAddFieldToCurrentStep('text')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Input</span>
              </button>
              <button
                type="button"
                onClick={() => onAddFieldToCurrentStep('formarray')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-lg hover:bg-rose-900/50 transition-colors"
              >
                <ListPlus className="h-3.5 w-3.5" />
                <span>+ Dynamic FormArray</span>
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button Preview in Canvas (styled according to chosen UI framework) */}
        <div
          className={`flex items-center justify-between p-4 transition-all ${currentTheme.containerClass}`}
        >
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Theme active:</span>
            <span className="font-semibold text-slate-200 flex items-center gap-1">
              <span>{currentTheme.icon}</span>
              <span>{currentTheme.name}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {formConfig.showResetButton && (
              <button
                type="button"
                onClick={previewMode === 'interactive' ? handleResetTestForm : undefined}
                className="px-4 py-2 text-xs font-medium text-slate-400 border border-slate-800 rounded-lg bg-slate-900/50 hover:bg-slate-800 transition-colors"
              >
                {formConfig.resetButtonText || 'Reset'}
              </button>
            )}
            <button
              type="button"
              onClick={previewMode === 'interactive' ? handleTestSubmit : undefined}
              className={`px-5 py-2 text-xs font-semibold transition-all ${currentTheme.submitBtnClass}`}
            >
              {formConfig.submitButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function getColSpanClass(span: number): string {
  switch (span) {
    case 6:
      return 'col-span-12 sm:col-span-6';
    case 4:
      return 'col-span-12 sm:col-span-4';
    case 8:
      return 'col-span-12 sm:col-span-8';
    default:
      return 'col-span-12';
  }
}

interface RenderFieldProps {
  field: FormField;
  framework: UIFramework;
  mode: 'edit' | 'interactive';
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  error?: string | null;
}

function renderFrameworkField({
  field,
  framework,
  mode,
  value,
  onChange,
  onBlur,
  error,
}: RenderFieldProps): React.ReactNode {
  const customBorderStyle = field.borderColor && !error ? { borderColor: field.borderColor } : undefined;
  const customColorStyle = field.textColor ? { color: field.textColor } : undefined;
  const customPlaceholderStyle = field.placeholderColor
    ? { '--placeholder-color': field.placeholderColor }
    : undefined;

  const mergedControlStyle: React.CSSProperties = {
    ...customBorderStyle,
    ...customColorStyle,
    ...(customPlaceholderStyle as any),
  };

  // Base styling per framework
  let inputRoundingClass = 'rounded-lg';
  let inputBgBorderClass = 'bg-slate-950 border border-slate-800/80';
  let focusRingClass = 'focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20';

  if (framework === 'material') {
    inputRoundingClass = 'rounded-md';
    inputBgBorderClass = 'bg-[#15192b] border border-indigo-500/40';
    focusRingClass = 'focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20';
  } else if (framework === 'shadcn') {
    inputRoundingClass = 'rounded-md';
    inputBgBorderClass = 'bg-zinc-900 border border-zinc-800';
    focusRingClass = 'focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300';
  } else if (framework === 'primeng') {
    inputRoundingClass = 'rounded-lg';
    inputBgBorderClass = 'bg-[#0d1a2c] border border-cyan-800/60';
    focusRingClass = 'focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20';
  }

  // Error border overrides normal border if error is present
  const errorBorderClass = error
    ? 'border-rose-500 focus:border-rose-400 ring-1 ring-rose-500/30'
    : inputBgBorderClass;

  // --- Interactive mode rendering ---
  if (mode === 'interactive') {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            rows={3}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={field.placeholder || 'Enter text...'}
            style={mergedControlStyle}
            className={`w-full px-3 py-2 text-xs text-slate-100 ${inputRoundingClass} ${errorBorderClass} ${focusRingClass} outline-none transition-colors`}
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            style={mergedControlStyle}
            className={`w-full px-3 py-2 text-xs text-slate-100 ${inputRoundingClass} ${errorBorderClass} ${focusRingClass} outline-none transition-colors`}
          >
            <option value="" disabled>
              {field.placeholder || 'Select option...'}
            </option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              onBlur={onBlur}
              style={customBorderStyle}
              className={`h-4 w-4 rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500 cursor-pointer ${
                error ? 'ring-2 ring-rose-500' : ''
              }`}
            />
            <span
              className={`text-xs select-none cursor-pointer ${
                error ? 'text-rose-300 font-medium' : 'text-slate-300'
              }`}
            >
              {field.placeholder || 'Accept terms / confirm'}
            </span>
          </div>
        );

      case 'switch':
        return (
          <div
            className={`flex items-center justify-between p-2.5 ${inputRoundingClass} ${
              error ? 'border border-rose-500 bg-rose-950/20' : inputBgBorderClass
            }`}
            style={customBorderStyle}
          >
            <span className={`text-xs ${error ? 'text-rose-300 font-medium' : 'text-slate-300'}`}>
              Toggle active state
            </span>
            <button
              type="button"
              onClick={() => onChange(!value)}
              onBlur={onBlur}
              className={`h-5 w-9 rounded-full p-0.5 transition-colors flex items-center ${
                value
                  ? framework === 'material'
                    ? 'bg-indigo-600 justify-end'
                    : framework === 'primeng'
                    ? 'bg-cyan-600 justify-end'
                    : framework === 'shadcn'
                    ? 'bg-zinc-200 justify-end'
                    : 'bg-rose-600 justify-end'
                  : 'bg-slate-800 justify-start'
              } ${error ? 'ring-2 ring-rose-500' : ''}`}
            >
              <div
                className={`h-4 w-4 rounded-full shadow-sm ${
                  value && framework === 'shadcn' ? 'bg-zinc-950' : 'bg-white'
                }`}
              />
            </button>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-1.5 py-1">
            {(field.options || [{ label: 'Option 1', value: '1' }, { label: 'Option 2', value: '2' }]).map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name={field.name}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={() => onChange(opt.value)}
                  onBlur={onBlur}
                  style={customBorderStyle}
                  className="text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'slider': {
        const min = field.validation?.min ?? 0;
        const max = field.validation?.max ?? 100;
        const val = value !== undefined ? value : min;
        return (
          <div className="space-y-1.5 py-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Current value:</span>
              <span className="font-mono font-semibold text-rose-400">{val}</span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              value={val}
              onChange={(e) => onChange(Number(e.target.value))}
              onBlur={onBlur}
              style={field.borderColor ? { accentColor: field.borderColor } : undefined}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>
        );
      }

      default:
        return (
          <input
            type={
              field.type === 'datepicker'
                ? 'date'
                : field.type === 'number'
                ? 'number'
                : field.type === 'password'
                ? 'password'
                : 'text'
            }
            value={value !== undefined ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
            style={mergedControlStyle}
            className={`w-full px-3 py-2 text-xs text-slate-100 ${inputRoundingClass} ${errorBorderClass} ${focusRingClass} outline-none transition-colors`}
          />
        );
    }
  }

  // --- Edit Mode Skeleton Preview ---
  switch (field.type) {
    case 'textarea':
      return (
        <div
          className={`w-full h-14 ${inputRoundingClass} ${inputBgBorderClass} px-2.5 py-1.5 text-[11px] transition-colors`}
          style={{
            borderColor: field.borderColor,
            color: field.placeholderColor || '#64748b',
          }}
        >
          {field.placeholder || 'Textarea placeholder...'}
        </div>
      );

    case 'select':
      return (
        <div
          className={`w-full h-8 ${inputRoundingClass} ${inputBgBorderClass} px-2.5 flex items-center justify-between text-[11px] transition-colors`}
          style={{
            borderColor: field.borderColor,
            color: field.textColor || field.placeholderColor || '#94a3b8',
          }}
        >
          <span>{field.placeholder || 'Select option...'}</span>
          <span className="text-slate-600">▾</span>
        </div>
      );

    case 'checkbox':
      return (
        <div className="flex items-center gap-2 pt-1">
          <div
            className={`h-4 w-4 ${framework === 'material' ? 'rounded-sm' : 'rounded'} border border-slate-700 bg-slate-950`}
            style={customBorderStyle}
          />
          <span className="text-[11px] text-slate-400">Acceptance checkbox</span>
        </div>
      );

    case 'switch':
      return (
        <div
          className={`flex items-center justify-between p-2 ${inputRoundingClass} ${inputBgBorderClass}`}
          style={customBorderStyle}
        >
          <span className="text-[11px] text-slate-400">Toggle active state</span>
          <div
            className={`h-4 w-7 rounded-full p-0.5 flex justify-end ${
              framework === 'material'
                ? 'bg-indigo-600/80'
                : framework === 'primeng'
                ? 'bg-cyan-600/80'
                : framework === 'shadcn'
                ? 'bg-zinc-300'
                : 'bg-rose-600/70'
            }`}
          >
            <div
              className={`h-3 w-3 rounded-full ${
                framework === 'shadcn' ? 'bg-zinc-950' : 'bg-white'
              }`}
            />
          </div>
        </div>
      );

    case 'radio':
      return (
        <div className="space-y-1.5 py-1">
          {(field.options?.slice(0, 3) || [{ label: 'Option 1' }, { label: 'Option 2' }]).map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full border border-slate-700 bg-slate-950"
                style={customBorderStyle}
              />
              <span className="text-[11px] text-slate-400">{opt.label}</span>
            </div>
          ))}
        </div>
      );

    case 'slider':
      return (
        <div className="space-y-1 py-1">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`w-1/2 h-full ${
                framework === 'material'
                  ? 'bg-indigo-500'
                  : framework === 'primeng'
                  ? 'bg-cyan-500'
                  : framework === 'shadcn'
                  ? 'bg-zinc-300'
                  : 'bg-rose-500'
              }`}
              style={field.borderColor ? { backgroundColor: field.borderColor } : undefined}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>{field.validation?.min ?? 0}</span>
            <span>{field.validation?.max ?? 100}</span>
          </div>
        </div>
      );

    case 'rating':
      return (
        <div className="flex items-center gap-1 text-amber-400 text-xs py-1">
          <span>★</span>
          <span>★</span>
          <span>★</span>
          <span>★</span>
          <span className="text-slate-700">★</span>
        </div>
      );

    case 'formarray':
      return (
        <div
          className={`p-3 ${inputRoundingClass} border border-rose-800/40 bg-rose-950/15 space-y-2`}
          style={customBorderStyle}
        >
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-rose-300">
              Repeating Rows: {field.arrayConfig?.itemLabel || 'Item'}
            </span>
            <span className="text-[10px] font-mono text-rose-400">
              Min: {field.arrayConfig?.minItems ?? 1} · Max: {field.arrayConfig?.maxItems ?? 10}
            </span>
          </div>
          <div className="grid grid-cols-12 gap-2 p-2 rounded bg-slate-950 border border-slate-800/80">
            {field.children?.map((c) => (
              <div
                key={c.id}
                className="col-span-4 h-6 rounded bg-slate-900 border border-slate-800 flex items-center px-2 text-[10px] text-slate-400"
              >
                {c.label}
              </div>
            )) || <span className="text-[10px] text-slate-500">Add sub-fields to this array</span>}
          </div>
        </div>
      );

    default:
      return (
        <div
          className={`w-full h-8 ${inputRoundingClass} ${inputBgBorderClass} px-2.5 flex items-center text-[11px] transition-colors`}
          style={{
            borderColor: field.borderColor,
            color: field.placeholderColor || '#64748b',
          }}
        >
          {field.placeholder || `Enter ${field.label.toLowerCase()}...`}
        </div>
      );
  }
}

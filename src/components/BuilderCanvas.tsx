import React from 'react';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Copy,
  Plus,
  Footprints,
  Sliders,
  ListPlus,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { FormConfig, FormField, FormFieldType } from '../types/form';

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
  onOpenMobileCatalog?: () => void;
  onOpenMobileInspector?: () => void;
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
  onOpenMobileCatalog,
  onOpenMobileInspector,
}) => {
  const isMultiStep = formConfig.layoutType === 'multi-step';
  const steps = isMultiStep ? formConfig.fields.filter((f) => f.type === 'step') : [];
  const currentStep = steps[activeStepIndex] || steps[0];
  const activeFields = isMultiStep ? (currentStep?.children || []) : formConfig.fields;

  return (
    <div className="flex-1 bg-slate-900/30 overflow-y-auto p-3.5 sm:p-6 lg:p-8 flex flex-col items-center">
      {/* Canvas Frame Container */}
      <div className="w-full max-w-4xl space-y-4 sm:space-y-6">
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
          className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer ${
            selectedFieldId === null
              ? 'border-rose-500 bg-slate-950 shadow-md shadow-rose-950/20 ring-1 ring-rose-500/30'
              : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  {formConfig.layoutType === 'multi-step' ? 'Multi-Step Wizard' : 'Single-Page Form'}
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40">
                  Angular Standalone
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
                    <span className="font-mono text-[11px] tabular-nums">{idx + 1}.</span>
                    <span>{step.stepTitle || `Step ${idx + 1}`}</span>
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteStep(idx);
                        }}
                        className="hover:text-rose-200 p-0.5 ml-1"
                        title="Delete Step"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form Fields Canvas Area */}
        <div className="p-4 sm:p-6 rounded-xl border border-slate-800 bg-slate-950/60 shadow-xl space-y-4 min-h-[340px]">
          {activeFields.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="inline-flex p-3 rounded-full bg-slate-900 text-slate-500 border border-slate-800">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-300">No Fields in this Section</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Choose a control from the left palette or click below to start constructing your Angular form.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => onAddFieldToCurrentStep('text')}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-500 transition-colors"
                >
                  + Add Text Input
                </button>
                <button
                  onClick={() => onAddFieldToCurrentStep('select')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  + Add Select Dropdown
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-3.5">
              {activeFields.map((field, index) => {
                const isSelected = selectedFieldId === field.id;
                const colSpanClass = getColSpanClass(field.colSpan || 12);

                return (
                  <div
                    key={field.id}
                    onClick={() => onSelectField(field)}
                    className={`${colSpanClass} group relative p-3.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-rose-500 bg-slate-900/90 shadow-md ring-1 ring-rose-500/40'
                        : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
                    }`}
                  >
                    {/* Top Row: Label, required, badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                          {field.label}
                        </span>
                        {field.validation?.required && (
                          <span className="text-rose-400 font-bold text-xs" title="Required field">*</span>
                        )}
                        <span className="text-[10px] font-mono text-slate-500">
                          ({field.name})
                        </span>
                      </div>

                      {/* Field Actions Toolbar (Visible on touch & hover) */}
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
                    </div>

                    {/* Field Visual Representation Preview */}
                    <div className="pointer-events-none opacity-85">
                      {renderFieldSkeleton(field)}
                    </div>

                    {/* Metadata Footer: Type, layout span, conditional rule indicator */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                          {field.type}
                        </span>
                        <span>{field.colSpan === 6 ? '1/2 Width' : field.colSpan === 4 ? '1/3 Width' : field.colSpan === 8 ? '2/3 Width' : 'Full Width'}</span>
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
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
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

        {/* Submit Button Preview in Canvas */}
        <div className="flex items-center justify-end gap-3 p-4 rounded-xl border border-slate-800 bg-slate-950/40">
          {formConfig.showResetButton && (
            <div className="px-4 py-2 text-xs font-medium text-slate-400 border border-slate-800 rounded-lg bg-slate-900/50">
              {formConfig.resetButtonText || 'Reset'}
            </div>
          )}
          <div className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg shadow-sm">
            {formConfig.submitButtonText}
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

function renderFieldSkeleton(field: FormField): React.ReactNode {
  switch (field.type) {
    case 'textarea':
      return (
        <div className="w-full h-14 rounded bg-slate-950 border border-slate-800/80 px-2.5 py-1.5 text-[11px] text-slate-500">
          {field.placeholder || 'Textarea placeholder...'}
        </div>
      );

    case 'select':
      return (
        <div className="w-full h-8 rounded bg-slate-950 border border-slate-800/80 px-2.5 flex items-center justify-between text-[11px] text-slate-400">
          <span>{field.placeholder || 'Select option...'}</span>
          <span className="text-slate-600">▾</span>
        </div>
      );

    case 'checkbox':
      return (
        <div className="flex items-center gap-2 pt-1">
          <div className="h-4 w-4 rounded border border-slate-700 bg-slate-950" />
          <span className="text-[11px] text-slate-400">Acceptance checkbox</span>
        </div>
      );

    case 'switch':
      return (
        <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
          <span className="text-[11px] text-slate-400">Toggle active state</span>
          <div className="h-4 w-7 rounded-full bg-rose-600/70 p-0.5 flex justify-end">
            <div className="h-3 w-3 rounded-full bg-white" />
          </div>
        </div>
      );

    case 'radio':
      return (
        <div className="space-y-1.5 py-1">
          {(field.options?.slice(0, 3) || [{ label: 'Option 1' }, { label: 'Option 2' }]).map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full border border-slate-700 bg-slate-950" />
              <span className="text-[11px] text-slate-400">{opt.label}</span>
            </div>
          ))}
        </div>
      );

    case 'slider':
      return (
        <div className="space-y-1 py-1">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-rose-500" />
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
          <span>★</span><span>★</span><span>★</span><span>★</span><span className="text-slate-700">★</span>
        </div>
      );

    case 'formarray':
      return (
        <div className="p-3 rounded border border-rose-800/40 bg-rose-950/15 space-y-2">
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
              <div key={c.id} className="col-span-4 h-6 rounded bg-slate-900 border border-slate-800 flex items-center px-2 text-[10px] text-slate-400">
                {c.label}
              </div>
            )) || <span className="text-[10px] text-slate-500">Add sub-fields to this array</span>}
          </div>
        </div>
      );

    default:
      return (
        <div className="w-full h-8 rounded bg-slate-950 border border-slate-800/80 px-2.5 flex items-center text-[11px] text-slate-500">
          {field.placeholder || `Enter ${field.label.toLowerCase()}...`}
        </div>
      );
  }
}

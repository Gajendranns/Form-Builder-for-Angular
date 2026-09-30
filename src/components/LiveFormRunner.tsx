import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Send,
  Eye,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Table,
  Check,
} from 'lucide-react';
import { FormConfig, FormField, FormSubmission, FormEngine } from '../types/form';

interface LiveFormRunnerProps {
  formConfig: FormConfig;
  onSubmitSuccess: (submission: FormSubmission) => void;
  onGoToSubmissionsTable: () => void;
  onUpdateFormEngine?: (engine: FormEngine) => void;
}

export const LiveFormRunner: React.FC<LiveFormRunnerProps> = ({
  formConfig,
  onSubmitSuccess,
  onGoToSubmissionsTable,
  onUpdateFormEngine,
}) => {
  const isMultiStep = formConfig.layoutType === 'multi-step';
  const steps = isMultiStep ? formConfig.fields.filter((f) => f.type === 'step') : [];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<Record<string, any> | null>(null);

  // Initialize Form Data
  useEffect(() => {
    resetFormValues();
  }, [formConfig]);

  const resetFormValues = () => {
    const initial: Record<string, any> = {};

    function initField(f: FormField) {
      if (f.type === 'formarray') {
        const initialCount = f.arrayConfig?.initialItemsCount ?? 1;
        const rows: any[] = [];
        for (let i = 0; i < initialCount; i++) {
          const rowObj: any = {};
          f.children?.forEach((child) => {
            rowObj[child.name] = child.defaultValue !== undefined ? child.defaultValue : '';
          });
          rows.push(rowObj);
        }
        initial[f.name] = rows;
        return;
      }

      if (f.defaultValue !== undefined) {
        initial[f.name] = f.defaultValue;
      } else if (f.type === 'checkbox' || f.type === 'switch') {
        initial[f.name] = false;
      } else if (f.type === 'number' || f.type === 'slider' || f.type === 'rating') {
        initial[f.name] = f.validation?.min ?? 0;
      } else if (f.type === 'multiselect') {
        initial[f.name] = [];
      } else {
        initial[f.name] = '';
      }
    }

    if (isMultiStep) {
      steps.forEach((s) => s.children?.forEach(initField));
    } else {
      formConfig.fields.forEach(initField);
    }

    setFormData(initial);
    setTouchedFields({});
    setFormErrors({});
    setLastSubmission(null);
    setCurrentStepIndex(0);
  };

  // Get active fields for current step
  const activeFields: FormField[] = isMultiStep
    ? steps[currentStepIndex]?.children || []
    : formConfig.fields;

  // Validation Engine
  const validateField = (field: FormField, value: any, allValues: Record<string, any>): string | null => {
    // If field is hidden by conditional logic, it is valid
    if (field.conditional?.enabled) {
      const depField = formConfig.fields.find((f) => f.id === field.conditional?.fieldId);
      if (depField) {
        const depVal = allValues[depField.name];
        if (field.conditional.operator === 'isTruthy' && !depVal) return null;
        if (field.conditional.operator === 'equals' && String(depVal) !== field.conditional.value) return null;
        if (field.conditional.operator === 'notEquals' && String(depVal) === field.conditional.value) return null;
      }
    }

    const rules = field.validation;
    if (!rules) return null;

    if (rules.required) {
      if (field.type === 'checkbox' || field.type === 'switch') {
        if (!value) return rules.requiredMessage || `${field.label} must be accepted`;
      } else if (value === undefined || value === null || String(value).trim() === '') {
        return rules.requiredMessage || `${field.label} is required`;
      }
    }

    if (rules.emailValidator || field.type === 'email') {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
        return 'Please enter a valid email address';
      }
    }

    if (rules.minLength && String(value).length < rules.minLength) {
      return `Must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && String(value).length > rules.maxLength) {
      return `Must not exceed ${rules.maxLength} characters`;
    }

    if (rules.min !== undefined && Number(value) < rules.min) {
      return `Minimum value is ${rules.min}`;
    }

    if (rules.max !== undefined && Number(value) > rules.max) {
      return `Maximum value is ${rules.max}`;
    }

    if (rules.pattern && value) {
      try {
        const regex = new RegExp(rules.pattern);
        if (!regex.test(String(value))) {
          return rules.patternMessage || 'Invalid format';
        }
      } catch (e) {
        // ignore regex error
      }
    }

    if (rules.passwordConfirmFieldId) {
      // Find matching password field
      let allFlat: FormField[] = [];
      if (isMultiStep) {
        steps.forEach((s) => allFlat.push(...(s.children || [])));
      } else {
        allFlat = formConfig.fields;
      }
      const target = allFlat.find((f) => f.id === rules.passwordConfirmFieldId);
      if (target && allValues[target.name] !== value) {
        return 'Passwords do not match';
      }
    }

    return null;
  };

  // Re-run validation on active fields
  useEffect(() => {
    const errors: Record<string, string> = {};
    activeFields.forEach((field) => {
      const err = validateField(field, formData[field.name], formData);
      if (err) errors[field.name] = err;
    });
    setFormErrors(errors);
  }, [formData, activeFields]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  const handleBlur = (fieldName: string) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  // FormArray Handlers
  const handleAddFormArrayRow = (faField: FormField) => {
    const currentRows = (formData[faField.name] as any[]) || [];
    if (faField.arrayConfig?.maxItems && currentRows.length >= faField.arrayConfig.maxItems) return;

    const newRow: any = {};
    faField.children?.forEach((c) => {
      newRow[c.name] = c.defaultValue !== undefined ? c.defaultValue : '';
    });

    setFormData((prev) => ({
      ...prev,
      [faField.name]: [...currentRows, newRow],
    }));
  };

  const handleRemoveFormArrayRow = (faField: FormField, index: number) => {
    const currentRows = [...((formData[faField.name] as any[]) || [])];
    if (faField.arrayConfig?.minItems && currentRows.length <= faField.arrayConfig.minItems) return;

    currentRows.splice(index, 1);
    setFormData((prev) => ({ ...prev, [faField.name]: currentRows }));
  };

  const handleFormArrayCellChange = (
    faName: string,
    rowIndex: number,
    childName: string,
    val: any
  ) => {
    const currentRows = [...((formData[faName] as any[]) || [])];
    currentRows[rowIndex] = { ...currentRows[rowIndex], [childName]: val };
    setFormData((prev) => ({ ...prev, [faName]: currentRows }));
  };

  // Check if a field is visible based on conditional logic
  const isFieldVisible = (field: FormField): boolean => {
    if (!field.conditional?.enabled) return true;
    let allFlat: FormField[] = [];
    if (isMultiStep) {
      steps.forEach((s) => allFlat.push(...(s.children || [])));
    } else {
      allFlat = formConfig.fields;
    }
    const depField = allFlat.find((f) => f.id === field.conditional?.fieldId);
    if (!depField) return true;

    const depVal = formData[depField.name];
    if (field.conditional.operator === 'isTruthy') return !!depVal;
    if (field.conditional.operator === 'equals') return String(depVal) === field.conditional.value;
    if (field.conditional.operator === 'notEquals') return String(depVal) !== field.conditional.value;
    return true;
  };

  // Step advancement
  const handleNextStep = () => {
    // Mark active step fields touched
    const touched: Record<string, boolean> = { ...touchedFields };
    activeFields.forEach((f) => {
      touched[f.name] = true;
    });
    setTouchedFields(touched);

    const hasStepErrors = activeFields.some((f) => {
      const err = validateField(f, formData[f.name], formData);
      return err !== null;
    });

    if (hasStepErrors) return;

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields touched
    const touched: Record<string, boolean> = { ...touchedFields };
    let allFlat: FormField[] = [];
    if (isMultiStep) {
      steps.forEach((s) => allFlat.push(...(s.children || [])));
    } else {
      allFlat = formConfig.fields;
    }

    let hasAnyError = false;
    allFlat.forEach((f) => {
      touched[f.name] = true;
      if (validateField(f, formData[f.name], formData)) {
        hasAnyError = true;
      }
    });

    setTouchedFields(touched);

    if (hasAnyError) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setLastSubmission(formData);

      // Trigger Confetti!
      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E11D48', '#FB7185', '#38BDF8', '#34D399'],
        });
      } catch (err) {
        // fallback if confetti fails
      }

      const submission: FormSubmission = {
        id: `sub-${Math.floor(100 + Math.random() * 900)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        data: { ...formData },
        status: 'submitted',
      };
      onSubmitSuccess(submission);
    }, 500);
  };

  const isValid = Object.keys(formErrors).length === 0;

  return (
    <div className="flex-1 bg-slate-900/30 overflow-y-auto p-3.5 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Main Interactive Form Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-4 sm:p-6 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 shadow-xl">
            {/* Header */}
            <div className="border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40">
                  Live Angular Preview Simulation
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {isValid ? (
                    <span className="text-emerald-400 font-medium">● Form Status: Valid</span>
                  ) : (
                    <span className="text-amber-400 font-medium">● Form Status: Invalid</span>
                  )}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">{formConfig.title}</h2>
              <p className="text-xs text-slate-400 mt-1">{formConfig.description}</p>
            </div>

            {/* Multi-Step Wizard Indicator */}
            {isMultiStep && steps.length > 0 && (
              <div className="mb-6 pb-4 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  {steps.map((st, idx) => {
                    const isDone = currentStepIndex > idx;
                    const isCurrent = currentStepIndex === idx;

                    return (
                      <div key={st.id} className="flex items-center gap-2">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-colors ${
                            isCurrent
                              ? 'bg-rose-600 text-white'
                              : isDone
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-slate-900 text-slate-500 border border-slate-800'
                          }`}
                        >
                          {isDone ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                        </div>
                        <span
                          className={`text-xs font-medium hidden sm:inline ${
                            isCurrent ? 'text-white' : 'text-slate-400'
                          }`}
                        >
                          {st.stepTitle || `Step ${idx + 1}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Success Submission Notification Box */}
            {lastSubmission && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Form Successfully Validated & Submitted!</span>
                  </div>
                  <button
                    onClick={onGoToSubmissionsTable}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 text-xs font-medium border border-emerald-700/60 transition-colors"
                  >
                    <Table className="h-3.5 w-3.5" />
                    <span>View in Submissions Table</span>
                  </button>
                </div>
                <p className="text-[11px] text-emerald-400/90">
                  Values recorded into the data grid below. You can inspect or export to CSV / JSON.
                </p>
              </div>
            )}

            {/* Form Fields Rendering */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-12 gap-4">
                {activeFields.map((field) => {
                  if (!isFieldVisible(field)) return null;

                  const colSpan = field.colSpan || 12;
                  const colClass = `col-span-12 sm:col-span-${colSpan}`;
                  const errorMsg = touchedFields[field.name] ? formErrors[field.name] : null;

                  // Render FormArray
                  if (field.type === 'formarray') {
                    const rows = (formData[field.name] as any[]) || [];
                    return (
                      <div key={field.id} className="col-span-12 space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                            {field.label}
                          </label>
                          <button
                            type="button"
                            onClick={() => handleAddFormArrayRow(field)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded hover:bg-rose-900/50 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                            <span>{field.arrayConfig?.addButtonText || 'Add Member'}</span>
                          </button>
                        </div>

                        <div className="space-y-3">
                          {rows.map((rowItem, rIdx) => (
                            <div
                              key={rIdx}
                              className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg relative space-y-2"
                            >
                              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-1.5">
                                <span className="font-semibold text-slate-300">
                                  {field.arrayConfig?.itemLabel || 'Item'} #{rIdx + 1}
                                </span>
                                {rows.length > (field.arrayConfig?.minItems ?? 1) && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFormArrayRow(field, rIdx)}
                                    className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[11px]"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    <span>Remove</span>
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-12 gap-3 pt-1">
                                {field.children?.map((child) => (
                                  <div
                                    key={child.id}
                                    className={`col-span-12 sm:col-span-${child.colSpan || 4} space-y-1`}
                                  >
                                    <label className="text-[11px] font-medium text-slate-300">
                                      {child.label}
                                    </label>
                                    {child.type === 'select' ? (
                                      <select
                                        value={rowItem[child.name] || ''}
                                        onChange={(e) =>
                                          handleFormArrayCellChange(
                                            field.name,
                                            rIdx,
                                            child.name,
                                            e.target.value
                                          )
                                        }
                                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-100"
                                      >
                                        <option value="" disabled>
                                          Select...
                                        </option>
                                        {child.options?.map((o) => (
                                          <option key={o.value} value={o.value}>
                                            {o.label}
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <input
                                        type={child.type === 'email' ? 'email' : 'text'}
                                        placeholder={child.placeholder || ''}
                                        value={rowItem[child.name] || ''}
                                        onChange={(e) =>
                                          handleFormArrayCellChange(
                                            field.name,
                                            rIdx,
                                            child.name,
                                            e.target.value
                                          )
                                        }
                                        className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder:text-slate-600"
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // Checkbox
                  if (field.type === 'checkbox') {
                    return (
                      <div key={field.id} className={`${colClass} space-y-1 pt-1`}>
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            id={`run_${field.id}`}
                            checked={!!formData[field.name]}
                            onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                            onBlur={() => handleBlur(field.name)}
                            style={field.borderColor ? { borderColor: field.borderColor } : undefined}
                            className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500"
                          />
                          <label
                            htmlFor={`run_${field.id}`}
                            style={field.labelColor ? { color: field.labelColor } : undefined}
                            className="text-xs text-slate-300 cursor-pointer select-none leading-relaxed"
                          >
                            {field.label}
                            {field.validation?.required && (
                              <span className="text-rose-400 ml-0.5">*</span>
                            )}
                          </label>
                        </div>
                        {errorMsg && (
                          <p className="text-[11px] text-rose-400 pl-6">{errorMsg}</p>
                        )}
                      </div>
                    );
                  }

                  // Switch
                  if (field.type === 'switch') {
                    return (
                      <div
                        key={field.id}
                        style={field.borderColor ? { borderColor: field.borderColor } : undefined}
                        className={`${colClass} flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-lg`}
                      >
                        <span
                          className="text-xs font-medium text-slate-200"
                          style={field.labelColor ? { color: field.labelColor } : undefined}
                        >
                          {field.label}
                        </span>
                        <input
                          type="checkbox"
                          checked={!!formData[field.name]}
                          onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500"
                        />
                      </div>
                    );
                  }

                  // Radio
                  if (field.type === 'radio') {
                    return (
                      <div key={field.id} className={`${colClass} space-y-2`}>
                        <label
                          className="text-xs font-medium text-slate-300 block"
                          style={field.labelColor ? { color: field.labelColor } : undefined}
                        >
                          {field.label}
                          {field.validation?.required && (
                            <span className="text-rose-400 ml-0.5">*</span>
                          )}
                        </label>
                        <div className="space-y-1.5">
                          {field.options?.map((opt) => (
                            <label
                              key={opt.value}
                              className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name={field.name}
                                value={opt.value}
                                checked={formData[field.name] === opt.value}
                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                style={field.borderColor ? { borderColor: field.borderColor } : undefined}
                                className="text-rose-600 focus:ring-rose-500"
                              />
                              <span>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // Slider
                  if (field.type === 'slider') {
                    const min = field.validation?.min ?? 0;
                    const max = field.validation?.max ?? 100;
                    const val = formData[field.name] ?? min;

                    return (
                      <div key={field.id} className={`${colClass} space-y-1.5`}>
                        <div className="flex justify-between items-center text-xs">
                          <label
                            className="font-medium text-slate-300"
                            style={field.labelColor ? { color: field.labelColor } : undefined}
                          >
                            {field.label}
                          </label>
                          <span className="font-mono text-rose-400 font-semibold tabular-nums">
                            {val}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={min}
                          max={max}
                          value={val}
                          onChange={(e) => handleFieldChange(field.name, Number(e.target.value))}
                          style={field.borderColor ? { accentColor: field.borderColor } : undefined}
                          className="w-full accent-rose-600 cursor-pointer"
                        />
                      </div>
                    );
                  }

                  // Rating
                  if (field.type === 'rating') {
                    const stars = formData[field.name] || 0;
                    return (
                      <div key={field.id} className={`${colClass} space-y-1.5`}>
                        <label
                          className="text-xs font-medium text-slate-300 block"
                          style={field.labelColor ? { color: field.labelColor } : undefined}
                        >
                          {field.label}
                        </label>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleFieldChange(field.name, star)}
                              className={`text-lg transition-transform hover:scale-110 ${
                                star <= stars ? 'text-amber-400' : 'text-slate-700'
                              }`}
                            >
                              ★
                            </button>
                          ))}
                          <span className="text-xs text-slate-400 font-mono ml-2 tabular-nums">
                            {stars} / 5
                          </span>
                        </div>
                      </div>
                    );
                  }

                  // Standard Input / Textarea / Select
                  const customInputStyle: React.CSSProperties = {
                    ...(!errorMsg && field.borderColor ? { borderColor: field.borderColor } : {}),
                    ...(field.textColor ? { color: field.textColor } : {}),
                    ...(field.placeholderColor ? ({ '--placeholder-color': field.placeholderColor } as any) : {}),
                  };

                  return (
                    <div key={field.id} className={`${colClass} space-y-1.5`}>
                      <label
                        className="block text-xs font-medium text-slate-300"
                        style={field.labelColor ? { color: field.labelColor } : undefined}
                      >
                        {field.label}
                        {field.validation?.required && (
                          <span className="text-rose-400 ml-0.5">*</span>
                        )}
                      </label>

                      {field.type === 'textarea' ? (
                        <textarea
                          rows={3}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          onBlur={() => handleBlur(field.name)}
                          placeholder={field.placeholder || ''}
                          style={customInputStyle}
                          className={`w-full px-3 py-2 text-xs bg-slate-900 border rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors ${
                            errorMsg
                              ? 'border-rose-500 focus:border-rose-400 ring-1 ring-rose-500/30'
                              : 'border-slate-800 focus:border-rose-500'
                          }`}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          value={formData[field.name] || ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          onBlur={() => handleBlur(field.name)}
                          style={customInputStyle}
                          className={`w-full px-3 py-2 text-xs bg-slate-900 border rounded-lg text-slate-100 focus:outline-none transition-colors ${
                            errorMsg
                              ? 'border-rose-500 focus:border-rose-400'
                              : 'border-slate-800 focus:border-rose-500'
                          }`}
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
                      ) : (
                        <input
                          type={
                            field.type === 'datepicker'
                              ? 'date'
                              : field.type === 'password'
                              ? 'password'
                              : field.type === 'number'
                              ? 'number'
                              : 'text'
                          }
                          value={formData[field.name] !== undefined ? formData[field.name] : ''}
                          onChange={(e) =>
                            handleFieldChange(
                              field.name,
                              field.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value
                            )
                          }
                          onBlur={() => handleBlur(field.name)}
                          placeholder={field.placeholder || ''}
                          style={customInputStyle}
                          className={`w-full px-3 py-2 text-xs bg-slate-900 border rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors ${
                            errorMsg
                              ? 'border-rose-500 focus:border-rose-400 ring-1 ring-rose-500/30'
                              : 'border-slate-800 focus:border-rose-500'
                          }`}
                        />
                      )}

                      {field.helperText && !errorMsg && (
                        <p className="text-[11px] text-slate-500">{field.helperText}</p>
                      )}

                      {errorMsg && (
                        <div className="flex items-center gap-1 text-[11px] text-rose-400 font-medium">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          <span>{errorMsg}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Form Navigation / Submit Actions */}
              <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                {isMultiStep ? (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      disabled={currentStepIndex === 0}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-30 transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Previous</span>
                    </button>

                    {currentStepIndex < steps.length - 1 ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-500 shadow-sm transition-colors"
                      >
                        <span>Next Step</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-500 disabled:opacity-50 transition-colors"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>{isSubmitting ? 'Validating...' : formConfig.submitButtonText}</span>
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {formConfig.showResetButton ? (
                      <button
                        type="button"
                        onClick={resetFormValues}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>{formConfig.resetButtonText || 'Reset'}</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-500 disabled:opacity-50 transition-colors"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{isSubmitting ? 'Processing...' : formConfig.submitButtonText}</span>
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Angular Reactive State & Signal Inspector Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <span className="text-xs font-semibold text-white uppercase tracking-wider block">
                  Angular Signal Inspector
                </span>
                <span className="text-[10px] text-slate-400">
                  {formConfig.frameworkTarget === 'angular-signal-form'
                    ? '⚡ Angular 19+ Signal Forms (Zoneless)'
                    : formConfig.frameworkTarget === 'tanstack-angular-form'
                    ? '🎯 @tanstack/angular-form (Zod)'
                    : '📦 Angular Reactive Forms + Signals'}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-semibold">
                {formConfig.frameworkTarget === 'angular-signal-form' ? 'Signals.computed' : 'FormGroup.status'}
              </span>
            </div>

            {/* Reactive State Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Validity</span>
                <span className={isValid ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {isValid ? 'VALID' : 'INVALID'}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Touched</span>
                <span className="text-slate-300 font-bold">
                  {Object.keys(touchedFields).length > 0 ? 'TRUE' : 'FALSE'}
                </span>
              </div>
            </div>

            {/* Live Model Value JSON Tree */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>form.value (Raw Signal):</span>
                <span className="font-mono text-[10px] text-slate-500">
                  {Object.keys(formData).length} keys
                </span>
              </div>
              <pre className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-rose-300/90 overflow-x-auto max-h-72 border border-slate-800">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>

            {/* Active Validation Errors */}
            {Object.keys(formErrors).length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>Validation Error Messages ({Object.keys(formErrors).length})</span>
                </span>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {Object.entries(formErrors).map(([key, msg]) => (
                    <div
                      key={key}
                      className="text-[11px] font-mono text-slate-300 p-1.5 rounded bg-slate-900 border border-slate-800 flex justify-between"
                    >
                      <span className="text-slate-400">{key}:</span>
                      <span className="text-rose-400">{msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

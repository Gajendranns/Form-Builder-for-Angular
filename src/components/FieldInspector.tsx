import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  GitBranch,
  Sliders,
  Trash2,
  Copy,
  Plus,
  X,
  FileCode2,
  Palette,
  RotateCcw,
} from 'lucide-react';
import { FormField, FormConfig, FieldOption } from '../types/form';

interface FieldInspectorProps {
  selectedField: FormField | null;
  formConfig: FormConfig;
  allFields: FormField[];
  onUpdateField: (updated: FormField) => void;
  onDeleteField: (fieldId: string) => void;
  onDuplicateField: (field: FormField) => void;
  onUpdateFormConfig: (updated: Partial<FormConfig>) => void;
  onClose?: () => void;
}

export const FieldInspector: React.FC<FieldInspectorProps> = ({
  selectedField,
  formConfig,
  allFields,
  onUpdateField,
  onDeleteField,
  onDuplicateField,
  onUpdateFormConfig,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'style' | 'validation' | 'conditional'>('general');

  // If no field selected, show Form-Level Settings
  if (!selectedField) {
    return (
      <aside className="w-full sm:w-88 lg:w-80 shrink-0 border-l border-slate-800 bg-slate-950 flex flex-col h-full overflow-hidden select-none">
        <div className="border-b border-slate-800 p-3 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 text-white font-semibold text-xs sm:text-sm">
              <Settings className="h-4 w-4 text-rose-500" />
              <span>Form Configuration</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Global properties and target framework.
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-slate-400 hover:text-white rounded bg-slate-900 border border-slate-800"
              title="Close panel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">Form Title</label>
            <input
              type="text"
              value={formConfig.title}
              onChange={(e) => onUpdateFormConfig({ title: e.target.value })}
              className="w-full px-2.5 py-1 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">Description</label>
            <textarea
              rows={2}
              value={formConfig.description}
              onChange={(e) => onUpdateFormConfig({ description: e.target.value })}
              className="w-full px-2.5 py-1 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Layout Type */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">Layout Structure</label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => onUpdateFormConfig({ layoutType: 'single-page' })}
                className={`p-2 rounded-lg border text-left text-xs transition-colors ${
                  formConfig.layoutType === 'single-page'
                    ? 'border-rose-600 bg-rose-950/30 text-rose-200'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold text-xs">Single Page</div>
                <div className="text-[10px] text-slate-500">Unified form</div>
              </button>
              <button
                onClick={() => onUpdateFormConfig({ layoutType: 'multi-step' })}
                className={`p-2 rounded-lg border text-left text-xs transition-colors ${
                  formConfig.layoutType === 'multi-step'
                    ? 'border-rose-600 bg-rose-950/30 text-rose-200'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold text-xs">Multi-Step</div>
                <div className="text-[10px] text-slate-500">Step wizard</div>
              </button>
            </div>
          </div>

          {/* Target Engine */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">Code Architecture</label>
            <select
              value={formConfig.frameworkTarget}
              onChange={(e) => onUpdateFormConfig({ frameworkTarget: e.target.value as any })}
              className="w-full px-2.5 py-1 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-rose-500"
            >
              <option value="angular-signal-form">Angular Signal Forms (@angular/forms/signals)</option>
              <option value="angular-reactive-signals">Angular Standalone (Reactive + Signals)</option>
              <option value="tanstack-angular-form">@tanstack/angular-form (Zod)</option>
            </select>
          </div>

          {/* UI Framework Theme */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">UI Component Theme</label>
            <select
              value={formConfig.uiFramework || 'tailwind'}
              onChange={(e) => onUpdateFormConfig({ uiFramework: e.target.value as any })}
              className="w-full px-2.5 py-1 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-rose-500"
            >
              <option value="tailwind">Tailwind UI (Modern Slate & Rose Glass)</option>
              <option value="material">Angular Material (Google M3 Outlined & Tonal)</option>
              <option value="shadcn">shadcn / Spartan UI (Minimalist Zinc Mono)</option>
              <option value="primeng">PrimeNG Aura (Enterprise Cyan Structured)</option>
            </select>
          </div>

          {/* Submit Button Text */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">Submit Button Label</label>
            <input
              type="text"
              value={formConfig.submitButtonText}
              onChange={(e) => onUpdateFormConfig({ submitButtonText: e.target.value })}
              className="w-full px-2.5 py-1 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Reset Button Toggle */}
          <div className="flex items-center justify-between p-2.5 bg-slate-900/50 border border-slate-800 rounded-lg">
            <div>
              <div className="text-xs font-medium text-slate-200">Reset Button</div>
              <div className="text-[10px] text-slate-500">Provide action to clear values</div>
            </div>
            <input
              type="checkbox"
              checked={formConfig.showResetButton}
              onChange={(e) => onUpdateFormConfig({ showResetButton: e.target.checked })}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500/20"
            />
          </div>
        </div>
      </aside>
    );
  }

  // A specific field is selected
  const hasOptions = ['select', 'radio', 'multiselect'].includes(selectedField.type);
  const isFormArray = selectedField.type === 'formarray';
  const isStep = selectedField.type === 'step';

  const handleAddOption = () => {
    const current = selectedField.options || [];
    const nextIdx = current.length + 1;
    const newOptions = [...current, { label: `Option ${nextIdx}`, value: `option_${nextIdx}` }];
    onUpdateField({ ...selectedField, options: newOptions });
  };

  const handleUpdateOption = (index: number, key: 'label' | 'value', val: string) => {
    const current = [...(selectedField.options || [])];
    current[index] = { ...current[index], [key]: val };
    onUpdateField({ ...selectedField, options: current });
  };

  const handleRemoveOption = (index: number) => {
    const current = [...(selectedField.options || [])];
    current.splice(index, 1);
    onUpdateField({ ...selectedField, options: current });
  };

  return (
    <aside className="w-full sm:w-88 lg:w-80 shrink-0 border-l border-slate-800 bg-slate-950 flex flex-col h-full overflow-hidden">
      {/* Field Inspector Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/40 text-rose-300 font-semibold">
            {selectedField.type}
          </span>
          <span className="text-xs font-semibold text-white truncate max-w-[140px]">
            {selectedField.label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDuplicateField(selectedField)}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded"
            title="Duplicate Field"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDeleteField(selectedField.id)}
            className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded"
            title="Delete Field"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded ml-1"
              title="Close Inspector"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/40 px-2 pt-2 gap-1">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'general'
              ? 'border-rose-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>General</span>
        </button>

        <button
          onClick={() => setActiveTab('style')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'style'
              ? 'border-rose-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <Palette className="h-3.5 w-3.5" />
          <span>Colors</span>
          {(selectedField.labelColor || selectedField.borderColor || selectedField.textColor || selectedField.placeholderColor) && (
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('validation')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'validation'
              ? 'border-rose-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Validation</span>
        </button>

        <button
          onClick={() => setActiveTab('conditional')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'conditional'
              ? 'border-rose-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <GitBranch className="h-3.5 w-3.5" />
          <span>Logic</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'general' && (
          <>
            {/* Label */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Field Label</label>
              <input
                type="text"
                value={selectedField.label}
                onChange={(e) => onUpdateField({ ...selectedField, label: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Field Identifier (formControlName) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">Control Identifier (Name)</label>
                <span className="text-[10px] text-slate-500 font-mono">formControlName</span>
              </div>
              <input
                type="text"
                value={selectedField.name}
                onChange={(e) => onUpdateField({ ...selectedField, name: e.target.value.replace(/\s+/g, '') })}
                className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono text-[11px] focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Placeholder (if applicable) */}
            {!['checkbox', 'switch', 'slider', 'rating', 'formarray', 'step'].includes(selectedField.type) && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Placeholder Text</label>
                <input
                  type="text"
                  value={selectedField.placeholder || ''}
                  onChange={(e) => onUpdateField({ ...selectedField, placeholder: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
            )}

            {/* Helper Text */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Helper / Hint Text</label>
              <input
                type="text"
                value={selectedField.helperText || ''}
                onChange={(e) => onUpdateField({ ...selectedField, helperText: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-rose-500"
                placeholder="Optional explanation shown below input"
              />
            </div>

            {/* Layout Column Span */}
            {!isStep && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Grid Width (Column Span)</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: 'Full', span: 12 },
                    { label: 'Half', span: 6 },
                    { label: '1/3', span: 4 },
                    { label: '2/3', span: 8 },
                  ].map((s) => (
                    <button
                      key={s.span}
                      onClick={() => onUpdateField({ ...selectedField, colSpan: s.span as any })}
                      className={`py-1 text-xs rounded border transition-colors ${
                        (selectedField.colSpan || 12) === s.span
                          ? 'border-rose-500 bg-rose-950/40 text-rose-200 font-semibold'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* FormArray Specific Settings */}
            {isFormArray && (
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-rose-300">FormArray Repeater Settings</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Min Items</label>
                    <input
                      type="number"
                      min={0}
                      value={selectedField.arrayConfig?.minItems ?? 1}
                      onChange={(e) =>
                        onUpdateField({
                          ...selectedField,
                          arrayConfig: {
                            ...(selectedField.arrayConfig || {
                              itemLabel: 'Item',
                              addButtonText: 'Add Item',
                              initialItemsCount: 1,
                              maxItems: 10,
                              minItems: 1,
                            }),
                            minItems: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-2 py-1 text-xs bg-slate-900 border border-slate-800 rounded text-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Max Items</label>
                    <input
                      type="number"
                      min={1}
                      value={selectedField.arrayConfig?.maxItems ?? 10}
                      onChange={(e) =>
                        onUpdateField({
                          ...selectedField,
                          arrayConfig: {
                            ...(selectedField.arrayConfig || {
                              itemLabel: 'Item',
                              addButtonText: 'Add Item',
                              initialItemsCount: 1,
                              minItems: 1,
                              maxItems: 10,
                            }),
                            maxItems: parseInt(e.target.value) || 10,
                          },
                        })
                      }
                      className="w-full px-2 py-1 text-xs bg-slate-900 border border-slate-800 rounded text-slate-100"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Row Label Prefix</label>
                  <input
                    type="text"
                    value={selectedField.arrayConfig?.itemLabel || 'Item'}
                    onChange={(e) =>
                      onUpdateField({
                        ...selectedField,
                        arrayConfig: {
                          ...(selectedField.arrayConfig || {
                            addButtonText: 'Add Item',
                            initialItemsCount: 1,
                            minItems: 1,
                            maxItems: 10,
                            itemLabel: 'Item',
                          }),
                          itemLabel: e.target.value,
                        },
                      })
                    }
                    className="w-full px-2 py-1 text-xs bg-slate-900 border border-slate-800 rounded text-slate-100"
                  />
                </div>
              </div>
            )}

            {/* Options list for select, radio, multiselect */}
            {hasOptions && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Options List</label>
                  <button
                    onClick={handleAddOption}
                    className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-medium"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Option</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {(selectedField.options || []).map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-1.5 bg-slate-900 rounded border border-slate-800">
                      <input
                        type="text"
                        placeholder="Label"
                        value={opt.label}
                        onChange={(e) => handleUpdateOption(idx, 'label', e.target.value)}
                        className="w-1/2 px-2 py-1 text-[11px] bg-slate-950 border border-slate-800 rounded text-slate-200"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={opt.value}
                        onChange={(e) => handleUpdateOption(idx, 'value', e.target.value)}
                        className="w-1/2 px-2 py-1 text-[11px] bg-slate-950 border border-slate-800 rounded text-slate-200 font-mono"
                      />
                      <button
                        onClick={() => handleRemoveOption(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'style' && (
          <div className="space-y-5">
            {/* Live Visual Preview of Field with Custom Colors */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>LIVE PREVIEW</span>
                <span className="uppercase text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  {selectedField.type}
                </span>
              </div>
              <div className="space-y-1.5 p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                <label
                  className="text-xs font-semibold block transition-colors"
                  style={{ color: selectedField.labelColor || '#e2e8f0' }}
                >
                  {selectedField.label || 'Field Label'}
                  {selectedField.validation?.required && (
                    <span className="text-rose-400 ml-0.5">*</span>
                  )}
                </label>
                <div
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border transition-all flex items-center justify-between"
                  style={{
                    borderColor: selectedField.borderColor || '#334155',
                    color: selectedField.textColor || '#f8fafc',
                  }}
                >
                  <span style={{ color: selectedField.placeholderColor || '#64748b' }}>
                    {selectedField.placeholder || 'Placeholder preview text...'}
                  </span>
                  <div className="flex items-center gap-1">
                    {selectedField.labelColor && (
                      <span
                        className="h-2 w-2 rounded-full border border-black/40"
                        style={{ backgroundColor: selectedField.labelColor }}
                        title="Label color"
                      />
                    )}
                    {selectedField.borderColor && (
                      <span
                        className="h-2 w-2 rounded-full border border-black/40"
                        style={{ backgroundColor: selectedField.borderColor }}
                        title="Border color"
                      />
                    )}
                    {selectedField.textColor && (
                      <span
                        className="h-2 w-2 rounded-full border border-black/40"
                        style={{ backgroundColor: selectedField.textColor }}
                        title="Text color"
                      />
                    )}
                    {selectedField.placeholderColor && (
                      <span
                        className="h-2 w-2 rounded-full border border-black/40"
                        style={{ backgroundColor: selectedField.placeholderColor }}
                        title="Placeholder color"
                      />
                    )}
                  </div>
                </div>

                {/* Sample input simulation with typed text */}
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800/60 flex items-center justify-between text-[11px]">
                  <span className="text-[10px] text-slate-500 font-mono">Typed Value:</span>
                  <span
                    className="font-medium font-mono"
                    style={{ color: selectedField.textColor || '#f8fafc' }}
                  >
                    John Doe (Sample Text)
                  </span>
                </div>
              </div>
            </div>

            {/* Label Color Control */}
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-slate-200 block">
                    Text Label Color
                  </label>
                  <p className="text-[10px] text-slate-400">
                    Custom color for field label text
                  </p>
                </div>
                {selectedField.labelColor && (
                  <button
                    type="button"
                    onClick={() => onUpdateField({ ...selectedField, labelColor: undefined })}
                    className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    title="Reset to default label color"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Native color picker & hex input */}
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center h-8 w-8 rounded-lg border border-slate-700 overflow-hidden shrink-0 cursor-pointer shadow-sm">
                  <input
                    type="color"
                    value={selectedField.labelColor || '#e2e8f0'}
                    onChange={(e) => onUpdateField({ ...selectedField, labelColor: e.target.value })}
                    className="absolute -inset-2 h-12 w-12 cursor-pointer border-0 p-0"
                    title="Choose any label color"
                  />
                </div>
                <input
                  type="text"
                  value={selectedField.labelColor || ''}
                  placeholder="#e2e8f0 (Default)"
                  onChange={(e) => onUpdateField({ ...selectedField, labelColor: e.target.value })}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Label Color Palette Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-mono text-slate-500">Presets</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { name: 'Default', hex: '#e2e8f0' },
                    { name: 'White', hex: '#ffffff' },
                    { name: 'Rose', hex: '#f43f5e' },
                    { name: 'Sky', hex: '#38bdf8' },
                    { name: 'Emerald', hex: '#34d399' },
                    { name: 'Amber', hex: '#fbbf24' },
                    { name: 'Violet', hex: '#a78bfa' },
                    { name: 'Orange', hex: '#fb923c' },
                    { name: 'Pink', hex: '#f472b6' },
                  ].map((swatch) => (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() => onUpdateField({ ...selectedField, labelColor: swatch.hex })}
                      className="group flex items-center gap-1 px-2 py-1 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-300 transition-colors"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-black/30 shrink-0"
                        style={{ backgroundColor: swatch.hex }}
                      />
                      <span>{swatch.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Border Color Control */}
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-slate-200 block">
                    Control Border Color
                  </label>
                  <p className="text-[10px] text-slate-400">
                    Custom border color for input / control
                  </p>
                </div>
                {selectedField.borderColor && (
                  <button
                    type="button"
                    onClick={() => onUpdateField({ ...selectedField, borderColor: undefined })}
                    className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    title="Reset to default border color"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Native color picker & hex input */}
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center h-8 w-8 rounded-lg border border-slate-700 overflow-hidden shrink-0 cursor-pointer shadow-sm">
                  <input
                    type="color"
                    value={selectedField.borderColor || '#334155'}
                    onChange={(e) => onUpdateField({ ...selectedField, borderColor: e.target.value })}
                    className="absolute -inset-2 h-12 w-12 cursor-pointer border-0 p-0"
                    title="Choose any border color"
                  />
                </div>
                <input
                  type="text"
                  value={selectedField.borderColor || ''}
                  placeholder="#334155 (Default)"
                  onChange={(e) => onUpdateField({ ...selectedField, borderColor: e.target.value })}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Border Color Palette Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-mono text-slate-500">Presets</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { name: 'Default', hex: '#334155' },
                    { name: 'Rose', hex: '#e11d48' },
                    { name: 'Cyan', hex: '#0284c7' },
                    { name: 'Emerald', hex: '#059669' },
                    { name: 'Amber', hex: '#d97706' },
                    { name: 'Violet', hex: '#7c3aed' },
                    { name: 'Orange', hex: '#ea580c' },
                    { name: 'White', hex: '#e2e8f0' },
                    { name: 'Slate', hex: '#475569' },
                  ].map((swatch) => (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() => onUpdateField({ ...selectedField, borderColor: swatch.hex })}
                      className="group flex items-center gap-1 px-2 py-1 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-300 transition-colors"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-black/30 shrink-0"
                        style={{ backgroundColor: swatch.hex }}
                      />
                      <span>{swatch.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Input Text Color Control */}
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-slate-200 block">
                    Input Text Color
                  </label>
                  <p className="text-[10px] text-slate-400">
                    Custom color for user-entered input text
                  </p>
                </div>
                {selectedField.textColor && (
                  <button
                    type="button"
                    onClick={() => onUpdateField({ ...selectedField, textColor: undefined })}
                    className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    title="Reset to default text color"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Native color picker & hex input */}
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center h-8 w-8 rounded-lg border border-slate-700 overflow-hidden shrink-0 cursor-pointer shadow-sm">
                  <input
                    type="color"
                    value={selectedField.textColor || '#f8fafc'}
                    onChange={(e) => onUpdateField({ ...selectedField, textColor: e.target.value })}
                    className="absolute -inset-2 h-12 w-12 cursor-pointer border-0 p-0"
                    title="Choose any input text color"
                  />
                </div>
                <input
                  type="text"
                  value={selectedField.textColor || ''}
                  placeholder="#f8fafc (Default)"
                  onChange={(e) => onUpdateField({ ...selectedField, textColor: e.target.value })}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Text Color Palette Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-mono text-slate-500">Presets</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { name: 'Default', hex: '#f8fafc' },
                    { name: 'Pure White', hex: '#ffffff' },
                    { name: 'Emerald', hex: '#34d399' },
                    { name: 'Sky', hex: '#38bdf8' },
                    { name: 'Amber', hex: '#fbbf24' },
                    { name: 'Rose', hex: '#f43f5e' },
                    { name: 'Violet', hex: '#a78bfa' },
                    { name: 'Orange', hex: '#fb923c' },
                    { name: 'Light Slate', hex: '#cbd5e1' },
                  ].map((swatch) => (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() => onUpdateField({ ...selectedField, textColor: swatch.hex })}
                      className="group flex items-center gap-1 px-2 py-1 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-300 transition-colors"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-black/30 shrink-0"
                        style={{ backgroundColor: swatch.hex }}
                      />
                      <span>{swatch.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Placeholder Color Control */}
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-slate-200 block">
                    Placeholder Text Color
                  </label>
                  <p className="text-[10px] text-slate-400">
                    Custom color for input hint / placeholder text
                  </p>
                </div>
                {selectedField.placeholderColor && (
                  <button
                    type="button"
                    onClick={() => onUpdateField({ ...selectedField, placeholderColor: undefined })}
                    className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    title="Reset to default placeholder color"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Native color picker & hex input */}
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center h-8 w-8 rounded-lg border border-slate-700 overflow-hidden shrink-0 cursor-pointer shadow-sm">
                  <input
                    type="color"
                    value={selectedField.placeholderColor || '#64748b'}
                    onChange={(e) => onUpdateField({ ...selectedField, placeholderColor: e.target.value })}
                    className="absolute -inset-2 h-12 w-12 cursor-pointer border-0 p-0"
                    title="Choose any placeholder color"
                  />
                </div>
                <input
                  type="text"
                  value={selectedField.placeholderColor || ''}
                  placeholder="#64748b (Default)"
                  onChange={(e) => onUpdateField({ ...selectedField, placeholderColor: e.target.value })}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Placeholder Color Palette Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-mono text-slate-500">Presets</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { name: 'Default', hex: '#64748b' },
                    { name: 'Subtle Muted', hex: '#475569' },
                    { name: 'Sky Muted', hex: '#38bdf8' },
                    { name: 'Emerald Muted', hex: '#34d399' },
                    { name: 'Rose Muted', hex: '#fb7185' },
                    { name: 'Amber Muted', hex: '#fcd34d' },
                    { name: 'Violet Muted', hex: '#c4b5fd' },
                    { name: 'Light Gray', hex: '#94a3b8' },
                    { name: 'Dark Slate', hex: '#334155' },
                  ].map((swatch) => (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() => onUpdateField({ ...selectedField, placeholderColor: swatch.hex })}
                      className="group flex items-center gap-1 px-2 py-1 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-300 transition-colors"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-black/30 shrink-0"
                        style={{ backgroundColor: swatch.hex }}
                      />
                      <span>{swatch.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'validation' && (
          <div className="space-y-4">
            {/* Required */}
            <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
              <div>
                <div className="text-xs font-medium text-slate-200">Required Validator</div>
                <div className="text-[11px] text-slate-500">Validators.required in Angular</div>
              </div>
              <input
                type="checkbox"
                checked={selectedField.validation?.required || false}
                onChange={(e) =>
                  onUpdateField({
                    ...selectedField,
                    validation: { ...selectedField.validation, required: e.target.checked },
                  })
                }
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500/20"
              />
            </div>

            {selectedField.validation?.required && (
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Custom Required Error Message</label>
                <input
                  type="text"
                  placeholder="e.g. This field cannot be left blank"
                  value={selectedField.validation?.requiredMessage || ''}
                  onChange={(e) =>
                    onUpdateField({
                      ...selectedField,
                      validation: { ...selectedField.validation, requiredMessage: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
            )}

            {/* Email Validator Toggle */}
            {selectedField.type === 'email' && (
              <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                <div>
                  <div className="text-xs font-medium text-slate-200">Email Format Check</div>
                  <div className="text-[11px] text-slate-500">Validators.email</div>
                </div>
                <input
                  type="checkbox"
                  checked={selectedField.validation?.emailValidator ?? true}
                  onChange={(e) =>
                    onUpdateField({
                      ...selectedField,
                      validation: { ...selectedField.validation, emailValidator: e.target.checked },
                    })
                  }
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500/20"
                />
              </div>
            )}

            {/* Cross-Field Password Confirm Validator */}
            {selectedField.type === 'password' && (
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2">
                <div className="text-xs font-semibold text-rose-300">Cross-Field Password Confirmation</div>
                <p className="text-[11px] text-slate-400">
                  Select another password field that this control must match.
                </p>
                <select
                  value={selectedField.validation?.passwordConfirmFieldId || ''}
                  onChange={(e) =>
                    onUpdateField({
                      ...selectedField,
                      validation: {
                        ...selectedField.validation,
                        passwordConfirmFieldId: e.target.value || undefined,
                      },
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  <option value="">None (Standalone password)</option>
                  {allFields
                    .filter((f) => f.id !== selectedField.id && f.type === 'password')
                    .map((target) => (
                      <option key={target.id} value={target.id}>
                        Must match: {target.label} ({target.name})
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Min / Max Length */}
            {['text', 'password', 'textarea', 'email'].includes(selectedField.type) && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Min Length</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 3"
                    value={selectedField.validation?.minLength ?? ''}
                    onChange={(e) =>
                      onUpdateField({
                        ...selectedField,
                        validation: {
                          ...selectedField.validation,
                          minLength: e.target.value ? parseInt(e.target.value) : undefined,
                        },
                      })
                    }
                    className="w-full px-2.5 py-1 text-xs bg-slate-900 border border-slate-800 rounded text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Max Length</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="e.g. 50"
                    value={selectedField.validation?.maxLength ?? ''}
                    onChange={(e) =>
                      onUpdateField({
                        ...selectedField,
                        validation: {
                          ...selectedField.validation,
                          maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                        },
                      })
                    }
                    className="w-full px-2.5 py-1 text-xs bg-slate-900 border border-slate-800 rounded text-slate-100"
                  />
                </div>
              </div>
            )}

            {/* Min / Max Numbers */}
            {['number', 'slider'].includes(selectedField.type) && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Min Value</label>
                  <input
                    type="number"
                    value={selectedField.validation?.min ?? ''}
                    onChange={(e) =>
                      onUpdateField({
                        ...selectedField,
                        validation: {
                          ...selectedField.validation,
                          min: e.target.value ? parseFloat(e.target.value) : undefined,
                        },
                      })
                    }
                    className="w-full px-2.5 py-1 text-xs bg-slate-900 border border-slate-800 rounded text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Max Value</label>
                  <input
                    type="number"
                    value={selectedField.validation?.max ?? ''}
                    onChange={(e) =>
                      onUpdateField({
                        ...selectedField,
                        validation: {
                          ...selectedField.validation,
                          max: e.target.value ? parseFloat(e.target.value) : undefined,
                        },
                      })
                    }
                    className="w-full px-2.5 py-1 text-xs bg-slate-900 border border-slate-800 rounded text-slate-100"
                  />
                </div>
              </div>
            )}

            {/* Regex Pattern */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Regex Pattern</label>
              <input
                type="text"
                placeholder="^[a-zA-Z0-9_]+$"
                value={selectedField.validation?.pattern || ''}
                onChange={(e) =>
                  onUpdateField({
                    ...selectedField,
                    validation: {
                      ...selectedField.validation,
                      pattern: e.target.value || undefined,
                    },
                  })
                }
                className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono text-[11px] focus:outline-none focus:border-rose-500"
              />
              <p className="text-[10px] text-slate-500">Validators.pattern in Reactive Forms</p>
            </div>
          </div>
        )}

        {activeTab === 'conditional' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
              <div>
                <div className="text-xs font-medium text-slate-200">Conditional Visibility</div>
                <div className="text-[11px] text-slate-500">Show or hide based on another field</div>
              </div>
              <input
                type="checkbox"
                checked={selectedField.conditional?.enabled || false}
                onChange={(e) =>
                  onUpdateField({
                    ...selectedField,
                    conditional: {
                      enabled: e.target.checked,
                      fieldId: selectedField.conditional?.fieldId || (allFields.find((f) => f.id !== selectedField.id)?.id || ''),
                      operator: selectedField.conditional?.operator || 'isTruthy',
                      value: selectedField.conditional?.value || 'true',
                    },
                  })
                }
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500/20"
              />
            </div>

            {selectedField.conditional?.enabled && (
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Depends On Field</label>
                  <select
                    value={selectedField.conditional.fieldId}
                    onChange={(e) =>
                      onUpdateField({
                        ...selectedField,
                        conditional: {
                          ...selectedField.conditional!,
                          fieldId: e.target.value,
                        },
                      })
                    }
                    className="w-full px-2.5 py-1 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200"
                  >
                    {allFields
                      .filter((f) => f.id !== selectedField.id)
                      .map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label} ({f.name})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Condition Operator</label>
                  <select
                    value={selectedField.conditional.operator}
                    onChange={(e) =>
                      onUpdateField({
                        ...selectedField,
                        conditional: {
                          ...selectedField.conditional!,
                          operator: e.target.value as any,
                        },
                      })
                    }
                    className="w-full px-2.5 py-1 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200"
                  >
                    <option value="isTruthy">Is Checked / Active (Truthy)</option>
                    <option value="equals">Value Equals Target</option>
                    <option value="notEquals">Value Does Not Equal</option>
                  </select>
                </div>

                {selectedField.conditional.operator !== 'isTruthy' && (
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Target Comparison Value</label>
                    <input
                      type="text"
                      value={selectedField.conditional.value}
                      onChange={(e) =>
                        onUpdateField({
                          ...selectedField,
                          conditional: {
                            ...selectedField.conditional!,
                            value: e.target.value,
                          },
                        })
                      }
                      className="w-full px-2.5 py-1 text-xs bg-slate-950 border border-slate-800 rounded text-slate-100"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

import { FormConfig, FormField } from '../../types/form';

export interface AngularSignalCodeResult {
  tsCode: string;
  htmlCode: string;
  combinedCode: string;
}

/**
 * Generates official Angular Signal Forms code following the modern Angular architecture
 * as documented on https://angular.dev/essentials/signal-forms:
 * - Model-first approach using signal<T>()
 * - form() helper from @angular/forms/signals
 * - Schema-based declarative validation (required, minLength, maxLength, email, min, max, pattern, validateTree, applyWhen)
 * - [formField] directive binding in template
 * - Reactive field state signals: field().touched, field().dirty, field().valid, field().errors()
 * - submit() helper from @angular/forms/signals
 */
export function generateAngularSignalCode(config: FormConfig): AngularSignalCodeResult {
  const isMultiStep = config.layoutType === 'multi-step';
  const componentName = `${toPascalCase(config.id)}SignalFormComponent`;
  const modelInterfaceName = `${toPascalCase(config.id)}FormData`;

  // Collect form fields, steps, and formarray repeaters
  const formArrayFields: FormField[] = [];
  const steps: FormField[] = [];
  const flattenedFields: FormField[] = [];

  for (const f of config.fields) {
    if (f.type === 'step') {
      steps.push(f);
      if (f.children) {
        flattenedFields.push(...f.children);
      }
    } else {
      flattenedFields.push(f);
      if (f.type === 'formarray') {
        formArrayFields.push(f);
      }
    }
  }

  // Cross-field validations
  const passwordConfirmField = flattenedFields.find((f) => f.validation?.passwordConfirmFieldId);
  const passwordSourceField = passwordConfirmField
    ? flattenedFields.find((f) => f.id === passwordConfirmField.validation?.passwordConfirmFieldId)
    : null;

  // Build TypeScript Model Interface properties
  const regularFields = flattenedFields.filter((f) => f.type !== 'formarray');
  const modelProperties: string[] = [];

  for (const f of regularFields) {
    modelProperties.push(`  ${f.name}: ${getFieldTypeScriptType(f)};`);
  }

  for (const fa of formArrayFields) {
    const childProps = fa.children || [];
    const itemProps = childProps.map((c) => `    ${c.name}: ${getFieldTypeScriptType(c)};`).join('\n');
    modelProperties.push(`  ${fa.name}: Array<{\n    id: string;\n${itemProps}\n  }>;`);
  }

  // Build Default Values Object for signal<T>
  const defaultValues: string[] = [];

  for (const f of regularFields) {
    defaultValues.push(`    ${f.name}: ${getSignalDefaultValue(f)}`);
  }

  for (const fa of formArrayFields) {
    const initialCount = fa.arrayConfig?.initialItemsCount ?? 1;
    const childInits = (fa.children || [])
      .map((c) => `        ${c.name}: ${getSignalDefaultValue(c)}`)
      .join(',\n');

    const initialRows = Array.from({ length: initialCount })
      .map((_, i) => `      {\n        id: 'item_${i + 1}',\n${childInits}\n      }`)
      .join(',\n');

    defaultValues.push(`    ${fa.name}: [\n${initialRows}\n    ]`);
  }

  // Build Schema Validation Rules
  const schemaValidators: string[] = [];

  for (const field of regularFields) {
    const rules = field.validation;
    if (!rules) continue;

    if (rules.required) {
      const msg = rules.requiredMessage || `${field.label} is required`;
      schemaValidators.push(`    required(schema.${field.name}, { message: '${escapeQuote(msg)}' });`);
    }

    if (rules.minLength && (field.type === 'text' || field.type === 'password' || field.type === 'textarea')) {
      schemaValidators.push(
        `    minLength(schema.${field.name}, ${rules.minLength}, { message: 'Minimum length is ${rules.minLength} characters' });`
      );
    }

    if (rules.maxLength && (field.type === 'text' || field.type === 'password' || field.type === 'textarea')) {
      schemaValidators.push(
        `    maxLength(schema.${field.name}, ${rules.maxLength}, { message: 'Maximum length is ${rules.maxLength} characters' });`
      );
    }

    if (rules.emailValidator || field.type === 'email') {
      schemaValidators.push(
        `    email(schema.${field.name}, { message: 'Please enter a valid email address' });`
      );
    }

    if (rules.min !== undefined && (field.type === 'number' || field.type === 'slider' || field.type === 'rating')) {
      schemaValidators.push(
        `    min(schema.${field.name}, ${rules.min}, { message: 'Minimum value is ${rules.min}' });`
      );
    }

    if (rules.max !== undefined && (field.type === 'number' || field.type === 'slider' || field.type === 'rating')) {
      schemaValidators.push(
        `    max(schema.${field.name}, ${rules.max}, { message: 'Maximum value is ${rules.max}' });`
      );
    }

    if (rules.pattern) {
      const patternMsg = rules.patternMessage || 'Invalid input format';
      schemaValidators.push(
        `    pattern(schema.${field.name}, '${escapeQuote(rules.pattern)}', { message: '${escapeQuote(patternMsg)}' });`
      );
    }

    // Conditional rule validation with applyWhen()
    if (field.conditional?.enabled) {
      const dep = field.conditional;
      const depField = flattenedFields.find((f) => f.id === dep.fieldId);
      const depName = depField ? depField.name : dep.fieldId;
      let condExpr = `data.${depName}`;

      if (dep.operator === 'equals') {
        condExpr = `data.${depName} === '${escapeQuote(dep.value)}'`;
      } else if (dep.operator === 'notEquals') {
        condExpr = `data.${depName} !== '${escapeQuote(dep.value)}'`;
      } else if (dep.operator === 'isTruthy') {
        condExpr = `Boolean(data.${depName})`;
      }

      schemaValidators.push(`    applyWhen(
      (data) => ${condExpr},
      () => {
        required(schema.${field.name}, { message: '${escapeQuote(field.label)} is required' });
      }
    );`);
    }
  }

  // Cross-Field validation using validateTree()
  if (passwordConfirmField && passwordSourceField) {
    schemaValidators.push(`    // Cross-field validation (confirm password)
    validateTree(schema, (data) => {
      if (data.${passwordSourceField.name} && data.${passwordConfirmField.name} && data.${passwordSourceField.name} !== data.${passwordConfirmField.name}) {
        return {
          field: schema.${passwordConfirmField.name},
          message: '${escapeQuote(passwordConfirmField.validation?.requiredMessage || 'Passwords do not match')}'
        };
      }
      return null;
    });`);
  }

  // FormArray repeater helper methods
  const formArrayMethods: string[] = [];
  for (const fa of formArrayFields) {
    const childInits = (fa.children || [])
      .map((c) => `        ${c.name}: ${getSignalDefaultValue(c)}`)
      .join(',\n');

    formArrayMethods.push(`  // Repeater item management for "${fa.label}"
  add${toPascalCase(fa.name)}(): void {
    ${fa.arrayConfig?.maxItems ? `if (this.formData().${fa.name}.length >= ${fa.arrayConfig.maxItems}) return;` : ''}
    this.formData.update(model => ({
      ...model,
      ${fa.name}: [
        ...model.${fa.name},
        {
          id: 'item_' + Date.now(),
${childInits}
        }
      ]
    }));
  }

  remove${toPascalCase(fa.name)}(index: number): void {
    ${fa.arrayConfig?.minItems ? `if (this.formData().${fa.name}.length <= ${fa.arrayConfig.minItems}) return;` : ''}
    this.formData.update(model => ({
      ...model,
      ${fa.name}: model.${fa.name}.filter((_, i) => i !== index)
    }));
  }`);
  }

  // Multi-step headers & step definitions
  const stepTitles = steps.map((s, idx) => `'${s.stepTitle || `Step ${idx + 1}`}'`).join(', ');

  const tsCode = `import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  form,
  FormField,
  required,
  minLength,
  maxLength,
  min,
  max,
  email,
  pattern,
  validate,
  validateTree,
  applyWhen,
  submit
} from '@angular/forms/signals';

/**
 * Data Model for ${config.title}
 * Follows official Angular Signal Forms architecture (https://angular.dev/essentials/signal-forms)
 */
export interface ${modelInterfaceName} {
${modelProperties.join('\n')}
}

@Component({
  selector: 'app-${config.id}-signal-form',
  standalone: true,
  imports: [CommonModule, FormField],
  templateUrl: './${config.id}-signal.component.html',
  styleUrls: ['./${config.id}-signal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ${componentName} {
  // 1. Data Model Signal (Single source of truth)
  readonly formData = signal<${modelInterfaceName}>({
${defaultValues.join(',\n')}
  });

  // 2. Official Angular Signal Form with Declarative Schema
  readonly form = form(this.formData, (schema) => {
${schemaValidators.join('\n\n')}
  });

  // UI state signals
  readonly submittedPayload = signal<${modelInterfaceName} | null>(null);
  readonly submissionError = signal<string | null>(null);

  ${isMultiStep ? `// Multi-Step Wizard State
  readonly steps = [${stepTitles}];
  readonly currentStep = signal(0);
  readonly isLastStep = computed(() => this.currentStep() === this.steps.length - 1);
  readonly isFirstStep = computed(() => this.currentStep() === 0);

  nextStep(): void {
    if (this.currentStep() < this.steps.length - 1) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 0) {
      this.currentStep.update(s => s - 1);
    }
  }
` : ''}
${formArrayMethods.join('\n\n')}

  // 3. Form Submission via official submit() helper
  async onSubmit(event?: Event): Promise<void> {
    if (event) event.preventDefault();

    this.submissionError.set(null);

    await submit(this.form, async () => {
      // Runs automatically once form validation passes
      const payload = this.formData();
      console.log('[Angular Signal Forms] Valid Payload Submitted:', payload);
      this.submittedPayload.set(payload);
    });

    if (this.form().invalid) {
      this.submissionError.set('Please resolve highlighted form validation errors.');
    }
  }

  // Reset form model to initial state
  onReset(): void {
    this.formData.set({
${defaultValues.join(',\n')}
    });
    ${isMultiStep ? 'this.currentStep.set(0);' : ''}
    this.submittedPayload.set(null);
    this.submissionError.set(null);
  }
}
`;

  // Build HTML Template with [formField]
  let bodyHtml = '';

  if (isMultiStep) {
    bodyHtml = `
  <!-- Multi-Step Header Indicator -->
  <nav aria-label="Progress" class="mb-8">
    <ol role="list" class="flex items-center justify-between border-b border-slate-800 pb-4">
      @for (step of steps; track $index; let i = $index) {
        <li class="flex items-center gap-3">
          <span
            class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-colors"
            [class.bg-rose-600]="currentStep() === i"
            [class.text-white]="currentStep() === i"
            [class.bg-emerald-950]="currentStep() > i"
            [class.text-emerald-400]="currentStep() > i"
            [class.bg-slate-800]="currentStep() < i"
            [class.text-slate-400]="currentStep() < i"
          >
            {{ currentStep() > i ? '✓' : (i + 1) }}
          </span>
          <span
            class="text-xs font-medium"
            [class.text-white]="currentStep() === i"
            [class.text-slate-400]="currentStep() !== i"
          >
            {{ step }}
          </span>
        </li>
      }
    </ol>
  </nav>

  <form (submit)="onSubmit($event)" class="space-y-6">
    @switch (currentStep()) {
${steps
  .map(
    (step, idx) => `      @case (${idx}) {
        <div class="space-y-4">
          <div class="border-b border-slate-800 pb-2 mb-4">
            <h3 class="text-base font-semibold text-white">${escapeHtml(step.stepTitle || `Step ${idx + 1}`)}</h3>
            ${step.stepDescription ? `<p class="text-xs text-slate-400 mt-0.5">${escapeHtml(step.stepDescription)}</p>` : ''}
          </div>
          <div class="grid grid-cols-12 gap-4">
${step.children?.map((c) => renderOfficialSignalFieldHtml(c, '            ')).join('\n') || ''}
          </div>
        </div>
      }`
  )
  .join('\n')}
    }

    <!-- Stepper Navigation Controls -->
    <div class="pt-6 border-t border-slate-800 flex items-center justify-between">
      <div>
        @if (!isFirstStep()) {
          <button
            type="button"
            (click)="prevStep()"
            class="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ← Previous Step
          </button>
        }
      </div>

      <div class="flex items-center gap-3">
        ${
          config.showResetButton
            ? `<button
          type="button"
          (click)="onReset()"
          class="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          ${escapeHtml(config.resetButtonText || 'Reset')}
        </button>`
            : ''
        }

        @if (!isLastStep()) {
          <button
            type="button"
            (click)="nextStep()"
            class="px-5 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-500 transition-colors"
          >
            Next Step →
          </button>
        } @else {
          <button
            type="submit"
            [disabled]="form().submitting"
            class="px-6 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-500 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            @if (form().submitting) {
              <span>Submitting...</span>
            } @else {
              <span>${escapeHtml(config.submitButtonText)}</span>
            }
          </button>
        }
      </div>
    </div>
  </form>`;
  } else {
    // Single page layout
    bodyHtml = `
  <form (submit)="onSubmit($event)" class="space-y-6">
    <div class="grid grid-cols-12 gap-4">
${config.fields.map((f) => renderOfficialSignalFieldHtml(f, '      ')).join('\n')}
    </div>

    <!-- Form Action Buttons -->
    <div class="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
      ${
        config.showResetButton
          ? `<button
        type="button"
        (click)="onReset()"
        class="px-4 py-2 text-xs font-medium text-slate-400 bg-slate-900/60 border border-slate-800 rounded-lg hover:text-slate-200 hover:bg-slate-900 transition-colors"
      >
        ${escapeHtml(config.resetButtonText || 'Reset')}
      </button>`
          : ''
      }

      <button
        type="submit"
        [disabled]="form().submitting"
        class="px-5 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-500 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
      >
        @if (form().submitting) {
          <span>Submitting...</span>
        } @else {
          <span>${escapeHtml(config.submitButtonText)}</span>
        }
      </button>
    </div>
  </form>`;
  }

  const htmlCode = `<div class="max-w-3xl mx-auto p-6 sm:p-8 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 shadow-2xl">
  <!-- Form Header -->
  <div class="mb-6 pb-4 border-b border-slate-800/80">
    <div class="flex items-center gap-2 mb-1">
      <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/40 font-semibold">
        @angular/forms/signals
      </span>
      <span class="text-[11px] text-slate-500 font-mono">Official Angular Signal Forms (angular.dev/essentials/signal-forms)</span>
    </div>
    <h2 class="text-xl font-bold tracking-tight text-white">${escapeHtml(config.title)}</h2>
    <p class="text-xs text-slate-400 mt-1">${escapeHtml(config.description)}</p>
  </div>

  @if (submissionError()) {
    <div class="mb-6 p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
      <span>⚠️</span>
      <span>{{ submissionError() }}</span>
    </div>
  }
${bodyHtml}

  <!-- Submission Output Feedback -->
  @if (submittedPayload()) {
    <div class="mt-8 p-4 bg-emerald-950/40 border border-emerald-800 rounded-xl">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
          <span>✓</span> Successfully Submitted via Angular Signal Forms submit()
        </span>
        <button
          type="button"
          (click)="submittedPayload.set(null)"
          class="text-xs text-emerald-500 hover:text-emerald-300"
        >
          Dismiss
        </button>
      </div>
      <pre class="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-emerald-200 overflow-x-auto border border-emerald-900/60">
{{ submittedPayload() | json }}
      </pre>
    </div>
  }
</div>
`;

  return {
    tsCode,
    htmlCode,
    combinedCode: `${tsCode}\n\n/* ================= HTML TEMPLATE ================= */\n\n${htmlCode}`,
  };
}

// ---------------- Official [formField] Template Generator ----------------

function renderOfficialSignalFieldHtml(field: FormField, indent: string = ''): string {
  const colClass = `col-span-${field.colSpan || 12}`;
  const labelStyleAttr = field.labelColor ? ` [style.color]="'${escapeHtml(field.labelColor)}'"` : '';
  const borderStyleAttr = field.borderColor ? ` [style.border-color]="'${escapeHtml(field.borderColor)}'"` : '';
  const textStyleAttr = field.textColor ? ` [style.color]="'${escapeHtml(field.textColor)}'"` : '';
  const placeholderStyleAttr = field.placeholderColor ? ` [style.--placeholder-color]="'${escapeHtml(field.placeholderColor)}'"` : '';
  const controlStyleAttrs = `${borderStyleAttr}${textStyleAttr}${placeholderStyleAttr}`;

  // FormArray Repeater in Signal Forms
  if (field.type === 'formarray') {
    const arrayName = field.name;
    const pascal = toPascalCase(arrayName);
    return `${indent}<!-- Repeater Field Array: ${field.label} -->
${indent}<div class="col-span-12 space-y-3 pt-2">
${indent}  <div class="flex items-center justify-between">
${indent}    <div>
${indent}      <label class="text-xs font-semibold uppercase tracking-wider text-slate-300"${labelStyleAttr}>${escapeHtml(field.label)}</label>
${indent}      <p class="text-[10px] text-slate-500">Bound to signal model array with [formField]</p>
${indent}    </div>
${indent}    <button
${indent}      type="button"
${indent}      (click)="add${pascal}()"
${indent}      class="px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 rounded hover:bg-emerald-900/50 transition-colors"
${indent}    >
${indent}      + ${escapeHtml(field.arrayConfig?.addButtonText || 'Add Entry')}
${indent}    </button>
${indent}  </div>
${indent}  <div class="space-y-3">
${indent}    @for (item of formData().${arrayName}; track item.id; let i = $index) {
${indent}      <div class="p-3 bg-slate-900 border border-slate-800 rounded-lg relative"${borderStyleAttr}>
${indent}        <div class="flex items-center justify-between mb-2">
${indent}          <span class="text-xs font-medium text-slate-400">${escapeHtml(field.arrayConfig?.itemLabel || 'Item')} #{{ i + 1 }}</span>
${indent}          <button
${indent}            type="button"
${indent}            (click)="remove${pascal}(i)"
${indent}            class="text-xs text-rose-400 hover:text-rose-300 p-1"
${indent}            title="Remove item"
${indent}          >
${indent}            ✕ Remove
${indent}          </button>
${indent}        </div>
${indent}        <div class="grid grid-cols-12 gap-3">
${(field.children || [])
  .map(
    (c) => `${indent}          <div class="col-span-${c.colSpan || 12} space-y-1">
${indent}            <label class="block text-[11px] font-medium text-slate-300">${escapeHtml(c.label)}</label>
${indent}            <input
${indent}              type="${c.type === 'number' ? 'number' : 'text'}"
${indent}              [formField]="form.${arrayName}[i].${c.name}"
${indent}              class="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-rose-500"
${indent}            />
${indent}          </div>`
  )
  .join('\n')}
${indent}        </div>
${indent}      </div>
${indent}    }
${indent}  </div>
${indent}</div>`;
  }

  // Specific control types using [formField]
  let controlInputHtml = '';

  switch (field.type) {
    case 'textarea':
      controlInputHtml = `<textarea
  [formField]="form.${field.name}"
  placeholder="${escapeHtml(field.placeholder || '')}"
  rows="3"${controlStyleAttrs}
  class="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
  [class.border-rose-500]="form.${field.name}().touched && form.${field.name}().invalid"
></textarea>`;
      break;

    case 'select':
      controlInputHtml = `<select
  [formField]="form.${field.name}"${borderStyleAttr}${textStyleAttr}
  class="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
  [class.border-rose-500]="form.${field.name}().touched && form.${field.name}().invalid"
>
  <option value="" disabled selected>${escapeHtml(field.placeholder || 'Select option')}</option>
${(field.options || [])
  .map(
    (opt) =>
      `  <option value="${escapeHtml(opt.value)}">${escapeHtml(opt.label)}</option>`
  )
  .join('\n')}
</select>`;
      break;

    case 'checkbox':
      return `${indent}<div class="${colClass} flex items-start gap-2 pt-2">
${indent}  <input
${indent}    type="checkbox"
${indent}    id="${field.id}"
${indent}    [formField]="form.${field.name}"${borderStyleAttr}
${indent}    class="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500/20"
${indent}  />
${indent}  <div>
${indent}    <label for="${field.id}" class="text-xs text-slate-300 cursor-pointer select-none"${labelStyleAttr}>
${indent}      ${escapeHtml(field.label)}
${field.validation?.required ? '<span class="text-rose-400 ml-0.5">*</span>' : ''}
${indent}    </label>
${field.helperText ? `${indent}    <p class="text-[10px] text-slate-500">${escapeHtml(field.helperText)}</p>` : ''}
${indent}    @if (form.${field.name}().touched && form.${field.name}().errors()?.length) {
${indent}      <p class="text-[11px] text-rose-400 mt-1">{{ form.${field.name}().errors()![0].message }}</p>
${indent}    }
${indent}  </div>
${indent}</div>`;

    case 'switch':
      return `${indent}<div class="${colClass} flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-lg"${borderStyleAttr}>
${indent}  <div>
${indent}    <label class="text-xs font-medium text-slate-200 cursor-pointer select-none"${labelStyleAttr}>${escapeHtml(field.label)}</label>
${field.helperText ? `${indent}    <p class="text-[10px] text-slate-500">${escapeHtml(field.helperText)}</p>` : ''}
${indent}  </div>
${indent}  <input
${indent}    type="checkbox"
${indent}    [formField]="form.${field.name}"
${indent}    class="h-4 w-4 rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500/20"
${indent}  />
${indent}</div>`;

    case 'radio':
      controlInputHtml = `<div class="space-y-2 pt-1">
${(field.options || [])
  .map(
    (opt) => `  <label class="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
    <input
      type="radio"
      [formField]="form.${field.name}"
      value="${escapeHtml(opt.value)}"${borderStyleAttr}
      class="text-rose-600 focus:ring-rose-500"
    />
    <span>${escapeHtml(opt.label)}</span>
  </label>`
  )
  .join('\n')}
</div>`;
      break;

    case 'slider':
      controlInputHtml = `<div class="space-y-1">
  <div class="flex justify-between text-[11px] text-slate-400">
    <span>Current: {{ formData().${field.name} }}</span>
    <span>Max: ${field.validation?.max ?? 100}</span>
  </div>
  <input
    type="range"
    [formField]="form.${field.name}"
    class="w-full accent-rose-600"${field.borderColor ? ` [style.accent-color]="'${escapeHtml(field.borderColor)}'"` : ''}
  />
</div>`;
      break;

    case 'rating':
      controlInputHtml = `<div class="flex items-center gap-1.5 py-1">
  @for (star of [1, 2, 3, 4, 5]; track star) {
    <button
      type="button"
      (click)="formData.update(m => ({ ...m, ${field.name}: star }))"
      class="text-lg transition-transform hover:scale-110"
      [class.text-amber-400]="formData().${field.name} >= star"
      [class.text-slate-600]="formData().${field.name} < star"
    >
      ★
    </button>
  }
</div>`;
      break;

    default: {
      const inputType =
        field.type === 'email'
          ? 'email'
          : field.type === 'password'
          ? 'password'
          : field.type === 'number'
          ? 'number'
          : field.type === 'datepicker'
          ? 'date'
          : field.type === 'file'
          ? 'file'
          : 'text';

      controlInputHtml = `<input
  type="${inputType}"
  [formField]="form.${field.name}"
  placeholder="${escapeHtml(field.placeholder || '')}"${controlStyleAttrs}
  class="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
  [class.border-rose-500]="form.${field.name}().touched && form.${field.name}().invalid"
/>`;
      break;
    }
  }

  // Wrap in label, helper text, and validation message container
  let output = `${indent}<!-- Field: ${field.label} -->
${indent}<div class="${colClass} space-y-1.5">
${indent}  <div class="flex items-center justify-between">
${indent}    <label class="text-xs font-medium text-slate-200"${labelStyleAttr}>
${indent}      ${escapeHtml(field.label)}
${field.validation?.required ? '<span class="text-rose-400 ml-0.5">*</span>' : ''}
${indent}    </label>
${field.helperText ? `${indent}    <span class="text-[10px] text-slate-500 font-mono">${escapeHtml(field.helperText)}</span>` : ''}
${indent}  </div>
${indent}  ${controlInputHtml}
${indent}  @if (form.${field.name}().touched && form.${field.name}().errors()?.length) {
${indent}    <p class="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
${indent}      <span>✕</span>
${indent}      <span>{{ form.${field.name}().errors()![0].message }}</span>
${indent}    </p>
${indent}  }
${indent}</div>`;

  // Wrap in conditional if enabled
  if (field.conditional?.enabled) {
    const cond = field.conditional;
    let condExpression = `formData().${cond.fieldId}`;

    if (cond.operator === 'equals') {
      condExpression = `formData().${cond.fieldId} === '${escapeHtml(cond.value)}'`;
    } else if (cond.operator === 'notEquals') {
      condExpression = `formData().${cond.fieldId} !== '${escapeHtml(cond.value)}'`;
    } else if (cond.operator === 'isTruthy') {
      condExpression = `Boolean(formData().${cond.fieldId})`;
    }

    output = `${indent}@if (${condExpression}) {
${output}
${indent}}`;
  }

  return output;
}

// ---------------- Helper Utility Functions ----------------

function getSignalDefaultValue(field: FormField): string {
  if (field.defaultValue !== undefined) {
    if (typeof field.defaultValue === 'string') return `'${escapeQuote(field.defaultValue)}'`;
    if (typeof field.defaultValue === 'boolean') return `${field.defaultValue}`;
    if (typeof field.defaultValue === 'number') return `${field.defaultValue}`;
    return JSON.stringify(field.defaultValue);
  }

  if (field.type === 'checkbox' || field.type === 'switch') return 'false';
  if (field.type === 'number' || field.type === 'slider') return `${field.validation?.min ?? 0}`;
  if (field.type === 'rating') return '0';
  if (field.type === 'multiselect') return '[]';
  return "''";
}

function getFieldTypeScriptType(field: FormField): string {
  if (field.type === 'checkbox' || field.type === 'switch') return 'boolean';
  if (field.type === 'number' || field.type === 'slider' || field.type === 'rating') return 'number';
  if (field.type === 'multiselect') return 'string[]';
  return 'string';
}

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeQuote(str: string): string {
  if (!str) return '';
  return str.replace(/'/g, "\\'");
}

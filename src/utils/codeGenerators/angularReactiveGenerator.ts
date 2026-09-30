import { FormConfig, FormField } from '../../types/form';

export interface AngularReactiveCodeResult {
  tsCode: string;
  htmlCode: string;
  combinedCode: string;
}

export function generateAngularReactiveCode(config: FormConfig): AngularReactiveCodeResult {
  const isMultiStep = config.layoutType === 'multi-step';
  const componentName = `${toPascalCase(config.id)}FormComponent`;

  // Find form array fields
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

  // Cross-field validators
  const hasPasswordConfirm = flattenedFields.some(f => f.validation?.passwordConfirmFieldId);

  // Build TS Control Definitions
  const controlDefs: string[] = [];

  function buildControlInit(field: FormField): string {
    if (field.type === 'formarray') {
      const childInits = field.children?.map(c => `        ${c.name}: [${getDefaultValueString(c)}, ${getValidatorsArray(c)}]`).join(',\n') || '';
      const initialCount = field.arrayConfig?.initialItemsCount ?? 1;
      const initialPushStatements = Array.from({ length: initialCount })
        .map(() => `      this.fb.group({\n${childInits}\n      })`)
        .join(',\n');

      return `    ${field.name}: this.fb.array([\n${initialPushStatements}\n    ])`;
    }

    if (field.type === 'fieldgroup' && field.children) {
      const groupInits = field.children.map(c => `      ${c.name}: [${getDefaultValueString(c)}, ${getValidatorsArray(c)}]`).join(',\n');
      return `    ${field.name}: this.fb.group({\n${groupInits}\n    })`;
    }

    return `    ${field.name}: [${getDefaultValueString(field)}, ${getValidatorsArray(field)}]`;
  }

  if (isMultiStep) {
    for (const step of steps) {
      if (step.children) {
        for (const child of step.children) {
          controlDefs.push(buildControlInit(child));
        }
      }
    }
  } else {
    for (const field of config.fields) {
      controlDefs.push(buildControlInit(field));
    }
  }

  // FormArray helper methods
  const formArrayMethods: string[] = [];
  for (const fa of formArrayFields) {
    const childInits = fa.children?.map(c => `      ${c.name}: [${getDefaultValueString(c)}, ${getValidatorsArray(c)}]`).join(',\n') || '';
    const faName = fa.name;
    const pascalName = toPascalCase(faName);

    formArrayMethods.push(`
  // Dynamic FormArray helpers for "${fa.label}"
  get ${faName}Array(): FormArray {
    return this.form.get('${faName}') as FormArray;
  }

  create${pascalName}Item(): FormGroup {
    return this.fb.group({
${childInits}
    });
  }

  add${pascalName}() {
    ${fa.arrayConfig?.maxItems ? `if (this.${faName}Array.length >= ${fa.arrayConfig.maxItems}) return;` : ''}
    this.${faName}Array.push(this.create${pascalName}Item());
  }

  remove${pascalName}(index: number) {
    ${fa.arrayConfig?.minItems ? `if (this.${faName}Array.length <= ${fa.arrayConfig.minItems}) return;` : ''}
    this.${faName}Array.removeAt(index);
  }
`);
  }

  // Multi-step helpers
  const stepTitles = steps.map((s, idx) => `'${s.stepTitle || `Step ${idx + 1}`}'`).join(', ');

  const tsCode = `import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';

@Component({
  selector: 'app-${config.id}-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './${config.id}-form.component.html',
  styleUrls: ['./${config.id}-form.component.css']
})
export class ${componentName} {
  private readonly fb = inject(FormBuilder);

  // Reactive state signals
  readonly isSubmitting = signal(false);
  readonly submittedData = signal<Record<string, any> | null>(null);
  readonly errorMessage = signal<string | null>(null);

  ${isMultiStep ? `// Multi-step Wizard Management
  readonly steps = [${stepTitles}];
  readonly currentStep = signal(0);
  readonly isLastStep = computed(() => this.currentStep() === this.steps.length - 1);
  readonly isFirstStep = computed(() => this.currentStep() === 0);
` : ''}
  // Typed Reactive Form Definition
  readonly form: FormGroup = this.fb.group({
${controlDefs.join(',\n')}
  }${hasPasswordConfirm ? `, { validators: [this.passwordMatchValidator()] }` : ''});

${formArrayMethods.join('\n')}
  ${isMultiStep ? `// Multi-Step Navigation Handlers
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
  // Form submission handler
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Please resolve highlighted form validation errors.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    // Simulate async API payload submission
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.submittedData.set(this.form.value);
      console.log('[NgFormCraft] Submission Payload:', this.form.value);
    }, 600);
  }

  // Reset form handler
  onReset(): void {
    this.form.reset();
    ${isMultiStep ? 'this.currentStep.set(0);' : ''}
    this.submittedData.set(null);
    this.errorMessage.set(null);
  }

  ${hasPasswordConfirm ? `// Cross-field Custom Validator for Password Confirmation
  private passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password')?.value;
      const confirm = control.get('confirmPassword')?.value;
      if (!password || !confirm) return null;
      return password === confirm ? null : { passwordMismatch: true };
    };
  }
` : ''}
  // Field-level error detection helper
  hasError(controlName: string, errorType?: string): boolean {
    const ctrl = this.form.get(controlName);
    if (!ctrl || !(ctrl.dirty || ctrl.touched)) return false;
    return errorType ? ctrl.hasError(errorType) : ctrl.invalid;
  }
}
`;

  // Build HTML Template
  let bodyHtml = '';

  if (isMultiStep) {
    bodyHtml = `
  <!-- Multi-Step Header Stepper Indicator -->
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

  <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
    @switch (currentStep()) {
${steps.map((step, idx) => `      @case (${idx}) {
        <div class="space-y-4">
          <div class="border-b border-slate-800 pb-2 mb-4">
            <h3 class="text-base font-semibold text-white">${escapeHtml(step.stepTitle || `Step ${idx + 1}`)}</h3>
            ${step.stepDescription ? `<p class="text-xs text-slate-400 mt-0.5">${escapeHtml(step.stepDescription)}</p>` : ''}
          </div>
          <div class="grid grid-cols-12 gap-4">
${step.children?.map(c => renderFieldHtml(c, '            ')).join('\n') || ''}
          </div>
        </div>
      }`).join('\n')}
    }

    <!-- Stepper Action Bar -->
    <div class="flex items-center justify-between pt-6 border-t border-slate-800">
      <button
        type="button"
        (click)="prevStep()"
        [disabled]="isFirstStep()"
        class="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors"
      >
        Previous Step
      </button>

      @if (!isLastStep()) {
        <button
          type="button"
          (click)="nextStep()"
          class="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-500 transition-colors"
        >
          Continue to Next Step
        </button>
      } @else {
        <button
          type="submit"
          [disabled]="isSubmitting()"
          class="px-5 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-500 disabled:opacity-50 transition-colors"
        >
          {{ isSubmitting() ? 'Submitting...' : '${escapeHtml(config.submitButtonText)}' }}
        </button>
      }
    </div>
  </form>
`;
  } else {
    bodyHtml = `
  <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
    <div class="grid grid-cols-12 gap-4">
${config.fields.map(f => renderFieldHtml(f, '      ')).join('\n')}
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
      ${config.showResetButton ? `<button
        type="button"
        (click)="onReset()"
        class="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
      >
        ${escapeHtml(config.resetButtonText || 'Reset')}
      </button>` : ''}
      <button
        type="submit"
        [disabled]="isSubmitting()"
        class="px-5 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-500 disabled:opacity-50 transition-colors"
      >
        {{ isSubmitting() ? 'Processing...' : '${escapeHtml(config.submitButtonText)}' }}
      </button>
    </div>
  </form>
`;
  }

  const htmlCode = `<!-- Angular Standalone Form Component Template -->
<div class="max-w-3xl mx-auto p-6 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 shadow-xl">
  <!-- Header Title -->
  <div class="mb-6">
    <h2 class="text-xl font-bold tracking-tight text-white">${escapeHtml(config.title)}</h2>
    <p class="text-xs text-slate-400 mt-1">${escapeHtml(config.description)}</p>
  </div>

  @if (errorMessage()) {
    <div class="mb-4 p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-200 text-xs flex items-center justify-between">
      <span>{{ errorMessage() }}</span>
      <button type="button" (click)="errorMessage.set(null)" class="text-rose-400 hover:text-white">✕</button>
    </div>
  }

  @if (submittedData()) {
    <div class="mb-6 p-4 rounded-lg bg-emerald-950/40 border border-emerald-800/80 text-emerald-200 text-xs">
      <div class="font-semibold text-sm mb-2 text-emerald-300">✓ Form Successfully Submitted</div>
      <pre class="bg-black/40 p-2 rounded text-[11px] font-mono overflow-x-auto">{{ submittedData() | json }}</pre>
    </div>
  }
${bodyHtml}
</div>
`;

  return {
    tsCode,
    htmlCode,
    combinedCode: `// ================= ${config.id}-form.component.ts =================\n\n${tsCode}\n\n<!-- ================= ${config.id}-form.component.html ================= -->\n\n${htmlCode}`,
  };
}

function renderFieldHtml(field: FormField, indent: string = '      '): string {
  const span = field.colSpan || 12;
  const colClass = `col-span-12 sm:col-span-${span}`;
  const labelStyleAttr = field.labelColor ? ` [style.color]="'${escapeHtml(field.labelColor)}'"` : '';
  const borderStyleAttr = field.borderColor ? ` [style.border-color]="'${escapeHtml(field.borderColor)}'"` : '';
  const textStyleAttr = field.textColor ? ` [style.color]="'${escapeHtml(field.textColor)}'"` : '';
  const placeholderStyleAttr = field.placeholderColor ? ` [style.--placeholder-color]="'${escapeHtml(field.placeholderColor)}'"` : '';
  const controlStyleAttrs = `${borderStyleAttr}${textStyleAttr}${placeholderStyleAttr}`;

  if (field.type === 'formarray') {
    const arrayName = field.name;
    const pascal = toPascalCase(arrayName);
    return `${indent}<!-- FormArray Repeater: ${field.label} -->
${indent}<div class="col-span-12 space-y-3 pt-2">
${indent}  <div class="flex items-center justify-between">
${indent}    <label class="text-xs font-semibold uppercase tracking-wider text-slate-300"${labelStyleAttr}>${escapeHtml(field.label)}</label>
${indent}    <button
${indent}      type="button"
${indent}      (click)="add${pascal}()"
${indent}      class="px-2.5 py-1 text-xs font-medium text-rose-400 bg-rose-950/40 border border-rose-800/50 rounded hover:bg-rose-900/50 transition-colors"
${indent}    >
${indent}      + ${escapeHtml(field.arrayConfig?.addButtonText || 'Add Entry')}
${indent}    </button>
${indent}  </div>
${indent}  <div formArrayName="${arrayName}" class="space-y-3">
${indent}    @for (item of ${arrayName}Array.controls; track $index; let i = $index) {
${indent}      <div [formGroupName]="i" class="p-3 bg-slate-900 border border-slate-800 rounded-lg relative"${borderStyleAttr}>
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
${field.children?.map(c => renderFieldHtml(c, indent + '          ')).join('\n') || ''}
${indent}        </div>
${indent}      </div>
${indent}    }
${indent}  </div>
${indent}</div>`;
  }

  // Common inputs
  let controlInputHtml = '';

  switch (field.type) {
    case 'textarea':
      controlInputHtml = `<textarea
  formControlName="${field.name}"
  placeholder="${escapeHtml(field.placeholder || '')}"
  rows="3"${controlStyleAttrs}
  class="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
></textarea>`;
      break;

    case 'select':
      controlInputHtml = `<select
  formControlName="${field.name}"${borderStyleAttr}${textStyleAttr}
  class="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
>
  <option value="" disabled selected>${escapeHtml(field.placeholder || 'Select option')}</option>
${field.options?.map(opt => `  <option value="${escapeHtml(opt.value)}">${escapeHtml(opt.label)}</option>`).join('\n') || ''}
</select>`;
      break;

    case 'checkbox':
      return `${indent}<div class="${colClass} flex items-start gap-2 pt-2">
${indent}  <input
${indent}    type="checkbox"
${indent}    id="${field.id}"
${indent}    formControlName="${field.name}"${borderStyleAttr}
${indent}    class="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500/20"
${indent}  />
${indent}  <label for="${field.id}" class="text-xs text-slate-300 cursor-pointer select-none"${labelStyleAttr}>
${indent}    ${escapeHtml(field.label)}
${field.validation?.required ? '<span class="text-rose-400 ml-0.5">*</span>' : ''}
${indent}  </label>
${indent}</div>`;

    case 'switch':
      return `${indent}<div class="${colClass} flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-lg"${borderStyleAttr}>
${indent}  <label class="text-xs font-medium text-slate-200 cursor-pointer select-none"${labelStyleAttr}>${escapeHtml(field.label)}</label>
${indent}  <input
${indent}    type="checkbox"
${indent}    formControlName="${field.name}"
${indent}    class="h-4 w-4 rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500/20"
${indent}  />
${indent}</div>`;

    case 'radio':
      controlInputHtml = `<div class="space-y-2 pt-1">
${field.options?.map(opt => `  <label class="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
    <input type="radio" value="${escapeHtml(opt.value)}" formControlName="${field.name}" class="text-rose-600 focus:ring-rose-500" />
    <span>${escapeHtml(opt.label)}</span>
  </label>`).join('\n') || ''}
</div>`;
      break;

    case 'slider':
      controlInputHtml = `<input
  type="range"
  formControlName="${field.name}"
  min="${field.validation?.min ?? 0}"
  max="${field.validation?.max ?? 100}"
  class="w-full accent-rose-600"
/>`;
      break;

    case 'rating':
      controlInputHtml = `<div class="flex items-center gap-2">
  <input type="number" formControlName="${field.name}" min="1" max="5" class="w-20 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100" />
  <span class="text-xs text-slate-400">Stars (1-5)</span>
</div>`;
      break;

    default:
      // text, email, password, number, datepicker
      const inputType = field.type === 'datepicker' ? 'date' : field.type;
      controlInputHtml = `<input
  type="${inputType}"
  formControlName="${field.name}"
  placeholder="${escapeHtml(field.placeholder || '')}"${controlStyleAttrs}
  class="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
/>`;
      break;
  }

  return `${indent}<div class="${colClass} space-y-1.5">
${indent}  <label class="block text-xs font-medium text-slate-300"${labelStyleAttr}>
${indent}    ${escapeHtml(field.label)}
${field.validation?.required ? '<span class="text-rose-400 ml-0.5">*</span>' : ''}
${indent}  </label>
${indent}  ${controlInputHtml.replace(/\n/g, '\n' + indent + '  ')}
${field.helperText ? `${indent}  <p class="text-[11px] text-slate-500">${escapeHtml(field.helperText)}</p>` : ''}
${indent}  @if (hasError('${field.name}')) {
${indent}    <p class="text-[11px] text-rose-400 font-medium">Field validation requirement not met</p>
${indent}  }
${indent}</div>`;
}

function getDefaultValueString(field: FormField): string {
  if (field.defaultValue !== undefined) {
    if (typeof field.defaultValue === 'string') return `'${field.defaultValue}'`;
    if (typeof field.defaultValue === 'boolean') return `${field.defaultValue}`;
    if (typeof field.defaultValue === 'number') return `${field.defaultValue}`;
  }
  if (field.type === 'checkbox' || field.type === 'switch') return 'false';
  if (field.type === 'number' || field.type === 'slider' || field.type === 'rating') return '0';
  return "''";
}

function getValidatorsArray(field: FormField): string {
  const vals: string[] = [];
  if (field.validation?.required) vals.push('Validators.required');
  if (field.validation?.emailValidator || field.type === 'email') vals.push('Validators.email');
  if (field.validation?.minLength) vals.push(`Validators.minLength(${field.validation.minLength})`);
  if (field.validation?.maxLength) vals.push(`Validators.maxLength(${field.validation.maxLength})`);
  if (field.validation?.min !== undefined) vals.push(`Validators.min(${field.validation.min})`);
  if (field.validation?.max !== undefined) vals.push(`Validators.max(${field.validation.max})`);
  if (field.validation?.pattern) vals.push(`Validators.pattern('${field.validation.pattern}')`);

  if (vals.length === 0) return '[]';
  if (vals.length === 1) return `[${vals[0]}]`;
  return `[${vals.join(', ')}]`;
}

function toCamelCase(str: string): string {
  return str.replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
}

function toPascalCase(str: string): string {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function escapeHtml(str: string): string {
  return str.replace(/"/g, '&quot;');
}

import { FormConfig, FormSubmission, AngularProblemCase } from '../types/form';

export const PRESET_FORMS: Record<string, FormConfig> = {
  registration: {
    id: 'registration',
    title: 'User Registration & Security',
    description: 'Typed Angular Reactive Form featuring email validation, password confirmation cross-field validator, and role selector.',
    layoutType: 'single-page',
    submitButtonText: 'Create Account',
    showResetButton: true,
    resetButtonText: 'Reset Form',
    frameworkTarget: 'angular-reactive-signals',
    fields: [
      {
        id: 'f_fullname',
        name: 'fullName',
        label: 'Full Legal Name',
        type: 'text',
        placeholder: 'e.g. Alex Henderson',
        helperText: 'Your legal name as it appears on official documents',
        colSpan: 6,
        validation: {
          required: true,
          requiredMessage: 'Full name is required',
          minLength: 3,
        },
      },
      {
        id: 'f_username',
        name: 'username',
        label: 'Account Username',
        type: 'text',
        placeholder: 'alex_h',
        helperText: 'Must be between 4 and 20 alphanumeric characters',
        colSpan: 6,
        validation: {
          required: true,
          minLength: 4,
          maxLength: 20,
          pattern: '^[a-zA-Z0-9_]+$',
          patternMessage: 'Only letters, numbers, and underscores allowed',
        },
      },
      {
        id: 'f_email',
        name: 'email',
        label: 'Work Email Address',
        type: 'email',
        placeholder: 'alex@company.com',
        colSpan: 12,
        validation: {
          required: true,
          emailValidator: true,
          requiredMessage: 'Valid corporate email is required',
        },
      },
      {
        id: 'f_role',
        name: 'role',
        label: 'Primary Organization Role',
        type: 'select',
        placeholder: 'Choose role...',
        defaultValue: 'developer',
        colSpan: 6,
        options: [
          { label: 'Frontend Engineer', value: 'frontend' },
          { label: 'Fullstack / Angular Lead', value: 'lead' },
          { label: 'Product Designer', value: 'designer' },
          { label: 'DevOps / Architect', value: 'devops' },
        ],
        validation: { required: true },
      },
      {
        id: 'f_experience',
        name: 'yearsExperience',
        label: 'Years of Experience',
        type: 'number',
        defaultValue: 3,
        placeholder: '3',
        colSpan: 6,
        validation: {
          required: true,
          min: 0,
          max: 40,
        },
      },
      {
        id: 'f_password',
        name: 'password',
        label: 'Password',
        type: 'password',
        placeholder: '••••••••••••',
        colSpan: 6,
        validation: {
          required: true,
          minLength: 8,
          requiredMessage: 'Minimum 8 characters required',
        },
      },
      {
        id: 'f_password_confirm',
        name: 'confirmPassword',
        label: 'Confirm Password',
        type: 'password',
        placeholder: '••••••••••••',
        colSpan: 6,
        validation: {
          required: true,
          passwordConfirmFieldId: 'f_password',
          requiredMessage: 'Passwords must match',
        },
      },
      {
        id: 'f_newsletter',
        name: 'subscribeUpdates',
        label: 'Receive Product & Security Releases',
        type: 'switch',
        defaultValue: true,
        colSpan: 12,
      },
      {
        id: 'f_terms',
        name: 'agreeTerms',
        label: 'I accept the Enterprise Software Agreement and Data Policy',
        type: 'checkbox',
        defaultValue: false,
        colSpan: 12,
        validation: {
          required: true,
          requiredMessage: 'You must accept the terms before proceeding',
        },
      },
    ],
  },

  formArrayTeam: {
    id: 'formArrayTeam',
    title: 'Enterprise Team Directory (FormArray)',
    description: 'Solves Angular dynamic FormArray challenges: adds, removes, and validates repeating member entries with strict typing and @for trackBy.',
    layoutType: 'single-page',
    submitButtonText: 'Register Team Members',
    showResetButton: true,
    resetButtonText: 'Clear All',
    frameworkTarget: 'angular-reactive-signals',
    fields: [
      {
        id: 'f_org_name',
        name: 'organizationName',
        label: 'Department / Guild Name',
        type: 'text',
        placeholder: 'Core Platform Engineering',
        colSpan: 8,
        validation: { required: true },
      },
      {
        id: 'f_budget_code',
        name: 'costCenter',
        label: 'Cost Center Code',
        type: 'text',
        placeholder: 'CC-9021',
        colSpan: 4,
        validation: { required: true },
      },
      {
        id: 'f_members_array',
        name: 'members',
        label: 'Team Members (Dynamic FormArray)',
        type: 'formarray',
        colSpan: 12,
        arrayConfig: {
          itemLabel: 'Member',
          minItems: 1,
          maxItems: 8,
          addButtonText: 'Add Another Member',
          initialItemsCount: 2,
        },
        children: [
          {
            id: 'fa_name',
            name: 'name',
            label: 'Member Name',
            type: 'text',
            placeholder: 'Sarah Connor',
            colSpan: 4,
            validation: { required: true },
          },
          {
            id: 'fa_email',
            name: 'email',
            label: 'Email',
            type: 'email',
            placeholder: 'sarah@domain.com',
            colSpan: 4,
            validation: { required: true, emailValidator: true },
          },
          {
            id: 'fa_skill',
            name: 'skillLevel',
            label: 'Seniority Level',
            type: 'select',
            placeholder: 'Select...',
            colSpan: 4,
            defaultValue: 'senior',
            options: [
              { label: 'Junior', value: 'junior' },
              { label: 'Mid-Level', value: 'mid' },
              { label: 'Senior', value: 'senior' },
              { label: 'Staff / Principal', value: 'staff' },
            ],
            validation: { required: true },
          },
        ],
      },
    ],
  },

  multiStepWizard: {
    id: 'multiStepWizard',
    title: 'Client Project Scope & Quote Wizard',
    description: 'Multi-step wizard pattern solving step-by-step validation, step state preservation, and Angular Signal progress tracking.',
    layoutType: 'multi-step',
    submitButtonText: 'Submit Final Specification',
    showResetButton: false,
    frameworkTarget: 'angular-reactive-signals',
    fields: [
      {
        id: 'step_1',
        name: 'stepCompany',
        label: 'Company Overview',
        type: 'step',
        stepTitle: '1. Organization Details',
        stepDescription: 'Primary company and billing contact details',
        children: [
          {
            id: 's1_company',
            name: 'companyName',
            label: 'Company Name',
            type: 'text',
            placeholder: 'Acme Technologies Inc.',
            colSpan: 6,
            validation: { required: true },
          },
          {
            id: 's1_website',
            name: 'companyWebsite',
            label: 'Website Domain',
            type: 'text',
            placeholder: 'https://example.com',
            colSpan: 6,
          },
          {
            id: 's1_contact',
            name: 'primaryContact',
            label: 'Point of Contact',
            type: 'text',
            placeholder: 'Jordan Miller',
            colSpan: 6,
            validation: { required: true },
          },
          {
            id: 's1_email',
            name: 'contactEmail',
            label: 'Official Contact Email',
            type: 'email',
            placeholder: 'jordan@acme.com',
            colSpan: 6,
            validation: { required: true, emailValidator: true },
          },
        ],
      },
      {
        id: 'step_2',
        name: 'stepScope',
        label: 'Technical Scope',
        type: 'step',
        stepTitle: '2. Project Parameters',
        stepDescription: 'Architecture, expected deliverables, and deadline',
        children: [
          {
            id: 's2_stack',
            name: 'targetArchitecture',
            label: 'Preferred Frontend Stack',
            type: 'select',
            defaultValue: 'angular_standalone',
            colSpan: 6,
            options: [
              { label: 'Angular 19 Standalone + Signals', value: 'angular_standalone' },
              { label: 'TanStack Angular Form + Tailwind', value: 'tanstack_angular' },
              { label: 'Micro-Frontend Federation', value: 'mfe' },
            ],
            validation: { required: true },
          },
          {
            id: 's2_budget',
            name: 'budgetRange',
            label: 'Estimated Budget Tier ($USD)',
            type: 'select',
            defaultValue: 'tier_50k',
            colSpan: 6,
            options: [
              { label: '$25,000 - $50,000', value: 'tier_25k' },
              { label: '$50,000 - $100,000', value: 'tier_50k' },
              { label: '$100,000+', value: 'tier_100k' },
            ],
          },
          {
            id: 's2_description',
            name: 'projectSummary',
            label: 'Brief Project Summary & Deliverables',
            type: 'textarea',
            placeholder: 'Detail your current system bottlenecks, timelines, and compliance needs...',
            colSpan: 12,
            validation: { required: true, minLength: 15 },
          },
        ],
      },
      {
        id: 'step_3',
        name: 'stepDeployment',
        label: 'Deployment & SLA',
        type: 'step',
        stepTitle: '3. Compliance & Review',
        stepDescription: 'Data sovereignty and operational SLA terms',
        children: [
          {
            id: 's3_hosting',
            name: 'cloudTarget',
            label: 'Primary Cloud Infrastructure',
            type: 'radio',
            defaultValue: 'gcp',
            colSpan: 6,
            options: [
              { label: 'Google Cloud Platform (GCP)', value: 'gcp' },
              { label: 'AWS GovCloud / Dedicated', value: 'aws' },
              { label: 'On-Premises Kubernetes', value: 'onprem' },
            ],
          },
          {
            id: 's3_nda',
            name: 'requireNDA',
            label: 'Mutual NDA Required Before Discovery Call',
            type: 'switch',
            defaultValue: true,
            colSpan: 6,
          },
          {
            id: 's3_confirm',
            name: 'authorizedSigner',
            label: 'I confirm that I am an authorized technical or legal decision maker',
            type: 'checkbox',
            defaultValue: false,
            colSpan: 12,
            validation: { required: true },
          },
        ],
      },
    ],
  },

  supportTicket: {
    id: 'supportTicket',
    title: 'Developer Bug & Incident Reporter',
    description: 'Demonstrates conditional visibility, severity sliders, and multi-file drag drops.',
    layoutType: 'single-page',
    submitButtonText: 'File Incident Ticket',
    showResetButton: true,
    resetButtonText: 'Discard',
    frameworkTarget: 'angular-reactive-signals',
    fields: [
      {
        id: 't_title',
        name: 'issueTitle',
        label: 'Issue Summary',
        type: 'text',
        placeholder: 'e.g. Memory leak in high-throughput WebSocket listener',
        colSpan: 12,
        validation: { required: true, minLength: 10 },
      },
      {
        id: 't_severity',
        name: 'severity',
        label: 'Severity Level',
        type: 'radio',
        defaultValue: 'p2',
        colSpan: 6,
        options: [
          { label: 'P0 - Production Outage', value: 'p0' },
          { label: 'P1 - High Degradation', value: 'p1' },
          { label: 'P2 - Moderate Issue', value: 'p2' },
          { label: 'P3 - Minor / Cosmetic', value: 'p3' },
        ],
      },
      {
        id: 't_impacted_users',
        name: 'affectedUsers',
        label: 'Estimated Impacted Customers',
        type: 'slider',
        defaultValue: 50,
        colSpan: 6,
      },
      {
        id: 't_reproducible',
        name: 'isReproducible',
        label: 'Consistently Reproducible in Staging Environment',
        type: 'switch',
        defaultValue: true,
        colSpan: 6,
      },
      {
        id: 't_repro_steps',
        name: 'reproSteps',
        label: 'Step-by-Step Reproduction Procedure',
        type: 'textarea',
        placeholder: '1. Navigate to /admin/orders\n2. Filter by status = "pending"\n3. Click Export Batch',
        colSpan: 12,
        validation: { required: true },
        conditional: {
          enabled: true,
          fieldId: 't_reproducible',
          operator: 'isTruthy',
          value: 'true',
        },
      },
      {
        id: 't_satisfaction',
        name: 'environmentRating',
        label: 'DX / Stability Rating of Current Staging Cluster',
        type: 'rating',
        defaultValue: 4,
        colSpan: 12,
      },
    ],
  },
};

export const INITIAL_SUBMISSIONS: FormSubmission[] = [
  {
    id: 'sub-891',
    timestamp: '2026-09-28 09:15:22',
    status: 'submitted',
    data: {
      fullName: 'Dr. Evelyn Vance',
      username: 'evance_core',
      email: 'evelyn.vance@blackmesa.org',
      role: 'lead',
      yearsExperience: 14,
      subscribeUpdates: true,
      agreeTerms: true,
    },
  },
  {
    id: 'sub-892',
    timestamp: '2026-09-28 09:34:01',
    status: 'submitted',
    data: {
      fullName: 'Marcus Chen',
      username: 'mchen_ng',
      email: 'm.chen@synthlabs.io',
      role: 'frontend',
      yearsExperience: 5,
      subscribeUpdates: false,
      agreeTerms: true,
    },
  },
  {
    id: 'sub-893',
    timestamp: '2026-09-28 10:02:44',
    status: 'submitted',
    data: {
      fullName: 'Aria Takahashi',
      username: 'aria_devops',
      email: 'aria@tokyotech.jp',
      role: 'devops',
      yearsExperience: 8,
      subscribeUpdates: true,
      agreeTerms: true,
    },
  },
  {
    id: 'sub-894',
    timestamp: '2026-09-28 10:18:19',
    status: 'submitted',
    data: {
      fullName: 'Liam O’Connor',
      username: 'liam_ui',
      email: 'liam.oc@dublinforge.com',
      role: 'designer',
      yearsExperience: 4,
      subscribeUpdates: true,
      agreeTerms: true,
    },
  },
];

export const ANGULAR_PROBLEM_CASES: AngularProblemCase[] = [
  {
    id: 'prob-formarray',
    title: 'Dynamic FormArray Boilerplate & Typing Hell',
    painPoint: 'Adding, removing, and validating repeating row inputs (e.g. invoice items, team members) in Angular requires excessive boilerplate, cumbersome FormArray casts, and messy template bindings.',
    angularLegacyWay: `// Legacy Angular Reactive Forms FormArray boilerplate:
this.form = this.fb.group({
  items: this.fb.array([])
});

// Casting required because FormArray is poorly typed in older versions:
get items(): FormArray {
  return this.form.get('items') as FormArray;
}

addItem() {
  this.items.push(this.fb.group({
    name: ['', Validators.required],
    qty: [1, [Validators.required, Validators.min(1)]]
  }));
}

// In HTML template:
// <div formArrayName="items">
//   <div *ngFor="let item of items.controls; let i = index" [formGroupName]="i">`,
    solutionWay: `// Modern Solution in NgFormCraft (Angular 17+ Standalone + Signals):
interface Item { name: string; qty: number; }
interface OrderForm { items: FormArray<FormGroup<{ name: FormControl<string>; qty: FormControl<number> }>>; }

protected readonly form = inject(FormBuilder).nonNullable.group({
  items: inject(FormBuilder).array<FormGroup>([])
});

// Direct typed helper without ugly casts:
protected addItem() {
  this.form.controls.items.push(
    inject(FormBuilder).nonNullable.group({
      name: ['', Validators.required],
      qty: [1, [Validators.required, Validators.min(1)]]
    })
  );
}

// In Modern Template with @for and track:
// @for (ctrl of form.controls.items.controls; track $index; let i = $index) {
//   <div [formGroup]="ctrl">`,
    explanation: 'NgFormCraft generates strongly typed `FormArray<FormGroup<...>>` with `FormRecord`/`nonNullable`, preventing runtime nulls, eliminating manual type-casting getters, and emitting modern `@for` control flow blocks with `$index` tracking.',
    tags: ['FormArray', 'TypedForms', 'ControlFlow'],
  },
  {
    id: 'prob-zod',
    title: 'Zod & Schema Validation inside Angular',
    painPoint: 'Angular has no native support for modern schema libraries like Zod, Valibot, or ArkType. Writing custom ValidatorFn for complex rules (regex, cross-field matches, refined types) is verbose and disconnected from API contracts.',
    angularLegacyWay: `// Cumbersome custom Angular ValidatorFn:
export function customRegexValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const valid = /^[A-Z0-9_]+$/.test(control.value);
    return valid ? null : { invalidRegex: { value: control.value } };
  };
}`,
    solutionWay: `// Zod-Powered Angular Validation (Generated by NgFormCraft):
import { z } from 'zod';

export const userRegistrationSchema = z.object({
  fullName: z.string().min(3, 'Minimum 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// NgFormCraft creates a bridge to apply Zod directly to Angular FormGroup!`,
    explanation: 'With NgFormCraft, you can either generate `@tanstack/angular-form` which natively supports Zod schema validation, or use our zero-dependency Angular Zod Bridge validator.',
    tags: ['Zod', 'Validation', 'TanStackForm'],
  },
  {
    id: 'prob-multistep',
    title: 'Multi-Step Wizard State & Step Validation Isolation',
    painPoint: 'Coordinating multi-step forms in Angular usually leads to either one huge FormGroup where step 1 is blocked by step 3 validations, or multiple disconnected forms where stepping backwards loses data.',
    angularLegacyWay: `// Legacy approach often requires manual step flags or separate sub-components:
let currentStep = 1;
function next() {
  if (currentStep === 1 && !this.form.get('step1')?.valid) return;
  // manual validation checks for every step...
}`,
    solutionWay: `// NgFormCraft Multi-Step Signal Architecture:
protected currentStep = signal(0);
protected steps = ['Organization', 'Parameters', 'Review'];

// Reactive computed validity checking for current step only:
protected canAdvance = computed(() => {
  const stepIndex = this.currentStep();
  const currentStepFields = this.stepFieldsMap[stepIndex];
  return currentStepFields.every(field => this.form.get(field)?.valid);
});

protected nextStep() {
  if (this.canAdvance() && this.currentStep() < this.steps.length - 1) {
    this.currentStep.update(s => s + 1);
  }
}`,
    explanation: 'The generated code groups fields into step subsets and uses modern Angular `signal()` and `computed()` to dynamically check if only the active step is valid before allowing the user to advance.',
    tags: ['MultiStep', 'Signals', 'Wizard'],
  },
  {
    id: 'prob-conditional',
    title: 'Dynamic Visibility & Leaking Subscriptions',
    painPoint: 'Showing/hiding form controls based on another control value usually forces developers to subscribe to `valueChanges` in `ngOnInit()`, remember to `takeUntilDestroyed()`, and manually toggle `setValidators()`.',
    angularLegacyWay: `// Painful RxJS subscription with manual enable/disable:
this.form.get('category').valueChanges
  .pipe(takeUntil(this.destroy$))
  .subscribe(val => {
    if (val === 'other') {
      this.form.get('otherDetails').enable();
      this.form.get('otherDetails').setValidators([Validators.required]);
    } else {
      this.form.get('otherDetails').disable();
      this.form.get('otherDetails').clearValidators();
    }
  });`,
    solutionWay: `// Modern Signal Bridge in Angular 18/19:
import { toSignal } from '@angular/core/rxjs-interop';

// One-liner Signal conversion:
protected categoryValue = toSignal(
  this.form.controls.category.valueChanges,
  { initialValue: this.form.controls.category.value }
);

// Declarative visibility in template:
// @if (categoryValue() === 'other') {
//   <app-field-input [control]="form.controls.otherDetails" />
// }`,
    explanation: 'NgFormCraft leverages `toSignal` from `@angular/core/rxjs-interop` so form values become reactive Signals directly usable with `@if` without memory leaks or manual subscription teardowns.',
    tags: ['Conditional', 'RxJS', 'Signals'],
  },
  {
    id: 'prob-tanstack',
    title: '@tanstack/angular-form Headless Paradigm',
    painPoint: 'Many developers want the power of TanStack Form (headless, framework-agnostic, Zod first, async validation states) inside Angular, but lack templates and examples on how to wire `injectForm()` in standalone components.',
    angularLegacyWay: `// Developers typically think Angular only allows ReactiveFormsModule or Template-Driven forms:
import { ReactiveFormsModule } from '@angular/forms';`,
    solutionWay: `// Modern @tanstack/angular-form in Standalone Angular:
import { Component } from '@angular/core';
import { injectForm, TanStackField } from '@tanstack/angular-form';
import { userRegistrationSchema } from './schema';

@Component({
  selector: 'app-tanstack-form',
  standalone: true,
  imports: [TanStackField],
  template: \`
    <form (submit)="form.handleSubmit($event)">
      <ng-container [tanstackField]="form" name="email">
        <ng-template let-field>
          <label>Email</label>
          <input [value]="field.state.value" (input)="field.handleChange($any($event).target.value)" />
          @if (field.state.meta.errors.length) {
            <p class="error">{{ field.state.meta.errors[0] }}</p>
          }
        </ng-template>
      </ng-container>
      <button type="submit">Submit</button>
    </form>
  \`
})
export class TanStackFormComponent {
  form = injectForm({
    defaultValues: { email: '', name: '' },
    validatorAdapter: zodValidator(),
    validator: userRegistrationSchema,
    onSubmit: ({ value }) => console.log('Submitted', value)
  });
}`,
    explanation: 'NgFormCraft can export your visual form directly into `@tanstack/angular-form` syntax with `@tanstack/form-core` and Zod adapter, ready to run in any modern Angular app!',
    tags: ['TanStack', 'Headless', 'ZodAdapter'],
  },
];

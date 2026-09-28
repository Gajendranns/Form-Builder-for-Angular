export type FormFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'slider'
  | 'datepicker'
  | 'file'
  | 'rating'
  | 'formarray' // Dynamic repeating group of fields
  | 'fieldgroup' // Nested object
  | 'step'; // Multi-step container

export interface FieldOption {
  label: string;
  value: string;
}

export interface ConditionalRule {
  enabled: boolean;
  fieldId: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'isTruthy';
  value: string;
}

export interface ValidationRules {
  required?: boolean;
  requiredMessage?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
  emailValidator?: boolean;
  passwordConfirmFieldId?: string; // Cross-field validator
  customValidatorName?: string;
}

export interface FormArrayConfig {
  minItems: number;
  maxItems: number;
  itemLabel: string;
  addButtonText: string;
  initialItemsCount: number;
}

export interface FormField {
  id: string;
  name: string; // programmatic identifier (e.g. 'firstName', 'email')
  label: string;
  type: FormFieldType;
  placeholder?: string;
  defaultValue?: any;
  helperText?: string;
  colSpan?: 12 | 6 | 4 | 8; // Tailwind grid span
  options?: FieldOption[]; // for select, radio, multiselect
  validation?: ValidationRules;
  conditional?: ConditionalRule;
  children?: FormField[]; // for formarray, fieldgroup, or step
  arrayConfig?: FormArrayConfig; // for formarray type
  stepTitle?: string; // for step type
  stepDescription?: string;
}

export interface FormConfig {
  id: string;
  title: string;
  description: string;
  layoutType: 'single-page' | 'multi-step';
  submitButtonText: string;
  resetButtonText?: string;
  showResetButton: boolean;
  frameworkTarget: 'angular-reactive-signals' | 'tanstack-angular-form';
  fields: FormField[];
}

export interface FormSubmission {
  id: string;
  timestamp: string;
  data: Record<string, any>;
  status: 'valid' | 'submitted';
}

export interface AngularProblemCase {
  id: string;
  title: string;
  painPoint: string;
  angularLegacyWay: string;
  solutionWay: string;
  explanation: string;
  tags: string[];
}

import { FormField, FormEngine } from '../types/form';

export interface ReactiveFieldError {
  errorKey: string; // e.g. 'required', 'email', 'minlength'
  errorValue: any; // e.g. true or { requiredLength: 8, actualLength: 4 }
  message: string;
  angularValidatorSnippet: string; // e.g. "form.get('email')?.hasError('required')"
}

export interface SignalFieldError {
  errorMessages: string[];
  signalGetter: string; // e.g. "emailErrors()"
  isValid: boolean;
  isTouched: boolean;
  isDirty: boolean;
}

export interface TanStackFieldError {
  errors: string[]; // e.g. ["Invalid email address", "Must be at least 3 chars"]
  errorMap: {
    onChange?: string;
    onBlur?: string;
    onSubmit?: string;
  };
  isTouched: boolean;
  isValidating: boolean;
  isValid: boolean;
  tanstackSnippet: string; // e.g. "field.state.meta.errors[0]"
}

export interface FormErrorEvaluationResult {
  engine: FormEngine;
  fieldErrors: Record<string, {
    message: string;
    detail: any;
    templateCondition: string;
    displayBadge: string;
  }>;
  hasErrors: boolean;
  rawErrorState: any; // Engine-specific data structure to inspect
}

/**
 * Evaluates a single field according to the selected engine specification
 */
export function evaluateFieldValidation(
  field: FormField,
  value: any,
  allValues: Record<string, any>,
  engine: FormEngine,
  isTouched: boolean = true
): {
  message: string;
  detail: any;
  templateCondition: string;
  displayBadge: string;
} | null {
  // Check conditional visibility: if hidden, it has no errors
  if (field.conditional?.enabled) {
    const depVal = allValues[field.conditional.fieldId] ?? allValues[field.conditional.fieldId.replace(/^f_/, '')];
    if (field.conditional.operator === 'isTruthy' && !depVal) return null;
    if (field.conditional.operator === 'equals' && String(depVal) !== field.conditional.value) return null;
    if (field.conditional.operator === 'notEquals' && String(depVal) === field.conditional.value) return null;
  }

  const rules = field.validation;
  if (!rules) return null;

  let reactiveErrors: Record<string, any> = {};
  let signalMessages: string[] = [];
  let tanstackErrors: string[] = [];

  // Required Check
  if (rules.required) {
    const isBlank =
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      ((field.type === 'checkbox' || field.type === 'switch') && !value);

    if (isBlank) {
      const msg = rules.requiredMessage || `${field.label} is required`;
      reactiveErrors['required'] = true;
      signalMessages.push(msg);
      tanstackErrors.push(msg);
    }
  }

  // Email Check
  if ((rules.emailValidator || field.type === 'email') && value) {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
    if (!isEmailValid) {
      reactiveErrors['email'] = true;
      signalMessages.push('Invalid email address format');
      tanstackErrors.push('String must be a valid email address (z.string().email())');
    }
  }

  // MinLength Check
  if (rules.minLength !== undefined && value && String(value).length < rules.minLength) {
    reactiveErrors['minlength'] = {
      requiredLength: rules.minLength,
      actualLength: String(value).length,
    };
    signalMessages.push(`Must have at least ${rules.minLength} characters`);
    tanstackErrors.push(`String must contain at least ${rules.minLength} character(s)`);
  }

  // MaxLength Check
  if (rules.maxLength !== undefined && value && String(value).length > rules.maxLength) {
    reactiveErrors['maxlength'] = {
      requiredLength: rules.maxLength,
      actualLength: String(value).length,
    };
    signalMessages.push(`Must not exceed ${rules.maxLength} characters`);
    tanstackErrors.push(`String must contain at most ${rules.maxLength} character(s)`);
  }

  // Min Number Check
  if (rules.min !== undefined && value !== '' && Number(value) < rules.min) {
    reactiveErrors['min'] = { min: rules.min, actual: Number(value) };
    signalMessages.push(`Value must be >= ${rules.min}`);
    tanstackErrors.push(`Number must be greater than or equal to ${rules.min}`);
  }

  // Max Number Check
  if (rules.max !== undefined && value !== '' && Number(value) > rules.max) {
    reactiveErrors['max'] = { max: rules.max, actual: Number(value) };
    signalMessages.push(`Value must be <= ${rules.max}`);
    tanstackErrors.push(`Number must be less than or equal to ${rules.max}`);
  }

  // Regex Pattern Check
  if (rules.pattern && value) {
    try {
      const reg = new RegExp(rules.pattern);
      if (!reg.test(String(value))) {
        reactiveErrors['pattern'] = {
          requiredPattern: rules.pattern,
          actualValue: String(value),
        };
        const pMsg = rules.patternMessage || 'Does not match required format';
        signalMessages.push(pMsg);
        tanstackErrors.push(pMsg);
      }
    } catch {
      // ignore regex parse
    }
  }

  // Password Confirmation Check (Cross-field)
  if (rules.passwordConfirmFieldId) {
    const targetVal = allValues[rules.passwordConfirmFieldId] ?? allValues[rules.passwordConfirmFieldId.replace(/^f_/, '')];
    if (value && targetVal !== undefined && value !== targetVal) {
      reactiveErrors['passwordMismatch'] = true;
      signalMessages.push('Passwords do not match');
      tanstackErrors.push('Passwords must match (z.refine error)');
    }
  }

  // Check if any errors occurred
  if (Object.keys(reactiveErrors).length === 0 && signalMessages.length === 0) {
    return null;
  }

  // Return structure tailored specifically to the selected engine!
  if (engine === 'angular-reactive-signals') {
    const firstKey = Object.keys(reactiveErrors)[0];
    let msg = '';
    if (firstKey === 'required') msg = rules.requiredMessage || `${field.label} is required`;
    else if (firstKey === 'email') msg = 'Invalid email address';
    else if (firstKey === 'minlength') msg = `Min length is ${rules.minLength} (got ${reactiveErrors[firstKey].actualLength})`;
    else if (firstKey === 'maxlength') msg = `Max length is ${rules.maxLength}`;
    else if (firstKey === 'passwordMismatch') msg = 'Passwords do not match';
    else msg = `${field.label} validation requirement '${firstKey}' failed`;

    return {
      message: msg,
      detail: reactiveErrors,
      templateCondition: `@if (form.controls['${field.name}'].hasError('${firstKey}') && form.controls['${field.name}'].touched)`,
      displayBadge: `FormGroup.errors['${firstKey}']`,
    };
  }

  if (engine === 'angular-signal-form') {
    return {
      message: signalMessages[0],
      detail: signalMessages,
      templateCondition: `@if (form.${field.name}().touched && form.${field.name}().errors()?.length)`,
      displayBadge: `@angular/forms/signals`,
    };
  }

  // engine === 'tanstack-angular-form'
  return {
    message: tanstackErrors[0],
    detail: {
      metaErrors: tanstackErrors,
      isTouched: isTouched,
      isValidating: false,
    },
    templateCondition: `@if (field.state.meta.isTouched && field.state.meta.errors.length)`,
    displayBadge: `field.state.meta.errors[0] (Zod)`,
  };
}

/**
 * Evaluates all fields for the entire form based on the selected engine
 */
export function evaluateAllFormErrors(
  fields: FormField[],
  values: Record<string, any>,
  engine: FormEngine,
  touchedFields: Record<string, boolean> = {}
): FormErrorEvaluationResult {
  const result: FormErrorEvaluationResult = {
    engine,
    fieldErrors: {},
    hasErrors: false,
    rawErrorState: {},
  };

  const rawState: Record<string, any> = {};

  for (const field of fields) {
    const val = values[field.name];
    const isTouched = !!touchedFields[field.name];
    const err = evaluateFieldValidation(field, val, values, engine, isTouched);

    if (err) {
      result.fieldErrors[field.name] = err;
      result.hasErrors = true;
      rawState[field.name] = err.detail;
    } else {
      if (engine === 'angular-reactive-signals') {
        rawState[field.name] = null; // Angular sets null when valid
      } else if (engine === 'angular-signal-form') {
        rawState[field.name] = []; // Signal Forms empty array
      } else {
        rawState[field.name] = { errors: [], isTouched, isValid: true };
      }
    }
  }

  if (engine === 'angular-reactive-signals') {
    result.rawErrorState = {
      status: result.hasErrors ? 'INVALID' : 'VALID',
      errors: result.hasErrors ? rawState : null,
      controls: rawState,
    };
  } else if (engine === 'angular-signal-form') {
    result.rawErrorState = {
      isFormValid: !result.hasErrors,
      formErrorsSignal: rawState,
      signalGraphState: 'computed(() => form().valid)',
    };
  } else {
    result.rawErrorState = {
      canSubmit: !result.hasErrors,
      isSubmitting: false,
      fieldMeta: rawState,
    };
  }

  return result;
}

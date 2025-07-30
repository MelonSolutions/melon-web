/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationErrors {
  [key: string]: string;
}

export function validateField(value: any, rules: ValidationRule): string | null {
  if (rules.required && (!value || value.toString().trim() === '')) {
    return 'This field is required';
  }

  if (value && rules.minLength && value.toString().length < rules.minLength) {
    return `Must be at least ${rules.minLength} characters`;
  }

  if (value && rules.maxLength && value.toString().length > rules.maxLength) {
    return `Must be no more than ${rules.maxLength} characters`;
  }

  if (value && rules.pattern && !rules.pattern.test(value.toString())) {
    return 'Invalid format';
  }

  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
}

export function validateForm(data: any, schema: { [key: string]: ValidationRule }): ValidationErrors {
  const errors: ValidationErrors = {};

  Object.keys(schema).forEach(key => {
    const error = validateField(data[key], schema[key]);
    if (error) {
      errors[key] = error;
    }
  });

  return errors;
}

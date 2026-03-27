/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useCallback } from 'react';
import { ValidationErrors, ValidationRule, validateField, validateForm } from '@/lib/validation';

interface UseFormValidationOptions {
  schema: { [key: string]: ValidationRule };
  onSubmit: (data: any) => Promise<void> | void;
}

export function useFormValidation({ schema, onSubmit }: UseFormValidationOptions) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateSingleField = useCallback((name: string, value: any) => {
    if (!schema[name]) return null;
    return validateField(value, schema[name]);
  }, [schema]);

  const handleFieldChange = useCallback((name: string, value: any) => {
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleFieldBlur = useCallback((name: string, value: any) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateSingleField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [validateSingleField]);

  const handleSubmit = useCallback(async (data: any): Promise<boolean> => {
    setIsSubmitting(true);
    
    // Validate all fields
    const formErrors = validateForm(data, schema);
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsSubmitting(false);
      return false;
    }

    try {
      await onSubmit(data);
      setErrors({});
      return true;
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [schema, onSubmit]);

  const getFieldError = useCallback((name: string) => {
    return touched[name] ? errors[name] : undefined;
  }, [errors, touched]);

  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    isSubmitting,
    touched,
    handleFieldChange,
    handleFieldBlur,
    handleSubmit,
    getFieldError,
    hasErrors,
    setErrors,
  };
}

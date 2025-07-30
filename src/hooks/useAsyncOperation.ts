/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage, isNetworkError } from '@/lib/utils';

interface UseAsyncOperationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useAsyncOperation(options: UseAsyncOperationOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { addToast } = useToast();

  const execute = useCallback(async (asyncFunction: () => Promise<any>) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await asyncFunction();
      
      if (options.successMessage) {
        addToast({
          type: 'success',
          title: 'Success',
          message: options.successMessage,
        });
      }
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(getErrorMessage(err));
      setError(error);
      
      // Show appropriate error message
      let errorTitle = 'Error';
      let errorMessage = error.message;
      
      if (isNetworkError(error)) {
        errorTitle = 'Network Error';
        errorMessage = 'Please check your internet connection and try again.';
      } else if (options.errorMessage) {
        errorMessage = options.errorMessage;
      }
      
      addToast({
        type: 'error',
        title: errorTitle,
        message: errorMessage,
      });
      
      if (options.onError) {
        options.onError(error);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [addToast, options]);

  return {
    loading,
    error,
    execute,
    clearError: () => setError(null),
  };
}
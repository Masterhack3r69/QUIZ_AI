'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/contexts/ToastContext';

export interface AsyncActionOptions {
  onSuccess?: (data?: any) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export interface AsyncActionState {
  isLoading: boolean;
  error: Error | null;
  data: any | null;
}

export function useAsyncAction<T = any>(
  action: (...args: any[]) => Promise<T>,
  options: AsyncActionOptions = {}
) {
  const [state, setState] = useState<AsyncActionState>({
    isLoading: false,
    error: null,
    data: null,
  });

  const { showSuccess, showError } = useToast();

  const execute = useCallback(
    async (...args: any[]) => {
      setState({ isLoading: true, error: null, data: null });

      try {
        const result = await action(...args);
        setState({ isLoading: false, error: null, data: result });

        if (options.showSuccessToast !== false && options.successMessage) {
          showSuccess(options.successMessage);
        }

        if (options.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('An unknown error occurred');
        setState({ isLoading: false, error: err, data: null });

        if (options.showErrorToast !== false) {
          const message = options.errorMessage || err.message || 'An error occurred';
          showError(message);
        }

        if (options.onError) {
          options.onError(err);
        }

        throw err;
      }
    },
    [action, options, showSuccess, showError]
  );

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, data: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Hook for managing multiple async states
export interface AsyncState {
  isLoading: boolean;
  error: string | null;
}

export function useAsyncState(initialLoading = false) {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const setErrorMessage = useCallback((message: string) => {
    setError(message);
    setIsLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setError: setErrorMessage,
    clearError,
    reset,
  };
}

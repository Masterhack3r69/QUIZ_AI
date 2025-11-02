'use client';

import React from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  showValidIndicator?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  showValidIndicator = false,
  className = '',
  id,
  required,
  value,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const hasError = !!error;
  const hasValue = value !== undefined && value !== null && String(value).length > 0;
  const isValid = showValidIndicator && hasValue && !hasError;
  
  const baseStyles = 'block w-full px-4 py-3 text-base border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 touch-manipulation min-h-[48px] text-gray-900 placeholder:text-gray-400';
  const normalStyles = 'bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500/20';
  const errorStyles = 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50';
  const validStyles = 'border-green-500 focus:border-green-500 focus:ring-green-500/20 bg-green-50';
  const disabledStyles = 'disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed disabled:opacity-60';
  
  // Determine which styles to apply
  let inputStyles = normalStyles;
  if (hasError) {
    inputStyles = errorStyles;
  } else if (isValid) {
    inputStyles = validStyles;
  }
  
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          className={`${baseStyles} ${inputStyles} ${disabledStyles} ${isValid ? 'pr-10' : ''} ${className}`}
          required={required}
          value={value}
          aria-invalid={hasError}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {/* Valid indicator checkmark */}
        {isValid && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
        {/* Error indicator */}
        {hasError && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        )}
      </div>
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1 text-sm text-red-600 flex items-start"
          role="alert"
        >
          <svg
            className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </p>
      )}
      {!error && helperText && (
        <p
          id={`${inputId}-helper`}
          className="mt-1 text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}

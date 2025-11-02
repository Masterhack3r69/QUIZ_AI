'use client';

import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  helperText,
  options,
  placeholder,
  className = '',
  id,
  required,
  value,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const hasError = !!error;
  
  const baseStyles = 'block w-full px-4 py-3 text-base border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 touch-manipulation min-h-[48px] text-gray-900 appearance-none bg-no-repeat bg-right';
  const normalStyles = 'bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500/20';
  const errorStyles = 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50';
  const disabledStyles = 'disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed disabled:opacity-60';
  
  const inputStyles = hasError ? errorStyles : normalStyles;
  
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`${baseStyles} ${inputStyles} ${disabledStyles} pr-10 ${className}`}
          required={required}
          value={value}
          aria-invalid={hasError}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {/* Dropdown arrow icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
        {/* Error indicator */}
        {hasError && (
          <div className="absolute inset-y-0 right-8 flex items-center pr-3 pointer-events-none">
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
          id={`${selectId}-error`}
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
          id={`${selectId}-helper`}
          className="mt-1 text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}

import React from 'react';
import { ChevronDown } from 'lucide-react';

const GroupedSelect = ({
  label,
  options = [],
  placeholder = 'Select an option',
  className = '',
  error,
  loading = false,
  disabled = false,
  helperText,
  ...props
}) => {
  const hasError = Boolean(error);
  const isDisabled = loading || disabled || !options.length;

  return (
    <div className="w-full space-y-1.5">
      {/* Label */}
      {label && (
        <label 
          htmlFor={props.id || props.name}
          className="block text-sm font-medium text-gray-900"
        >
          {label}
          {props.required && (
            <span className="ml-1 text-red-500" aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      {/* Select Wrapper */}
      <div className="relative">
        <select
          id={props.id || props.name}
          disabled={isDisabled}
          className={`
            w-full px-3 py-2.5 pr-10
            text-sm text-gray-900
            bg-white
            border rounded-lg
            shadow-sm
            appearance-none
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${hasError 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
            }
            ${isDisabled ? 'opacity-60' : 'hover:border-gray-400'}
            ${className}
          `}
          aria-invalid={hasError}
          aria-describedby={
            hasError 
              ? `${props.name}-error` 
              : helperText 
              ? `${props.name}-helper` 
              : undefined
          }
          {...props}
        >
          {/* Placeholder */}
          <option value="" disabled hidden>
            {loading ? 'Loading options...' : placeholder}
          </option>

          {/* Grouped Options */}
          {!loading && options.map((parent) => (
            <optgroup 
              key={`parent-${parent._id}`} 
              label={parent.name}
              className="font-semibold text-gray-900"
            >
              {parent.children?.map((child) => (
                <option 
                  key={child._id} 
                  value={child._id}
                  className="font-normal text-gray-700 py-1"
                >
                  {child.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        {/* Chevron Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown 
            className={`h-4 w-4 transition-colors ${
              hasError ? 'text-red-400' : 'text-gray-400'
            }`}
            aria-hidden="true"
          />
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-y-0 right-8 flex items-center pr-3">
            <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Helper Text or Error Message */}
      {helperText && !hasError && (
        <p 
          id={`${props.name}-helper`}
          className="text-xs text-gray-500"
        >
          {helperText}
        </p>
      )}

      {/* Error Message */}
      {hasError && (
        <p 
          id={`${props.name}-error`}
          className="text-xs text-red-600 flex items-center gap-1"
          role="alert"
        >
          <svg 
            className="h-3.5 w-3.5" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default GroupedSelect;
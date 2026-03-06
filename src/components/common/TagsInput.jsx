import React, { useState, useRef, useEffect } from 'react';
import { X, Tag, Plus } from 'lucide-react';

/**
 * Professional Tags Input Component
 * 
 * Features:
 * - Add tags by typing and pressing Enter/Comma
 * - Remove tags by clicking X or backspace
 * - Autocomplete suggestions from predefined list
 * - Validation (max tags, duplicate prevention, etc.)
 * - Integration with react-hook-form
 */

const TagsInput = ({
  label,
  name,
  value = [],
  onChange,
  placeholder = 'Type and press Enter...',
  error,
  helperText,
  suggestions = [],
  maxTags,
  minTags,
  required = false,
  disabled = false,
  className = '',
  allowCustom = true,
  caseSensitive = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const hasError = Boolean(error);
  const tags = Array.isArray(value) ? value : [];

  // Filter suggestions based on input
  const filteredSuggestions = suggestions.filter((suggestion) => {
    const searchTerm = caseSensitive ? inputValue : inputValue.toLowerCase();
    const suggestionText = caseSensitive ? suggestion : suggestion.toLowerCase();
    return (
      suggestionText.includes(searchTerm) &&
      !tags.some((tag) =>
        caseSensitive ? tag === suggestion : tag.toLowerCase() === suggestion.toLowerCase()
      )
    );
  });

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tag) => {
    if (!tag.trim()) return;

    const trimmedTag = tag.trim();

    // Check for duplicates (case-insensitive by default)
    const isDuplicate = tags.some((existingTag) =>
      caseSensitive
        ? existingTag === trimmedTag
        : existingTag.toLowerCase() === trimmedTag.toLowerCase()
    );

    if (isDuplicate) {
      return; // Silent fail for duplicates
    }

    // Check max tags
    if (maxTags && tags.length >= maxTags) {
      return;
    }

    // Check if custom tags are allowed
    if (!allowCustom && !suggestions.includes(trimmedTag)) {
      return;
    }

    const newTags = [...tags, trimmedTag];
    onChange?.(newTags);
    setInputValue('');
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  const removeTag = (indexToRemove) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    onChange?.(newTags);
  };

  const handleKeyDown = (e) => {
    // Handle Enter or Comma to add tag
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
        addTag(filteredSuggestions[highlightedIndex]);
      } else {
        addTag(inputValue);
      }
    }

    // Handle Backspace to remove last tag
    if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }

    // Handle arrow keys for suggestion navigation
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    }

    // Handle Escape to close suggestions
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(newValue.length > 0 && filteredSuggestions.length > 0);
    setHighlightedIndex(-1);
  };

  const handleSuggestionClick = (suggestion) => {
    addTag(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`} ref={containerRef}>
      {/* Label */}
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-900">
          {label}
          {required && (
            <span className="ml-1 text-red-500" aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      {/* Input Container */}
      <div
        className={`
          relative
          min-h-[42px]
          flex flex-wrap items-center gap-1.5
          px-2 py-1.5
          bg-white
          border rounded-lg
          shadow-sm
          transition-all duration-200
          ${hasError
            ? 'border-red-300 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20'
            : 'border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20'
          }
          ${disabled ? 'bg-gray-50 opacity-60 cursor-not-allowed' : 'hover:border-gray-400'}
        `}
      >
        {/* Icon */}
        <Tag className="h-4 w-4 text-gray-400 ml-1" aria-hidden="true" />

        {/* Render Tags */}
        {tags.map((tag, index) => (
          <span
            key={index}
            className="
              inline-flex items-center gap-1
              px-2 py-1
              bg-blue-50 text-blue-700
              text-sm font-medium
              rounded-md
              border border-blue-200
              transition-colors
              hover:bg-blue-100
            "
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="
                  hover:bg-blue-200
                  rounded
                  p-0.5
                  transition-colors
                  focus:outline-none
                  focus:ring-1
                  focus:ring-blue-500
                "
                aria-label={`Remove ${tag} tag`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}

        {/* Input Field */}
        <input
          ref={inputRef}
          id={name}
          name={name}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() =>
            setShowSuggestions(inputValue.length > 0 && filteredSuggestions.length > 0)
          }
          placeholder={tags.length === 0 ? placeholder : ''}
          disabled={disabled || (maxTags && tags.length >= maxTags)}
          className="
            flex-1
            min-w-[120px]
            px-1
            text-sm
            bg-transparent
            border-none
            outline-none
            placeholder:text-gray-400
            disabled:cursor-not-allowed
          "
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${name}-error` : helperText ? `${name}-helper` : undefined
          }
        />

        {/* Max Tags Indicator */}
        {maxTags && (
          <span className="text-xs text-gray-500 mr-1">
            {tags.length}/{maxTags}
          </span>
        )}
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          className="
            absolute z-10
            w-full
            mt-1
            bg-white
            border border-gray-200
            rounded-lg
            shadow-lg
            max-h-60
            overflow-auto
            animate-in fade-in-0 zoom-in-95 duration-100
          "
        >
          <div className="p-1">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={`
                  w-full
                  flex items-center gap-2
                  px-3 py-2
                  text-sm text-left
                  rounded-md
                  transition-colors
                  ${
                    index === highlightedIndex
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <Plus className="h-3.5 w-3.5 text-gray-400" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Helper Text */}
      {helperText && !hasError && (
        <p id={`${name}-helper`} className="text-xs text-gray-500">
          {helperText}
        </p>
      )}

      {/* Error Message */}
      {hasError && (
        <p
          id={`${name}-error`}
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

export default TagsInput;
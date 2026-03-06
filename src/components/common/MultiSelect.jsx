import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

/**
 * Professional multi-select component with checkboxes
 * @param {Object} props
 * @param {string} props.label - Label text
 * @param {Array} props.options - Array of {value, label} options
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.required - Whether field is required
 * @param {string} props.error - Error message
 * @param {Function} props.onChange - Change callback
 * @param {Array} props.value - Selected values array
 * @param {string} props.className - Additional CSS classes
 */
const MultiSelect = ({ 
  label, 
  options = [], 
  placeholder = 'Select options',
  required = false,
  error = false,
  onChange,
  value = [],
  className = '',
  name,
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState(value || []);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update internal state when value prop changes
  useEffect(() => {
    if (value) {
      setSelectedValues(value);
    }
  }, [value]);

  const handleToggle = (optionValue) => {
    let newSelectedValues;
    
    if (selectedValues.includes(optionValue)) {
      newSelectedValues = selectedValues.filter(v => v !== optionValue);
    } else {
      newSelectedValues = [...selectedValues, optionValue];
    }
    
    setSelectedValues(newSelectedValues);
    onChange?.(newSelectedValues);
  };

  const handleRemove = (optionValue, e) => {
    e.stopPropagation();
    const newSelectedValues = selectedValues.filter(v => v !== optionValue);
    setSelectedValues(newSelectedValues);
    onChange?.(newSelectedValues);
  };

  const getSelectedLabels = () => {
    return options
      .filter(opt => selectedValues.includes(opt.value))
      .map(opt => opt.label);
  };

  const selectedLabels = getSelectedLabels();

  return (
    <div className={`w-full ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Main Select Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full min-h-[42px] px-4 py-2 text-left bg-white border rounded-lg transition-all duration-200 flex items-center justify-between gap-2 ${
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
              : isOpen
              ? 'border-blue-500 ring-2 ring-blue-100'
              : 'border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
          }`}
        >
          <div className="flex-1 flex flex-wrap gap-1.5 min-h-[24px]">
            {selectedLabels.length === 0 ? (
              <span className="text-gray-400 text-sm">{placeholder}</span>
            ) : (
              selectedLabels.map((label, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium"
                >
                  {label}
                  <button
                    type="button"
                    onClick={(e) => handleRemove(
                      options.find(opt => opt.label === label)?.value,
                      e
                    )}
                    className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No options available
              </div>
            ) : (
              <div className="py-1">
                {options.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleToggle(option.value)}
                      className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${
                        isSelected
                          ? 'bg-blue-50 text-blue-900 hover:bg-blue-100'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {/* Custom Checkbox */}
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                        )}
                      </div>
                      
                      <span className="flex-1">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
          <span className="inline-block mt-0.5">⚠</span>
          {error}
        </p>
      )}

      {/* Selected Count */}
      {selectedLabels.length > 0 && !error && (
        <p className="mt-2 text-xs text-gray-500">
          {selectedLabels.length} option{selectedLabels.length !== 1 ? 's' : ''} selected
        </p>
      )}

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(selectedValues)}
        {...props}
      />
    </div>
  );
};

export default MultiSelect;
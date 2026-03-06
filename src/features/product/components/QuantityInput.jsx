import { useState } from "react";

const QuantityInput = ({ value, onChange, max = 9999 }) => {
  const [inputValue, setInputValue] = useState(String(value));
  const [focused, setFocused] = useState(false);

  // Sync display when value changes externally (but not while user is typing)
  if (!focused && inputValue !== String(value)) {
    setInputValue(String(value));
  }

  function commit(raw) {
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed) || parsed < 1) {
      setInputValue(String(value)); // revert
      return;
    }
    const clamped = Math.min(parsed, max);
    setInputValue(String(clamped));
    onChange(clamped);
  }

  function handleChange(e) {
    if (/^\d*$/.test(e.target.value)) setInputValue(e.target.value);
  }

  function handleBlur() {
    setFocused(false);
    commit(inputValue);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') e.target.blur();
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(Math.min(value + 1, max));
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (value > 1) onChange(value - 1);
    }
  }

  return (
    <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden w-auto">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        className="px-4 py-2 hover:bg-gray-100 text-gray-600 text-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed select-none"
      >
        −
      </button>

      <input
        type="text"
        inputMode="numeric"
        value={inputValue}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-16 text-center py-2 text-sm font-semibold border-x border-gray-300 focus:outline-none focus:bg-blue-50 transition-colors"
        aria-label="Quantity"
      />

      <button
        type="button"
        onClick={() => onChange(Math.min(value + 1, max))}
        disabled={value >= max}
        className="px-4 py-2 hover:bg-gray-100 text-gray-600 text-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed select-none"
      >
        +
      </button>
    </div>
  );
};

export default QuantityInput;
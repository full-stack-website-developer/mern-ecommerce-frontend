import { useState } from 'react';
// Self-contained quantity input component
const QuantityInput = ({ item, onUpdate }) => {
  const [inputValue, setInputValue] = useState(String(item.quantity));
  const [focused, setFocused] = useState(false);

  const max = item.availableStock ?? 9999;

  function commit(raw) {
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed) || parsed < 1) {
      setInputValue(String(item.quantity)); // revert to last valid
      return;
    }
    const clamped = Math.min(parsed, max);
    setInputValue(String(clamped));
    if (clamped !== item.quantity) {
      onUpdate(item, clamped - item.quantity); // pass delta
    }
  }

  function handleChange(e) {
    const val = e.target.value;
    // Allow only digits while typing
    if (/^\d*$/.test(val)) setInputValue(val);
  }

  function handleBlur() {
    setFocused(false);
    commit(inputValue);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.target.blur();
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(item.quantity + 1, max);
      setInputValue(String(next));
      if (next !== item.quantity) onUpdate(item, 1);
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (item.quantity > 1) {
        setInputValue(String(item.quantity - 1));
        onUpdate(item, -1);
      }
    }
  }

  // Sync display when context updates externally (e.g. optimistic rollback)
  // but only when not actively editing
  if (!focused && inputValue !== String(item.quantity)) {
    setInputValue(String(item.quantity));
  }

  return (
    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
      <button
        type="button"
        className="px-3 py-1.5 hover:bg-gray-100 text-gray-600 text-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed select-none"
        onClick={() => onUpdate(item, -1)}
        disabled={item.quantity <= 1}
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
        className="w-14 text-center py-1.5 text-sm font-semibold border-x border-gray-300 focus:outline-none focus:bg-blue-50 transition-colors"
        aria-label="Quantity"
      />

      <button
        type="button"
        className="px-3 py-1.5 hover:bg-gray-100 text-gray-600 text-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed select-none"
        onClick={() => onUpdate(item, +1)}
        disabled={item.quantity >= max}
      >
        +
      </button>
    </div>
  );
};

export default QuantityInput;
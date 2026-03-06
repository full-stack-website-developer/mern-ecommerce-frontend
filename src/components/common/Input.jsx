const Input = ({
  label,
  type = 'text',
  placeholder,
  className = '',
  error = false,
  // Strip these out — Zod handles all validation, not the browser.
  // react-hook-form's register() injects min/max/required from the schema
  // and passing them to the native <input> causes browser interference
  // (e.g. number inputs returning -1 or blocking submission).
  min,
  max,
  required,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="ms-1 text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className={`input-field ${className} mb-1`}
        {...props}
      />
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
    </div>
  );
};

export default Input;
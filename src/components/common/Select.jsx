const Select = ({
  label,
  options = [],
  placeholder = 'Select an option',
  className = '',
  error = false,
  loading = false,
  allowEmpty = false,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {
            props.required && <span className="ms-1 text-red-500">*</span>
          }
        </label>
      )}
      <select
        className={`input-field ${className}`}
        disabled={loading}
        {...props}
      >
        <option value="" disabled={!allowEmpty}>
          {loading ? 'Loading...' : placeholder}
        </option>
        
        {/* Render options */}
        {!loading &&
          options.map((option) => (
            <option
              key={option.value ?? option._id}
              value={option.value ?? option._id}
            >
              {option.label ?? option.name}
            </option>
          ))}
      </select>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Select;

const Input = ({ label, type = 'text', placeholder, className = '', error = false,  ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {
              props.required && <span className="ms-1 text-red-500">*</span>
            }
          </label>
        </>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className={`input-field ${className} mb-1`}
        {...props}
      />
      {
        error && <span className="text-red-600 text-sm">{error}</span>
      }
    </div>
  );
};

export default Input;

const Textarea = ({ label, placeholder, rows = 4, className = '', error=false, ...props }) => {
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
      <textarea
        placeholder={placeholder}
        rows={rows}
        className={`input-field ${className}`}
        {...props}
      ></textarea>
      {
        error && <span className="text-red-600 text-sm">{error}</span>
      }
    </div>
  );
};

export default Textarea;

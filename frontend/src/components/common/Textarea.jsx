const Textarea = ({ label, placeholder, rows = 4, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        rows={rows}
        className={`input-field ${className}`}
        {...props}
      ></textarea>
    </div>
  );
};

export default Textarea;

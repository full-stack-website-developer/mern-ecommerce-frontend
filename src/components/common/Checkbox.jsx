const Checkbox = ({ label, className = '', error = '',...props }) => {
  return (
    <>
      <label className={`flex items-center ${className}`}>
        <input
          type="checkbox"
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          {...props}
        />
        {label && 
          <>
            <span className="ml-2 text-sm text-gray-700">{label}</span>
            {
              props.required && <span className="ms-1 text-red-500">*</span>
            }  
          </>
        }
      </label>
      {
        error && <span className="text-red-600 text-sm">{error}</span>
      }
    </>
  );
};

export default Checkbox;

const Radio = ({ label, name, value, className = '', ...props }) => {
  return (
    <label className={`flex items-center ${className}`}>
      <input
        type="radio"
        name={name}
        value={value}
        className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
        {...props}
      />
      {label && <span className="ml-2 text-sm text-gray-700">{label}</span>}
    </label>
  );
};

export default Radio;

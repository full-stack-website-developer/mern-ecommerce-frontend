const Alert = ({ type = 'info', children, onClose }) => {
  const types = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    danger: 'bg-red-50 text-red-800 border-red-200',
  };
  
  return (
    <div className={`border rounded-lg p-4 ${types[type]}`}>
      <div className="flex items-center justify-between">
        <div>{children}</div>
        {onClose && (
          <button onClick={onClose} className="ml-4 text-current opacity-70 hover:opacity-100">
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;

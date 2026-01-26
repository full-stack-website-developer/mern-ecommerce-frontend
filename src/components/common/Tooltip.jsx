const Tooltip = ({ children, text, position = 'top' }) => {
  const positions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };
  
  return (
    <div className="relative group">
      {children}
      <div className={`absolute ${positions[position]} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10`}>
        <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
          {text}
        </div>
      </div>
    </div>
  );
};

export default Tooltip;

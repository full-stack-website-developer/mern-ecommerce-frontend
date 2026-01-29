const Loader = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-4',
  };

  return (
    <div
      className={`animate-spin rounded-full border-gray-300 border-t-black ${sizes[size]}`}
    />
  );
};

export default Loader;

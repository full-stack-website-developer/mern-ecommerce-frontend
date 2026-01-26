const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  return (
    <div className="flex items-center justify-center space-x-2 mt-6">
      <button
        className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
        disabled={currentPage === 1}
      >
        Previous
      </button>
      {pages.map((page) => (
        <button
          key={page}
          className={`px-4 py-2 border rounded-lg ${
            currentPage === page
              ? 'bg-primary-600 text-white'
              : 'hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      ))}
      <button
        className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;

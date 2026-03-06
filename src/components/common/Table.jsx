const Table = ({ headers, children, className = '' }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className={`min-w-full border-collapse ${className}`}>
        <thead className="bg-gray-50/80">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

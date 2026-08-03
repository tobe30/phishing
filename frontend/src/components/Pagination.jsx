// Pagination
// Props:
//   currentPage: number
//   totalPages: number
//   totalItems: number
//   rowsPerPage: number
//   onPageChange: (page: number) => void

const Pagination = ({ currentPage, totalPages, totalItems, rowsPerPage, onPageChange }) => {
  const start = (currentPage - 1) * rowsPerPage + 1;
  const end = Math.min(currentPage * rowsPerPage, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-base-content/60">
        {totalItems === 0 ? (
          "No results"
        ) : (
          <>
            Showing <b>{start}</b> – <b>{end}</b> of <b>{totalItems}</b>
          </>
        )}
      </p>

      <div className="flex items-center">
        <button
          className="h-9 rounded-l-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            className={`-ml-px h-9 min-w-9 border px-3 text-sm font-semibold transition ${
              currentPage === page
                ? "relative z-10 border-cyan-500 bg-cyan-500 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        <button
          className="-ml-px h-9 rounded-r-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={totalPages === 0 || currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;

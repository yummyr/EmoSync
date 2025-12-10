import React, { useState } from "react";

/**
 * A pagination component.
 *
 * Props:
 * - totalItems: number — total number of records
 * - pageSize: number — items per page
 * - currentPage: number — current active page
 * - onPageChange: (page) => void — handle page change
 * - onPageSizeChange?: (size) => void — handle page size change
 * - pageSizeOptions?: number[] — available options for items per page
 * - showInfo?: boolean — show total info ("Page 1 of 10")
 */
function Pagination({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  showInfo = true,
}) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const [inputPage, setInputPage] = useState("");

  if (totalPages <= 1 && !showInfo) return null; // hide if only one page

  // --- generate page numbers with ellipsis logic ---
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // number of page buttons visible (excluding ellipsis)

    if (totalPages <= maxVisible) {
      // if totalPages is less than or equal to maxVisible，display all pages
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // calculate page count on left side and right side
      const leftCount = Math.floor((maxVisible - 1) / 2);
      const rightCount = maxVisible - 1 - leftCount;

      if (currentPage <= leftCount + 1) {
        // current page close to start, display pages before maxVisible, then ..., then the last page
        for (let i = 1; i <= maxVisible - 1; i++) pages.push(i);
        pages.push("…", totalPages);
      } else if (currentPage >= totalPages - rightCount) {
        // current page close to end, display the first page, then ..., then pages after maxVisible
        pages.push(1, "…");
        for (let i = totalPages - maxVisible + 2; i <= totalPages; i++)
          pages.push(i);
      } else {
        // current page in the middle, display the first page, then ...,
        // then current page and the page before and after current, then ..., then the last page
        pages.push(1, "…");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("…", totalPages);
      }
    }
    return pages;
  };

  // --- handle "Go to" action ---
  const handleGoToPage = () => {
    const num = parseInt(inputPage);
    if (!isNaN(num) && num >= 1 && num <= totalPages) {
      onPageChange(num);
      setInputPage("");
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4 text-sm">
      {/* === Info Section === */}
      {showInfo && (
        <div className="text-gray-600">
          Page <span className="font-semibold">{currentPage}</span> of{" "}
          <span className="font-semibold">{totalPages}</span> · Total{" "}
          <span className="font-semibold">{totalItems}</span> items
        </div>
      )}

      {/* === Pagination Buttons === */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {/* Prev */}
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`px-3 py-1 rounded-md ${
            currentPage === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-100 hover:bg-gray-300"
          }`}
        >
          Prev
        </button>

        {/* Page Numbers */}
        {getPageNumbers().map((num, i) =>
          num === "…" ? (
            <span key={i} className="px-2 text-gray-500 select-none">
              …
            </span>
          ) : (
            <button
              key={i}
              onClick={() => onPageChange(num)}
              className={`px-3 py-1 rounded-md ${
                currentPage === num
                  ? "bg-[#b08968] text-white"
                  : "bg-gray-100 hover:bg-gray-300"
              }`}
            >
              {num}
            </button>
          )
        )}

        {/* Next */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`px-3 py-1 rounded-md ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-100 hover:bg-gray-300"
          }`}
        >
          Next
        </button>
      </div>

      {/* === Page Size + Go To === */}
      <div className="flex items-center gap-2 text-gray-600">
        <span>Show</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange?.(parseInt(e.target.value))}
          className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#b08968]"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span>per page</span>

        {/* Go To Page */}
        <div className="flex items-center gap-1 ml-4">
          <span>Go to</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            className="w-14 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#b08968]"
          />
          <button
            onClick={handleGoToPage}
            className="px-3 py-1 bg-[#b08968] text-white rounded hover:bg-[#8d6e52]"
          >
            Go
          </button>
        </div>
      </div>
    </div>
  );
}

export default Pagination;
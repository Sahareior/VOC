// components/ui/NavPagination.jsx
'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

const WINDOW_SIZE = 5;

export default function NavPagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Calculate the current window start
  const windowStart = Math.floor((currentPage - 1) / WINDOW_SIZE) * WINDOW_SIZE + 1;
  const windowEnd = Math.min(windowStart + WINDOW_SIZE - 1, totalPages);

  const pages = Array.from(
    { length: windowEnd - windowStart + 1 },
    (_, i) => windowStart + i
  );

  const canGoPrevWindow = windowStart > 1;
  const canGoNextWindow = windowEnd < totalPages;

  const handlePrevWindow = () => {
    const newPage = windowStart - 1; // go to last page of previous window
    onPageChange(newPage);
  };

  const handleNextWindow = () => {
    const newPage = windowEnd + 1; // go to first page of next window
    onPageChange(newPage);
  };

  return (
    <div className="flex items-center justify-center gap-1">
      {/* Left chevron */}
      <button
        onClick={handlePrevWindow}
        disabled={!canGoPrevWindow}
        className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors
          ${canGoPrevWindow
            ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer'
            : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
          }`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page number buttons */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium transition-colors
            ${currentPage === page
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
        >
          {page}
        </button>
      ))}

      {/* Right chevron */}
      <button
        onClick={handleNextWindow}
        disabled={!canGoNextWindow}
        className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors
          ${canGoNextWindow
            ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer'
            : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
          }`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
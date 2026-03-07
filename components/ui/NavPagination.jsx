"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../../lib/utils";

export default function NavPagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const getPageRange = () => {
    const delta = window.innerWidth < 768 ? 2 : 6; // Show even more on desktop
    const range = [];
    const rangeWithDots = [];
    let l;

    // Special case: if total pages is small, show all
    if (totalPages <= 10) {
      for (let i = 1; i <= totalPages; i++) range.push(i);
    } else {
      // Calculate a window that keeps about 9 numbers visible
      let start = Math.max(1, currentPage - delta);
      let end = Math.min(totalPages, currentPage + delta);

      // Adjust window if near boundaries
      if (currentPage <= delta) {
        end = 2 * delta + 1;
      } else if (currentPage > totalPages - delta) {
        start = totalPages - 2 * delta;
      }

      for (let i = start; i <= end; i++) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    // Add first and last if not already there
    if (rangeWithDots[0] !== 1) {
      if (rangeWithDots[0] === 2) rangeWithDots.unshift(1);
      else if (rangeWithDots[0] !== "...") rangeWithDots.unshift(1, "...");
    }
    if (rangeWithDots[rangeWithDots.length - 1] !== totalPages) {
      if (rangeWithDots[rangeWithDots.length - 1] === totalPages - 1)
        rangeWithDots.push(totalPages);
      else if (rangeWithDots[rangeWithDots.length - 1] !== "...")
        rangeWithDots.push("...", totalPages);
    }

    return rangeWithDots;
  };

  const pages = getPageRange();

  return (
    <div className="flex flex-col sm:flex-row items-center md:justify-start justify-center gap-4 py-4 px-1 select-none">
      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-10 h-10 rounded-full hover:bg-red-50 hover:text-red-500 transition-all border border-slate-200 disabled:opacity-20"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-1 sm:gap-2 mx-1 sm:mx-2">
          {pages.map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === "number" && onPageChange(page)}
              disabled={typeof page !== "number"}
              className={cn(
                "min-w-[40px] h-10 px-2 flex items-center justify-center rounded-full text-sm font-semibold transition-all border",
                typeof page !== "number"
                  ? "border-transparent cursor-default text-slate-400"
                  : currentPage === page
                    ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-200"
                    : "bg-white border-slate-200 text-slate-600 hover:border-red-400 hover:text-red-500",
              )}
            >
              {page}
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-10 h-10 rounded-full hover:bg-red-50 hover:text-red-500 transition-all border border-slate-200 disabled:opacity-20"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../../lib/utils";

export default function NavPagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (totalPages <= 1) return null;

  const getPageRange = () => {
    const isMobile = windowWidth < 640;
    const isTablet = windowWidth < 1024;

    // delta determines how many pages to show around the current page
    // User wants to see 3 buttons ahead of current page
    const delta = isMobile ? 1 : isTablet ? 2 : 3;

    const range = [];
    const rangeWithDots = [];
    let l;

    // Calculate start and end of the visible range
    let start = Math.max(1, currentPage - (isMobile ? 1 : 2));
    let end = Math.min(totalPages, currentPage + delta);

    // Ensure we show at least a certain number of buttons if possible
    const minButtons = isMobile ? 3 : 5;
    if (end - start + 1 < minButtons) {
      if (start === 1) {
        end = Math.min(totalPages, start + minButtons - 1);
      } else if (end === totalPages) {
        start = Math.max(1, end - minButtons + 1);
      }
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
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
      if (rangeWithDots[0] === 2) {
        rangeWithDots.unshift(1);
      } else {
        rangeWithDots.unshift(1, "...");
      }
    }

    if (rangeWithDots[rangeWithDots.length - 1] !== totalPages) {
      if (rangeWithDots[rangeWithDots.length - 1] === totalPages - 1) {
        rangeWithDots.push(totalPages);
      } else {
        rangeWithDots.push("...", totalPages);
      }
    }

    return rangeWithDots;
  };

  const pages = getPageRange();

  return (
    <div className="flex flex-col sm:flex-row items-center md:justify-start justify-center gap-4 px-1 select-none w-full overflow-hidden">
      <div className="flex items-center flex-wrap justify-center gap-1 sm:gap-2 w-full sm:w-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-red-50 hover:text-red-500 transition-all border border-slate-200 disabled:opacity-20 shrink-0"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>

        <div className="flex items-center flex-wrap justify-center gap-1 sm:gap-2 mx-1">
          {pages.map((page, index) => (
            <button
              key={`${page}-${index}`}
              onClick={() => typeof page === "number" && onPageChange(page)}
              disabled={typeof page !== "number"}
              className={cn(
                "min-w-[32px] sm:min-w-[40px] h-8 sm:h-10 px-1 sm:px-2 flex items-center justify-center rounded-full text-xs sm:text-sm font-semibold transition-all border shrink-0",
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
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-red-50 hover:text-red-500 transition-all border border-slate-200 disabled:opacity-20 shrink-0"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>
    </div>
  );
}


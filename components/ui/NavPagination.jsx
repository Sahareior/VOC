'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export default function NavPagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages < 1) return null;

    return (
        <div className="flex items-center justify-between gap-4 py-2 px-1">
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 h-10 border-slate-200 hover:border-red-500 hover:text-red-500 transition-all duration-300 rounded-full disabled:opacity-30"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline font-medium">Previous</span>
                </Button>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-6 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-full border border-slate-100 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Page
                </span>
                <span className="text-sm font-bold text-red-600 dark:text-red-400 min-w-[1.5rem] text-center">
                    {currentPage}
                </span>
                <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
                    /
                </span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 min-w-[1.5rem] text-center">
                    {totalPages}
                </span>
            </div>

            <div className="flex sm:hidden items-center text-sm font-bold text-slate-700 dark:text-slate-300">
                {currentPage} / {totalPages}
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 h-10 border-slate-200 hover:border-red-500 hover:text-red-500 transition-all duration-300 rounded-full disabled:opacity-30"
                >
                    <span className="hidden sm:inline font-medium">Next</span>
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}

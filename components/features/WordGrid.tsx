'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { WordCard } from './WordCard';
import { Button } from '@/components/ui/Button';
import { Word } from '@/types';
import { cn } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';

interface WordGridProps {
  words: Word[];
  onOpenModal: (word: Word) => void;
}

type SortMode = 'random' | 'az' | 'newest';

export function WordGrid({ words, onOpenModal }: WordGridProps) {
  const { isLearned, isFavorite, toggleLearned, toggleFavorite } = useUser();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('random');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [hasPaginated, setHasPaginated] = useState(false); // Track if user has paginated

  // Ref for the component container
  const componentRef = useRef<HTMLDivElement>(null);

  const filteredWords = useMemo(() => {
    let result = words.filter((word) => {
      const q = searchQuery.toLowerCase();
      return (
        word.term.toLowerCase().includes(q) ||
        word.definition.toLowerCase().includes(q) ||
        word.synonyms.some((syn) => syn.toLowerCase().includes(q))
      );
    });

    switch (sortMode) {
      case 'az':
        return [...result].sort((a, b) =>
          a.term.localeCompare(b.term)
        );

      case 'newest':
        return [...result].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );

      case 'random':
      default:
        return [...result].sort(() => Math.random() - 0.5);
    }
  }, [words, searchQuery, sortMode]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredWords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWords = filteredWords.slice(startIndex, endIndex);

  // Reset to first page when search or sort changes
  React.useEffect(() => {
    setCurrentPage(1);
    setHasPaginated(false); // Reset pagination tracking when search/sort changes
  }, [searchQuery, sortMode]);

  // Function to scroll to the top of the component
  const scrollToTop = () => {
    if (componentRef.current) {
      // Get the position of the component relative to the viewport
      const elementPosition = componentRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 100; // Adjust 100px for some padding

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else {
      // Fallback: scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Scroll to top only when user has actually paginated (not on initial render)
  useEffect(() => {
    if (hasPaginated) {
      scrollToTop();
    }
  }, [currentPage, hasPaginated]);

  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      setHasPaginated(true);
    }
    setCurrentPage(page);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={cn(
            'px-3 py-1.5 rounded-md text-sm font-medium transition',
            currentPage === i
              ? 'bg-orange-500 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          )}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div ref={componentRef} className="space-y-6">
      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search */}
        <div className="relative w-full flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search words, definitions, or synonyms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:w-[50%] w-full pl-10 pr-10 px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort buttons */}
      
      </div>

      {/* Results count */}
      

      {/* Word grid */}
      {currentWords.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentWords.map((word) => (
              <WordCard
                key={word.id}
                word={word}
                isLearned={isLearned(word.id)}
                isFavorite={isFavorite(word.id)}
                onOpenModal={onOpenModal}
                onToggleFavorite={toggleFavorite}
                onToggleLearned={toggleLearned}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Page {currentPage} of {totalPages}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={cn(
                    'p-2 rounded-md transition',
                    currentPage === 1
                      ? 'opacity-50 cursor-not-allowed text-slate-400'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  )}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Page Numbers */}
                <div className="flex gap-3">
                  {renderPageNumbers()}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={cn(
                    'p-2 rounded-md transition',
                    currentPage === totalPages
                      ? 'opacity-50 cursor-not-allowed text-slate-400'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  )}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Items Per Page Selector (Optional) */}
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span>Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    // You could make this state variable if you want it to be changeable
                    // setItemsPerPage(Number(e.target.value));
                  }}
                  className="bg-transparent border-none focus:outline-none"
                  disabled // Remove this if you make it changeable
                >
                  <option value="12">12</option>
                  <option value="24">24</option>
                  <option value="48">48</option>
                  <option value="96">96</option>
                </select>
                <span>per page</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">
            No words found
          </h3>
          <p className="text-slate-500 mb-4">
            Try a different search term
          </p>
          <Button variant="outline" onClick={() => setSearchQuery('')}>
            Clear search
          </Button>
        </div>
      )}
    </div>
  );
}
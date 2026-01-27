'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { WordCard } from './WordCard';
import { Button } from '@/components/ui/Button';
import { Word } from '@/types';
import { cn } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';
import { useGetWordsQuery, useLazyGetSearchWordsQuery } from '@/redux/slices/apiSlice';

// Types
type SortType = 'id' | 'az' | 'za' | 'random';

interface WordGridProps {
  onOpenModal: (word: Word) => void;
  onWordsUpdate?: (words: Word[]) => void;
}

interface SortOption {
  key: SortType;
  label: string;
}

// Sort options configuration
const SORT_OPTIONS: SortOption[] = [
  { key: 'random', label: 'Random' },
  { key: 'az', label: 'A-Z' },
  { key: 'za', label: 'Z-A' },
  { key: 'id', label: 'Newest' },
];

export function WordGrid({ onOpenModal, onWordsUpdate }: WordGridProps) {
  const { isLearned, isFavorite, toggleLearned, toggleFavorite } = useUser();
  
  // State
  const [activeSort, setActiveSort] = useState<SortType>('id');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [hasPaginated, setHasPaginated] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);

  // RTK Query hooks
  const { 
    data: paginatedData, 
    isLoading: isLoadingPaginated, 
    error, 
    refetch 
  } = useGetWordsQuery({
    offset: (currentPage - 1) * itemsPerPage,
    limit: itemsPerPage,
    sort: activeSort,
  }, {
    skip: isSearchMode, // Skip this query when in search mode
  });

  // Lazy search query
  const [
    triggerSearch, 
    { 
      data: searchData, 
      isLoading: isSearchLoading,
      isFetching: isSearchFetching
    }
  ] = useLazyGetSearchWordsQuery();

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        setIsSearchMode(true);
        triggerSearch(searchQuery);
      } else {
        setIsSearchMode(false);
        setCurrentPage(1);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, triggerSearch]);

  // Transform search results with dummy data
  const transformSearchResults = useCallback((results: any[]): Word[] => {
    if (!Array.isArray(results)) return [];
    
    return results.map((item) => ({
      id: item.id || Math.floor(Math.random() * 10000),
      slug: item.slug || 'unknown-word',
      name: item.slug || 'Unknown Word',
      sentence: 'Example will load when you view the word',
      definition: 'Search result - load full details on click',
      type: 'noun',
      image: 'https://via.placeholder.com/300x200?text=' + (item.slug || 'word'),
      category: {
        id: 1,
        name: 'General',
        slug: 'general'
      },
      subcategory: {
        id: 1,
        name: 'Vocabulary',
        slug: 'vocabulary'
      },
      term: item.slug || 'Unknown Word',
      phonetic: '/',
      example: 'Example will load when you view the word',
      difficulty: 'beginner' as const,
      synonyms: [],
      antonyms: [],
      createdAt: new Date().toISOString(),
    })) as any;
  }, []);

  // Determine which data to use
  const currentWords = useMemo(() => {
    if (isSearchMode && searchData) {
      // Handle different response formats
      const words = searchData?.words || searchData?.data || searchData;
      const wordArray = Array.isArray(words) ? words : [];
      return transformSearchResults(wordArray);
    }
    return paginatedData?.words || [];
  }, [isSearchMode, searchData, paginatedData, transformSearchResults]);

  // Call onWordsUpdate whenever currentWords changes
  useEffect(() => {
    if (onWordsUpdate) {
      onWordsUpdate(currentWords);
    }
  }, [currentWords, onWordsUpdate]);

  // Determine loading state
  const isLoading = useMemo(() => {
    if (isSearchMode) {
      return isSearchLoading || isSearchFetching;
    }
    return isLoadingPaginated;
  }, [isSearchMode, isSearchLoading, isSearchFetching, isLoadingPaginated]);

  // Total items calculation
  const totalItems = useMemo(() => {
    if (isSearchMode) {
      return searchData?.total || currentWords.length;
    }
    return paginatedData?.total || 0;
  }, [isSearchMode, searchData, paginatedData, currentWords.length]);

  // Total pages calculation
  const totalPages = useMemo(() => {
    if (isSearchMode) {
      // For search results, show all items on one page
      return 1;
    }
    return Math.ceil(totalItems / itemsPerPage);
  }, [isSearchMode, totalItems, itemsPerPage]);

  // Handle sort change
  const handleSortChange = useCallback((sortType: SortType) => {
    setActiveSort(sortType);
    setCurrentPage(1);
    setHasPaginated(false);
    if (isSearchMode) {
      setIsSearchMode(false);
      setSearchQuery('');
    }
  }, [isSearchMode]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    if (page !== currentPage) {
      setHasPaginated(true);
    }
    setCurrentPage(page);
    setIsSearchMode(false); // Leave search mode when paginating
  }, [currentPage]);

  // Handle search change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (!value.trim()) {
      setIsSearchMode(false);
      setCurrentPage(1);
    }
  }, []);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setIsSearchMode(false);
    setCurrentPage(1);
  }, []);

  // Scroll to top helper
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Scroll to top when page changes
  useEffect(() => {
    if (hasPaginated) {
      scrollToTop();
    }
  }, [currentPage, hasPaginated, scrollToTop]);

  // Render page numbers
  const renderPageNumbers = () => {
    if (isSearchMode) return null; // No pagination in search mode

    const pages: JSX.Element[] = [];
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
            'min-w-[40px] px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
            currentPage === i
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105'
          )}
          aria-label={`Go to page ${i}`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  // Loading state
  if (isLoading && currentPage === 1 && !isSearchMode) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto" />
          <p className="text-slate-500 dark:text-slate-400">Loading words...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold mb-2 text-red-600 dark:text-red-400">
          Error loading words
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          Please try again later
        </p>
        <Button 
          variant="outline" 
          onClick={() => refetch()}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search + Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search words, definitions, or synonyms..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-[70%] pl-10 pr-10 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
            aria-label="Search words"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Buttons */}
        <div className="flex gap-5">
          {SORT_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleSortChange(key)}
              className={cn(
                'shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap',
                activeSort === key
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105'
              )}
              aria-label={`Sort by ${label}`}
              aria-pressed={activeSort === key}
              disabled={isSearchMode} // Disable sort during search
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Info */}
      <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400">
        <span>
          {isSearchMode 
            ? `Search results for "${searchQuery}" (${currentWords.length} found)`
            : `Page ${currentPage} of ${totalPages}`
          }
        </span>
        {isLoading && (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading...</span>
          </div>
        )}
      </div>

      {/* Words Grid */}
      {currentWords.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentWords.map((word) => (
              <WordCard
                key={`${word.id}-${currentPage}-${isSearchMode ? 'search' : 'normal'}`}
                word={word}
                isLearned={isLearned(word.id)}
                isFavorite={isFavorite(word.id)}
                onOpenModal={onOpenModal}
                onToggleFavorite={toggleFavorite}
                onToggleLearned={toggleLearned}
              />
            ))}
          </div>

          {/* Pagination Controls - Only show when not in search mode */}
          {!isSearchMode && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Page {currentPage} of {totalPages} • {totalItems} total items
              </div>

              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className={cn(
                    'p-2 rounded-md transition-all duration-200',
                    currentPage === 1 || isLoading
                      ? 'opacity-50 cursor-not-allowed text-slate-400'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:scale-105'
                  )}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Page Numbers */}
                <div className="flex gap-1">{renderPageNumbers()}</div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  className={cn(
                    'p-2 rounded-md transition-all duration-200',
                    currentPage === totalPages || isLoading
                      ? 'opacity-50 cursor-not-allowed text-slate-400'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:scale-105'
                  )}
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Items Per Page Info */}
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Showing {Math.min(itemsPerPage, currentWords.length)} per page
              </div>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="text-6xl mb-4">
            {isSearchMode ? '🔍' : '📚'}
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
            {isSearchMode ? 'No search results found' : 'No words available'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            {isSearchMode
              ? `Try a different search term for "${searchQuery}"`
              : 'Check back later for new words'}
          </p>
          {isSearchMode && (
            <Button variant="outline" onClick={handleClearSearch}>
              Clear search
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
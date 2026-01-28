'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { WordCard } from './WordCard';

import { useUser } from '../../contexts/UserContext';
import { useGetWordsQuery, useLazyGetSearchWordsQuery } from '../../redux/slices/apiSlice';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';


const SORT_OPTIONS = [
  { key: 'random', label: 'Random' },
  { key: 'az', label: 'A-Z' },
  { key: 'za', label: 'Z-A' },
  { key: 'id', label: 'Newest' },
];

export function WordGrid({ onOpenModal, onWordsUpdate }) {
  const { isLearned, isFavorite, toggleLearned, toggleFavorite } = useUser();
  const gridContainerRef = useRef(null);
  const [activeSort, setActiveSort] = useState('id');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [hasPaginated, setHasPaginated] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const searchTimeoutRef = useRef(null);

  const { 
    data: paginatedData, 
    isLoading: isLoadingPaginated, 
    error, 
    refetch 
  } = useGetWordsQuery({
    offset: (currentPage - 1) * itemsPerPage,
    limit: 20,
    sort: activeSort,
  }, {
    skip: isSearchMode, 
  });

  const [
    triggerSearch, 
    { 
      data: searchData, 
      isLoading: isSearchLoading,
      isFetching: isSearchFetching
    }
  ] = useLazyGetSearchWordsQuery();

  // Optimized search debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        setIsSearchMode(true);
        triggerSearch(searchQuery);
      } else {
        setIsSearchMode(false);
        setCurrentPage(1);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, triggerSearch]);

  // Memoize transform function with useCallback
  const transformSearchResults = useCallback((results) => {
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
      difficulty: 'beginner',
      synonyms: [],
      antonyms: [],
      createdAt: new Date().toISOString(),
    }));
  }, []);

  // Optimize currentWords calculation
  const currentWords = useMemo(() => {
    if (isSearchMode && searchData) {
      const words = searchData?.words || searchData;
      const wordArray = Array.isArray(words) ? words : [];
      return transformSearchResults(wordArray);
    }
    return paginatedData?.words || [];
  }, [isSearchMode, searchData, paginatedData, transformSearchResults]);

  // Debounce onWordsUpdate to reduce parent re-renders
  const prevWordsRef = useRef();
  useEffect(() => {
    if (onWordsUpdate && prevWordsRef.current !== currentWords) {
      prevWordsRef.current = currentWords;
      onWordsUpdate(currentWords);
    }
  }, [currentWords, onWordsUpdate]);

  const isLoading = isSearchMode 
    ? isSearchLoading || isSearchFetching 
    : isLoadingPaginated;

  const totalItems = isSearchMode 
    ? searchData?.total || currentWords.length 
    : paginatedData?.total || 0;

  const totalPages = isSearchMode 
    ? 1 
    : Math.ceil(totalItems / itemsPerPage);

  const handleSortChange = useCallback((sortType) => {
    setActiveSort(sortType);
    setCurrentPage(1);
    setHasPaginated(false);
    if (isSearchMode) {
      setIsSearchMode(false);
      setSearchQuery('');
    }
  }, [isSearchMode]);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (!value.trim()) {
      setIsSearchMode(false);
      setCurrentPage(1);
    }
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setIsSearchMode(false);
    setCurrentPage(1);
  }, []);

  // Optimized smooth scroll
  useEffect(() => {
    if (currentPage > 1 && gridContainerRef.current) {
      requestAnimationFrame(() => {
        gridContainerRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      });
    }
  }, [currentPage]);

  const handlePagination = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);

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
    <div ref={gridContainerRef} className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search words, definitions, or synonyms..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-[70%] pl-10 pr-10 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent will-change-transform"
            aria-label="Search words"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 touch-manipulation"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-7 scrollbar-hide">
          {SORT_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleSortChange(key)}
              className={cn(
                'shrink-0 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap touch-manipulation',
                activeSort === key
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              )}
              aria-label={`Sort by ${label}`}
              aria-pressed={activeSort === key}
              disabled={isSearchMode}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

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

      {currentWords.length > 0 ? (
        <>
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
            style={{ 
              contentVisibility: 'auto',
              containIntrinsicSize: 'auto 500px'
            }}
          >
            {currentWords.map((word) => (
              <WordCard
                key={`${word.id}-${currentPage}-${isSearchMode ? 'search' : 'normal'}`}
                word={word}
                isLearned={isLearned(String(word.id))}
                isFavorite={isFavorite(String(word.id))}
                onOpenModal={onOpenModal}
                onToggleFavorite={toggleFavorite}
                onToggleLearned={toggleLearned}
              />
            ))}
          </div>

          <div className='flex justify-center items-center pt-4'>
            <button
              onClick={handlePagination}
              disabled={isLoading || isSearchMode}
              className="
                flex items-center justify-center
                px-6 py-3
                rounded-xl
                bg-purple-500 text-white
                font-medium
                shadow-md
                touch-manipulation
                active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed
                will-change-transform
              "
              aria-label="Load more words"
            >
              {isLoading ? 'Loading...' : 'Load more'}
            </button>
          </div>
        </>
      ) : (
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
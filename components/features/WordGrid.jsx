'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { WordCard } from './WordCard';
// import { DUMMY_WORDS } from '../../lib/dummyData';

import { useUser } from '../../contexts/UserContext';
import { useGetWordsQuery, useLazyGetSearchWordsQuery } from '../../redux/slices/apiSlice';
import { Button } from '../ui/Button';
import GroupsFiltter from '../../app/homepage-component/GroupsFiltter';
import { DUMMY_WORDS } from '../../lib/dummyData';
import NavPagination from '../ui/NavPagination'







export function WordGrid({ onOpenModal, onWordsUpdate, groupPageData }) {
  const { isLearned, isFavorite, toggleLearned, toggleFavorite, searchQuery, activeSort } = useUser();
  const getItemsPerPage = () => {
    if (typeof window === 'undefined') return 20; // SSR safety
    return window.innerWidth < 768 ? 10 : 12;
  };

  const gridContainerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(getItemsPerPage);
  const [groupsData, setGroupsData] = useState([])
  const [isSearchMode, setIsSearchMode] = useState(false);
  const searchTimeoutRef = useRef(null);
  const { setAllData } = useUser()

  const [
    triggerSearch,
    {
      data: searchData,
      isLoading: isSearchLoading,
      isFetching: isSearchFetching
    }
  ] = useLazyGetSearchWordsQuery();

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
    skip: isSearchMode
  });

  // Reset to first page when sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeSort]);

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
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, triggerSearch]);


  const transformSearchResults = useCallback((results) => {
    if (!Array.isArray(results)) return [];

    return results.map((item) => ({
      id: item.id,
      name: item.name ?? item.slug,
      slug: item.slug,
      term: item.name ?? item.slug,
      sentence: item.sentence ?? [],
      definition: item.definition ?? '',
      type: item.type ?? 'noun',
      image: item.image ?? '',
      category: item.category ?? null,
      subcategory: item.subcategory ?? null,
    }));
  }, []);

  console.log(paginatedData, 'this is paginated data')


  // Optimize currentWords calculation
  const currentWords = useMemo(() => {
    if (isSearchMode && searchData) {
      const words = searchData?.words || searchData;
      const wordArray = Array.isArray(words) ? words : [];
      const transformed = transformSearchResults(wordArray);
      setAllData(transformed);
      return transformed;
    }
    if (groupsData?.length > 0) {
      setAllData(groupsData)
      return groupsData
    }

    if (groupPageData?.length > 0) {
      setAllData(groupPageData)
      return groupPageData
    }

    const apiWords = paginatedData?.words || [];
    const finalWords = apiWords.length > 0 ? apiWords : DUMMY_WORDS;

    setAllData(finalWords)
    return finalWords;
  }, [isSearchMode, searchData, paginatedData, transformSearchResults, groupsData, groupPageData, setAllData]);

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

  const totalItems = useMemo(() => {
    if (isSearchMode) {
      return searchData?.total || searchData?.count || currentWords.length;
    }
    // Check multiple common field names for total count from the API
    const totalFromApi = paginatedData?.total ?? paginatedData?.count ?? paginatedData?.total_count ?? paginatedData?.totalWords;
    if (totalFromApi !== undefined) return totalFromApi;

    // Fallback to the 'total' field within individual word objects if present (as seen in dummyData)
    if (currentWords.length > 0 && currentWords[0].total) {
      return currentWords[0].total;
    }

    // Default to a guess: if the current page is "full", assume there's at least one more page
    const knownCount = (currentPage - 1) * itemsPerPage + currentWords.length;
    if (currentWords.length === itemsPerPage) {
      return knownCount + 1; // This enables the "Next" button
    }

    return knownCount;
  }, [isSearchMode, searchData, paginatedData, currentWords, currentPage, itemsPerPage]);

  const totalPages = Math.max(Math.ceil(totalItems / itemsPerPage), 1);

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


  console.log(groupsData, 'this is groups data')
  console.log(groupPageData, 'this is page data')


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

  if (error && !DUMMY_WORDS?.length) {
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
    <div ref={gridContainerRef} className="">


      <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400">

        {isLoading && (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading...</span>
          </div>
        )}
      </div>

      {currentWords.length > 0 ? (
        <>
          {!isSearchMode && (
            <div className="py-4">
              <NavPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
          <div
            className="grid grid-cols-1 my-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6"
            style={{
              contentVisibility: 'auto',
              containIntrinsicSize: 'auto 500px'
            }}
          >
            {currentWords.map((word) => (
              <WordCard
                key={`${word.id}-${currentPage}`}
                word={word}
                isLearned={isLearned(String(word.id))}
                isFavorite={isFavorite(String(word.id))}
                onOpenModal={onOpenModal}
                onToggleFavorite={toggleFavorite}
                onToggleLearned={toggleLearned}
              />
            ))}
          </div>
          {!isSearchMode && (
            <div className="py-6 border-t border-gray-100 mt-8">
              <NavPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
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
        </div>
      )}
    </div>
  );
}
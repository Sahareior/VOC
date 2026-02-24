'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { WordCard } from './WordCard';
// import { DUMMY_WORDS } from '../../lib/dummyData';

import { useUser } from '../../contexts/UserContext';
import { useGetWordsQuery, useLazyGetSearchWordsQuery } from '../../redux/slices/apiSlice';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import GroupsFiltter from '../../app/homepage-component/GroupsFiltter';
import { DUMMY_WORDS } from '../../lib/dummyData';




const SORT_OPTIONS = [
  { key: 'random', label: 'Random' },
  { key: 'az', label: 'A-Z' },
  { key: 'za', label: 'Z-A' },
  { key: 'id', label: 'Newest' },
];

export function WordGrid({ onOpenModal, onWordsUpdate,groupPageData}) {
  const { isLearned, isFavorite, toggleLearned, toggleFavorite } = useUser();
const getItemsPerPage = () => {
  if (typeof window === 'undefined') return 20; // SSR safety
  return window.innerWidth < 768 ? 10 : 20;
};

  const gridContainerRef = useRef(null);
  const [activeSort, setActiveSort] = useState('id');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(getItemsPerPage);
  const [hasPaginated, setHasPaginated] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [groupsData,setGroupsData] = useState([])
  const searchTimeoutRef = useRef(null);

  const {setAllData} = useUser()

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

  
const transformSearchResults = useCallback((results) => {
  if (!Array.isArray(results)) return [];

  return results.map((item) => ({
    // REQUIRED
    id: item.id,
    name: item.name ?? item.slug,
    slug: item.slug,
    term: item.name ?? item.slug,

    // CONTENT
    sentence: item.sentence ?? '',
    definition: item.definition ?? '',
    type: item.type ?? 'noun',
    image: item.image ?? '',

    // ✅ REAL backend data (no hardcoding)
    category: item.category ?? null,
    subcategory: item.subcategory ?? null,

    // OPTIONAL (WordCard-safe defaults)
    phonetic: item.phonetic ?? '',
    difficulty: item.difficulty ?? 'beginner',
    synonyms: item.synonyms ?? [],
    antonyms: item.antonyms ?? [],
    example: item.example ?? item.sentence ?? '',

    createdAt: item.createdAt ?? new Date().toISOString(),
  }));
}, []);


  // Optimize currentWords calculation
  const currentWords = useMemo(() => {
    if (isSearchMode && searchData) {
      const words = searchData?.words || searchData;
      const wordArray = Array.isArray(words) ? words : [];
      setAllData(transformSearchResults(wordArray))
      return transformSearchResults(wordArray);
    }
    if(groupsData?.length> 0){
      setAllData(groupsData)
      return groupsData
    }

    if(groupPageData?.length > 0){
       setAllData(groupPageData)
      return groupPageData
    }
    
    const apiWords = paginatedData?.words || [];
    const finalWords = apiWords.length > 0 ? apiWords : DUMMY_WORDS;
    
    setAllData(finalWords)
    return finalWords;
  }, [isSearchMode, searchData, paginatedData, transformSearchResults,groupsData,groupPageData, setAllData]);

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


console.log(groupsData,'this is groups data')
console.log(groupPageData,'this is page data')


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
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6"
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
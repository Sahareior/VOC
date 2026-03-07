'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { WordDetailView } from '../../../components/features/WordDetailView';
import { DUMMY_WORDS } from '../../../lib/dummyData';
import { useUser } from '../../../contexts/UserContext';
import { useGetWordsQuery } from '../../../redux/slices/apiSlice';
import { ChevronLeft, Loader2 } from 'lucide-react';

export default function WordPage() {
  const { id } = useParams();
  const router = useRouter();
  const { allData, toggleFavorite, isFavorite, activeSort } = useUser();

  const wordId = Number(id);

  // Fetch words if they are not in context (paged refresh safety)
  // We fetch a larger batch here to increase chance of finding the word and supporting next navigation
  const { data: apiData, isLoading } = useGetWordsQuery({
    offset: 0,
    limit: 100, // Fetch more to cover refresh scenarios
    sort: activeSort || 'id',
  }, {
    skip: allData && allData.length > 0 // Only fetch if we don't have data in context
  });

  // Use allData from context if available, otherwise use API data or fallback to DUMMY_WORDS
  const wordsToSearch = useMemo(() => {
    if (allData && allData.length > 0) return allData;
    if (apiData?.words && apiData.words.length > 0) return apiData.words;
    return DUMMY_WORDS;
  }, [allData, apiData]);

  const word = useMemo(() => {
    return wordsToSearch.find(w => Number(w.id) === wordId);
  }, [wordsToSearch, wordId]);

  const currentIndex = useMemo(() => {
    return wordsToSearch.findIndex(w => Number(w.id) === wordId);
  }, [wordsToSearch, wordId]);

  const handleNext = () => {
    if (currentIndex < wordsToSearch.length - 1) {
      const nextWord = wordsToSearch[currentIndex + 1];
      router.push(`/word/${nextWord.id}`);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevWord = wordsToSearch[currentIndex - 1];
      router.push(`/word/${prevWord.id}`);
    }
  };

  if (isLoading && (!allData || allData.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-slate-500">Loading word details...</p>
      </div>
    );
  }

  if (!word) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Word Not Found</h1>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2 bg-slate-900 text-white rounded-lg"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto md:px-6 py-4">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 group"
        >
          <div className="p-2 rounded-full group-hover:bg-slate-100">
            <ChevronLeft className="w-5 h-5" />
          </div>
          <span className="font-medium">Back</span>
        </button>

        <WordDetailView
          word={word}
          isFavorite={isFavorite(String(word.id))}
          onToggleFavorite={toggleFavorite}
          onNext={currentIndex < wordsToSearch.length - 1 ? handleNext : null}
          onPrevious={currentIndex > 0 ? handlePrevious : null}
          currentIndex={currentIndex}
          totalWords={wordsToSearch.length}
          onSpeechEnd={handleNext} // Always trigger handleNext, it has its own boundary check
        />
      </div>
    </div>
  );
}

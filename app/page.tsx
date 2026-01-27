'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { WordGrid } from '@/components/features/WordGrid';
import { WordModal } from '@/components/features/WordModal';
import { Word, SortType } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { VoiceHelpModal } from '@/components/features/VoiceController';
import Hero from './homepage-component/Hero';
import { useGetWordsQuery } from '@/redux/slices/apiSlice';

export default function HomePage() {
  const { isLearned, isFavorite, toggleLearned, toggleFavorite } = useUser();
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [displayWords, setDisplayWords] = useState<Word[]>([]);


  // Open word modal
  const handleOpenModal = useCallback((word: Word) => {
    setSelectedWord(word);
    setIsModalOpen(true);
  }, []);

  // Close word modal
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedWord(null);
  }, []);

const onNext = (currentIndex: number) => {
  if (currentIndex < displayWords.length - 1) {
    setSelectedWord(displayWords[currentIndex + 1]);
  }
};

const onPrevious = (currentIndex: number) => {
  if (currentIndex > 0) {
    setSelectedWord(displayWords[currentIndex - 1]);
  }
};

  // Get word index for display
  const getWordIndex = useCallback(() => {
    if (!selectedWord || displayWords.length === 0) return null;
    return displayWords.findIndex(w => w.id === selectedWord.id) + 1;
  }, [selectedWord, displayWords]);

  // Show loading state
  if (false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 animate-pulse text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Loading words...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Error loading words. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Voice help modal */}
      <VoiceHelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Hero Section */}
      <Hero />

      {/* Word Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Explore Words
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Click on any card to view details, pronunciation, and examples
            </p>
          </div>
        </div>

        <WordGrid 
          onOpenModal={handleOpenModal} 
          onWordsUpdate={setDisplayWords}
        />
      </section>

      {/* Word Detail Modal */}
      {displayWords.length > 0 && (
        <WordModal
          word={selectedWord}
          onNext={onNext}
          onPrevious={onPrevious}
          isOpen={isModalOpen}
          isLearned={selectedWord ? isLearned(selectedWord.id) : false}
          isFavorite={selectedWord ? isFavorite(selectedWord.id) : false}
          onClose={handleCloseModal}
          onToggleFavorite={toggleFavorite}
          onToggleLearned={toggleLearned}
          currentIndex={selectedWord ? displayWords.findIndex(w => w.id === selectedWord.id) : null}
          totalWords={displayWords.length}
        />
      )}
    </div>
  );
}
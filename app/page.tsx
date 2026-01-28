'use client';

import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { Sparkles } from 'lucide-react';
import { Word } from '@/types';
import { useUser } from '@/contexts/UserContext';
import Hero from './homepage-component/Hero';

// Lazy load heavy components
const WordGrid = lazy(() => import('@/components/features/WordGrid').then(mod => ({ default: mod.WordGrid })));
const WordModal = lazy(() => import('@/components/features/WordModal').then(mod => ({ default: mod.WordModal })));
const VoiceHelpModal = lazy(() => import('@/components/features/VoiceController').then(mod => ({ default: mod.VoiceHelpModal })));

export default function HomePage() {
  const { isLearned, isFavorite, toggleLearned, toggleFavorite } = useUser();
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [displayWords, setDisplayWords] = useState<Word[]>([]);
  const [shouldLoadGrid, setShouldLoadGrid] = useState(false);

  // Load WordGrid after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoadGrid(true);
    }, 100); // Small delay after FCP

    return () => clearTimeout(timer);
  }, []);

  const handleOpenModal = useCallback((word: Word) => {
    setSelectedWord(word);
    setIsModalOpen(true);
  }, []);

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
  // Rest of your component...

  return (
    <div className="min-h-screen">
      <Suspense fallback={null}>
        {isHelpOpen && (
          <VoiceHelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
        )}
      </Suspense>

      <Hero />

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

        <Suspense fallback={
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto" />
              <p className="text-slate-500 dark:text-slate-400">Loading words...</p>
            </div>
          </div>
        }>
          {shouldLoadGrid && (
            <WordGrid 
              onOpenModal={handleOpenModal} 
              onWordsUpdate={setDisplayWords}
            />
          )}
        </Suspense>
      </section>

      <Suspense fallback={null}>
        {displayWords.length > 0 && isModalOpen && (
          <WordModal
            word={selectedWord}
            onNext={onNext}
            onPrevious={onPrevious}
            isOpen={isModalOpen}
            
            isFavorite={selectedWord ? isFavorite(String(selectedWord.id)) : false}
            onClose={handleCloseModal}
            onToggleFavorite={toggleFavorite}
            onToggleLearned={toggleLearned}
            currentIndex={selectedWord ? displayWords.findIndex(w => w.id === selectedWord.id) : null}
            totalWords={displayWords.length}
          />
        )}
      </Suspense>
    </div>
  );
}
'use client';

import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { Sparkles } from 'lucide-react';

// import { useUser } from '@/contexts/UserContext';
import Hero from './homepage-component/Hero';
import { useUser } from '../contexts/UserContext';

// const WordGrid = lazy(() => import('@/components/features/WordGrid').then(mod => ({ default: mod.WordGrid })));
// const WordModal = lazy(() => import('@/components/features/WordModal').then(mod => ({ default: mod.WordModal })));
// const VoiceHelpModal = lazy(() => import('@/components/features/VoiceController').then(mod => ({ default: mod.VoiceHelpModal })));
import { WordGrid } from './../components/features/WordGrid';
import { WordModal } from '../components/features/WordModal';
import { useTheme } from '../contexts/ThemeContext';

export default function HomePage() {
  const { isLearned, isFavorite, toggleLearned, toggleFavorite } = useUser();
  const [selectedWord, setSelectedWord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [displayWords, setDisplayWords] = useState([]);
  const [shouldLoadGrid, setShouldLoadGrid] = useState(false);
    const { theme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoadGrid(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleOpenModal = useCallback((word) => {
    setSelectedWord(word);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedWord(null);
  }, []);

  const onNext = (currentIndex) => {
    if (currentIndex < displayWords.length - 1) {
      setSelectedWord(displayWords[currentIndex + 1]);
    }
  };

  const onPrevious = (currentIndex) => {
    if (currentIndex > 0) {
      setSelectedWord(displayWords[currentIndex - 1]);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-gradient-to-br from-rose-50 via-red-50 to-orange-50' : 'bg-black'}`}>
 
         
       

      <Hero />

      <section className="max-w-7xl  mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
        
    </div>
  );
}
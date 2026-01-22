'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { BookOpen, Sparkles, Target, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { WordGrid } from '@/components/features/WordGrid';
import { WordModal } from '@/components/features/WordModal';
import { Word, SortType } from '@/types';
import { SAMPLE_WORDS } from '@/lib/data';
import { useUser } from '@/contexts/UserContext';
import { VoiceHelpModal } from '@/components/features/VoiceController';
import Hero from './homepage-component/Hero';

export default function HomePage() {
  const { isLearned, isFavorite, toggleLearned, toggleFavorite } = useUser();
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [words, setWords] = useState<Word[]>(SAMPLE_WORDS);
  const [activeSort, setActiveSort] = useState<SortType>('newest');

  // Handle voice commands
  useEffect(() => {
    const handleVoiceCommand = (event: CustomEvent) => {
      console.log('Voice command received:', event.detail);
      const { command, word, sortType, index } = event.detail;
      
      switch (command) {
        case 'open-word':
          if (word) {
            setSelectedWord(word);
            setIsModalOpen(true);
          }
          break;
          
        case 'sort':
          if (sortType) {
            handleSort(sortType);
          }
          break;
          
        case 'open-card':
          if (typeof index === 'number' && words[index]) {
            setSelectedWord(words[index]);
            setIsModalOpen(true);
          }
          break;
          
        case 'next-card':
          handleNextCard();
          break;
          
        case 'previous-card':
          handlePreviousCard();
          break;
          
        case 'next':
          handleNextCard();
          break;
          
        case 'previous':
          handlePreviousCard();
          break;
      }
    };

    // Listen for voice commands
    window.addEventListener('voice-command', handleVoiceCommand as EventListener);
    
    return () => {
      window.removeEventListener('voice-command', handleVoiceCommand as EventListener);
    };
  }, [words, selectedWord]);

  // Navigate to next card in modal
  const handleNextCard = useCallback(() => {
    if (!selectedWord) {
      // If no modal is open, open the first word
      if (words.length > 0) {
        setSelectedWord(words[0]);
        setIsModalOpen(true);
      }
      return;
    }
    
    const currentIndex = words.findIndex(w => w.id === selectedWord.id);
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % words.length;
    setSelectedWord(words[nextIndex]);
  }, [selectedWord, words]);

  // Navigate to previous card in modal
  const handlePreviousCard = useCallback(() => {
    if (!selectedWord) {
      // If no modal is open, open the last word
      if (words.length > 0) {
        setSelectedWord(words[words.length - 1]);
        setIsModalOpen(true);
      }
      return;
    }
    
    const currentIndex = words.findIndex(w => w.id === selectedWord.id);
    if (currentIndex === -1) return;
    
    const prevIndex = (currentIndex - 1 + words.length) % words.length;
    setSelectedWord(words[prevIndex]);
  }, [selectedWord, words]);

  // Sorting function
  const handleSort = useCallback((sortType: SortType) => {
    let sortedWords = [...SAMPLE_WORDS];
    
    switch (sortType) {
      case 'random':
        sortedWords = sortedWords.sort(() => Math.random() - 0.5);
        break;
      case 'az':
        sortedWords = sortedWords.sort((a, b) => a.term.localeCompare(b.term));
        break;
      case 'newest':
        // Assuming newer words have higher IDs
        sortedWords = sortedWords.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
      case 'difficulty':
        const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
        sortedWords = sortedWords.sort((a, b) => 
          difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
        );
        break;
    }
    
    setWords(sortedWords);
    setActiveSort(sortType);
    
    // If modal is open, update the selected word based on new sort order
    if (selectedWord && isModalOpen) {
      const newSelectedWord = sortedWords.find(w => w.id === selectedWord.id);
      if (newSelectedWord) {
        setSelectedWord(newSelectedWord);
      }
    }
  }, [selectedWord, isModalOpen]);

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

  // Handle asking AI about the current word
  const handleAskAI = useCallback((word: Word) => {
    setIsModalOpen(false);
    // The AI chat widget will pick up this context
  }, []);

  // Get word index for display
  const getWordIndex = useCallback(() => {
    if (!selectedWord) return null;
    return words.findIndex(w => w.id === selectedWord.id) + 1;
  }, [selectedWord, words]);

  // Stats for the hero section
  const stats = {
    totalWords: words.length,
    learnedCount: words.filter(w => isLearned(w.id)).length,
    streak: 7,
  };

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
          
          {/* Sort Controls */}
<div className="flex gap-2 overflow-x-auto w-[90vw] md:w-full justify-start md:justify-end example md:ml-auto">
  {[
    { key: 'random', label: 'Random' },
    { key: 'az', label: 'A-Z' },
    { key: 'newest', label: 'Newest' },
    { key: 'difficulty', label: 'Difficulty' },
  ].map(({ key, label }) => (
    <button
      key={key}
      onClick={() => handleSort(key as SortType)}
      className={`shrink-0 rounded-lg px-4 py-1 text-sm transition-colors ${
        activeSort === key
          ? 'bg-primary-600 text-white'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  ))}
</div>


        </div>

        <WordGrid words={words} onOpenModal={handleOpenModal} />
      </section>

      {/* Word Detail Modal */}
      <WordModal
        word={selectedWord}
        isOpen={isModalOpen}
        isLearned={selectedWord ? isLearned(selectedWord.id) : false}
        isFavorite={selectedWord ? isFavorite(selectedWord.id) : false}
        onClose={handleCloseModal}
        onToggleFavorite={toggleFavorite}
        onToggleLearned={toggleLearned}
        onAskAI={handleAskAI}
        // Add navigation props to WordModal
        onNext={handleNextCard}
        onPrevious={handlePreviousCard}
        currentIndex={getWordIndex()}
        totalWords={words.length}
      />
    </div>
  );
}
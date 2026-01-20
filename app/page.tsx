'use client';

import React, { useState, useCallback } from 'react';
import { BookOpen, Sparkles, Target, Trophy } from 'lucide-react';
import { WordGrid } from '@/components/features/WordGrid';
import { WordModal } from '@/components/features/WordModal';
import { Word } from '@/types';
import { SAMPLE_WORDS } from '@/lib/data';
import { useUser } from '@/contexts/UserContext';
import { VoiceHelpModal } from '@/components/features/VoiceController';
import Hero from './component/Hero';

export default function HomePage() {
  const { isLearned, isFavorite, toggleLearned, toggleFavorite } = useUser();
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

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
    // The AI chat widget will pick up this context
    // and display the chat with the word context
    setIsModalOpen(false);
  }, []);

  // Stats for the hero section
  const stats = {
    totalWords: SAMPLE_WORDS.length,
    learnedCount: SAMPLE_WORDS.filter(w => isLearned(w.id)).length,
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
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Explore Words
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Click on any card to view details, pronunciation, and examples
          </p>
        </div>

        <WordGrid words={SAMPLE_WORDS} onOpenModal={handleOpenModal} />
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
      />
    </div>
  );
}

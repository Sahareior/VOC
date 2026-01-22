'use client'
import { WordGrid } from '@/components/features/WordGrid';
import { WordModal } from '@/components/features/WordModal';
import { useUser } from '@/contexts/UserContext';
import { SAMPLE_WORDS } from '@/lib/data';
import { Word } from '@/types';
import React, { useCallback, useState } from 'react';

const IndividualGroup = () => {
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
    return (
        <div>
                  <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="mb-8">
                      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Brave Words
                      </h2>
                      <p className="text-slate-600 dark:text-slate-300">
                        Click on any card to view details, pronunciation, and examples
                      </p>
                    </div>
            
                    <WordGrid words={SAMPLE_WORDS} onOpenModal={handleOpenModal} />
                  </section>
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
};

export default IndividualGroup;
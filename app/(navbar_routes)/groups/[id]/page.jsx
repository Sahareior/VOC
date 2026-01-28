'use client'

import React, { useCallback, useState } from 'react';
import { WordGrid } from '../../../../components/features/WordGrid';
import { useUser } from '../../../../contexts/UserContext';
import { WordModal } from '../../../../components/features/WordModal';

const IndividualGroup = () => {
    const { isLearned, isFavorite, toggleLearned, toggleFavorite } = useUser();
  const [selectedWord, setSelectedWord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [displayWords, setDisplayWords] = useState([]);
  const [shouldLoadGrid, setShouldLoadGrid] = useState(false);


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
    <div className="max-w-7xl mx-auto py-16 px-4">
      <h1 className="text-2xl mb-24  md:text-3xl font-semibold text-center">
        Select your word by your favorite group!
      </h1>

     <div>

       <WordGrid
        onOpenModal={handleOpenModal} 
              onWordsUpdate={setDisplayWords}
       />
     </div>

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
};

export default IndividualGroup;

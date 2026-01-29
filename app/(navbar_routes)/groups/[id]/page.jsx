'use client'

import React, { useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { WordGrid } from '../../../../components/features/WordGrid';
import { useUser } from '../../../../contexts/UserContext';
import { WordModal } from '../../../../components/features/WordModal';
import { useGetWordsByGroupsQuery } from '../../../../redux/slices/apiSlice';

const IndividualGroup = ({params}) => {
    const { isLearned, isFavorite, toggleLearned, toggleFavorite } = useUser();
  const [selectedWord, setSelectedWord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [displayWords, setDisplayWords] = useState([]);
  const [shouldLoadGrid, setShouldLoadGrid] = useState(false);
    const searchParams = useSearchParams();
  
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');
  //  groups: groupSlug,
  //               subcategory: subcategorySlug

  const {data,isLoading} = useGetWordsByGroupsQuery({groups:category,subcategory })




    console.log(data,'hgyufgyt')

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

  console.log(displayWords,'this is asnd')

  
  if(isLoading){
    return(
     <div className ="flex h-screen justify-center items-center">
       <p>Loading.....</p>
      </div>
    )
  }
  
  return (
    <div className="max-w-7xl mx-auto py-16 px-4">
      <h1 className="text-2xl mb-24  md:text-3xl font-semibold text-center">
        Select your word by your favorite group!
      </h1>

     <div>

       <WordGrid
        onOpenModal={handleOpenModal} 
              onWordsUpdate={setDisplayWords}
              groupPageData={data}
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

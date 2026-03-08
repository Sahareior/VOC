"use client";

import React, { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "../../../../contexts/UserContext";
import { useGetWordsByGroupsQuery } from "../../../../redux/slices/apiSlice";
import { WordGrid } from "../../../../components/features/WordGrid";
import { WordModal } from "../../../../components/features/WordModal";

const IndividualGroup = ({ params }) => {
  const { isLearned, isFavorite, toggleLearned, toggleFavorite } = useUser();
  const [selectedWord, setSelectedWord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayWords, setDisplayWords] = useState([]);
  const searchParams = useSearchParams();

  const category = searchParams.get("category");
  const subcategory = searchParams.get("subcategory");

  const { data, isLoading } = useGetWordsByGroupsQuery({
    groups: category,
    subcategory,
  });

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

  if (isLoading) {
    return (
      <div className="flex h-screen justify-center items-center bg-gradient-to-br from-rose-50 via-red-50 to-orange-50">
        <div className="text-center space-y-4">
          <p className="text-xl font-medium text-slate-600 animate-pulse">
            Loading words...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-red-50 to-orange-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <header className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 capitalize">
            {subcategory || category || "Group Words"}
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Explore and learn words from the{" "}
            <span className="text-red-500 font-semibold">{category}</span>{" "}
            group.
          </p>
        </header>

        <WordGrid
          onOpenModal={handleOpenModal}
          onWordsUpdate={setDisplayWords}
          groupPageData={data}
        />

        <WordModal
          word={selectedWord}
          onNext={onNext}
          onPrevious={onPrevious}
          onSelectWord={(index) => setSelectedWord(displayWords[index])}
          isOpen={isModalOpen}
          allData={displayWords}
          isFavorite={
            selectedWord ? isFavorite(String(selectedWord.id)) : false
          }
          onClose={handleCloseModal}
          onToggleFavorite={toggleFavorite}
          onToggleLearned={toggleLearned}
          currentIndex={
            selectedWord
              ? displayWords.findIndex((w) => w.id === selectedWord.id)
              : null
          }
          totalWords={displayWords.length}
        />
      </div>
    </div>
  );
};

export default IndividualGroup;

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { SentenceModal } from './SentenceModal';

export const WordCard = ({ word }) => {
  const [isSentenceModalOpen, setIsSentenceModalOpen] = useState(false);
  const router = useRouter();

  const handleOpenSentences = (e) => {
    e.stopPropagation();
    setIsSentenceModalOpen(true);
  };

  const handleOpenDetail = () => {
    router.push(`/word/${word.id}`);
  };

  return (
    <>
      <div
        onClick={handleOpenDetail}
        className="w-full max-w-md bg-[#f3f3f3] border border-gray-300 rounded-md overflow-hidden cursor-pointer"
      >
        {/* Header */}
        <div className="relative px-4 pt-3 pb-2 text-center border-b border-gray-300">
          {/* Left badge */}
          <span className="absolute left-4 top-3 text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded">
            {word.type}
          </span>

          {/* Center progress */}
          <div className="text-sm">
            <span className="text-red-600 font-semibold">
              {word.order ?? 3}
            </span>{' '}
            <span className="text-gray-700">
              of {word.total ?? 3213}
            </span>
          </div>

          {/* Category */}
          <div className="text-red-600 font-semibold text-sm">
            {word.category?.name}
          </div>

          {/* Sentences text */}
          <span 
            onClick={handleOpenSentences}
            className="absolute right-4 top-3 text-xs text-red-600 hover:underline decoration-red-600"
          >
            sentences
          </span>
        </div>

        {/* Word + Definition */}
        <div className="px-4 py-4">
          <p className="text-base leading-relaxed">
            <span className="text-red-600 font-bold text-lg">
              {word.name}
            </span>{' '}
            - {word.definition}
          </p>
        </div>

        {/* Image */}
        <div className="px-4">
          <div className="border border-gray-300 bg-white p-1">
            <div className="relative w-full h-52">
              <Image
                src={word.image}
                alt={word.name}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Example sentence */}
        <div className="px-4 py-4 text-sm text-gray-800 leading-relaxed">
          {highlightWord(word.sentence, word.name)}
        </div>
      </div>

      <SentenceModal 
        word={word}
        isOpen={isSentenceModalOpen}
        onClose={() => setIsSentenceModalOpen(false)}
      />
    </>
  );
};

/* Highlight the vocab word inside the sentence */
function highlightWord(sentence, word) {
  if (!sentence || !word) return sentence;

  const parts = sentence.split(new RegExp(`(${word})`, 'gi'));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === word.toLowerCase() ? (
          <span key={i} className="text-red-600 font-semibold">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}
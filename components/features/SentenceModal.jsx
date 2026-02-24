'use client';

import React from 'react';
import { X } from 'lucide-react';

export const SentenceModal = ({ word, isOpen, onClose }) => {
  if (!isOpen || !word) return null;

  // Dummy sentences for now
  const dummySentences = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    text: `This is example sentence number ${i + 1} containing the word ${word.name} in a realistic context for better understanding.`
  }));

  const highlightWord = (sentence, targetWord) => {
    if (!sentence || !targetWord) return sentence;
    const parts = sentence.split(new RegExp(`(${targetWord})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === targetWord.toLowerCase() ? (
            <span key={i} className="text-red-600 font-bold">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Example Sentences for <span className="text-red-600">{word.name}</span>
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Scrollable List */}
        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
          {dummySentences.map((s) => (
            <div 
              key={s.id} 
              className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-800"
            >
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                {highlightWord(s.text, word.name)}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

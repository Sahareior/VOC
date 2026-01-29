'use client';

import React, { useCallback, memo, useState, useEffect } from 'react';
import { 
  Volume2, 
  Heart, 
  CheckCircle, 
  Share2, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Sparkles,
  Image as ImageIcon,
  X,
  Pause,
  RotateCcw,
  Badge
} from 'lucide-react';
// import { Modal } from '@/components/ui/Modal';
// import { Badge } from '@/components/ui/Badge';
// import { cn } from '@/lib/utils';
// import { useVoice } from '@/contexts/VoiceContext';
import Image from 'next/image';
import { Modal } from '../ui/Modal';
import { cn } from '../../lib/utils';
import { useVoice } from '../../contexts/VoiceContext';

export const WordModal = memo(function WordModal({
  word,
  isOpen,
  isFavorite,
  onClose,
  onToggleFavorite,
  onToggleLearned,
  onNext,
  onPrevious,
  currentIndex,
  totalWords,
}) {
  const { speak } = useVoice();
  const [isSpeakingAll, setIsSpeakingAll] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState(null);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

  const handlePronounceAll = useCallback(async () => {
    if (!word) return;
    setIsSpeakingAll(true);
    setIsPaused(false);
    window.speechSynthesis.cancel();
    const parts = [];
    if (word.name || word.term) {
      parts.push(word.name || word.term || '');
    }
    if (word.definition) {
      parts.push(word.definition);
    }
    if (word.sentence) {
      parts.push(`Example: ${word.sentence}`);
    }
    let currentPartIndex = 0;
    const speakNextPart = () => {
      if (currentPartIndex >= parts.length) {
        setIsSpeakingAll(false);
        setIsPaused(false);
        setCurrentUtterance(null);
        if (onNext && currentIndex !== null && currentIndex < (totalWords || 0) - 1) {
          setTimeout(() => {
            setShouldAutoPlay(true);
            onNext(currentIndex);
          }, 500);
        }
        return;
      }
      const utterance = new SpeechSynthesisUtterance(parts[currentPartIndex]);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onend = () => {
        currentPartIndex++;
        setTimeout(speakNextPart, 800);
      };
      utterance.onerror = () => {
        setIsSpeakingAll(false);
        setIsPaused(false);
        setCurrentUtterance(null);
      };
      setCurrentUtterance(utterance);
      window.speechSynthesis.speak(utterance);
    };
    speakNextPart();
  }, [word, speak, onNext, currentIndex, totalWords]);

  useEffect(() => {
    if (shouldAutoPlay && word) {
      const timer = setTimeout(() => {
        handlePronounceAll();
        setShouldAutoPlay(false);
      }, 300);
      return () => clearTimeout(timer);
    }
    return () => {
      window.speechSynthesis.cancel();
      setIsSpeakingAll(false);
      setIsPaused(false);
      setCurrentUtterance(null);
    };
  }, [word?.id, shouldAutoPlay, handlePronounceAll]);

  const handlePause = useCallback(() => {
    if (window.speechSynthesis.speaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    } else if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  const handleRepeat = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeakingAll(false);
    setIsPaused(false);
    setCurrentUtterance(null);
    
    setTimeout(() => {
      handlePronounceAll();
    }, 100);
  }, [handlePronounceAll]);

  const handlePronounceDefinition = useCallback(() => {
    if (word?.definition) {
      speak(word.definition);
    }
  }, [word, speak]);

  const handlePronounceExample = useCallback(() => {
    if (word?.sentence) {
      speak(word.sentence);
    }
  }, [word, speak]);

  const handleToggleFavorite = useCallback(() => {
    if (word?.id) {
      const wordId = typeof word.id === 'number' ? word.id.toString() : word.id;
      onToggleFavorite(wordId);
    }
  }, [word, onToggleFavorite]);

  const handleToggleLearned = useCallback(() => {
    if (word?.id) {
      const wordId = typeof word.id === 'number' ? word.id.toString() : word.id;
      onToggleLearned(wordId);
    }
  }, [word, onToggleLearned]);

  if (!word) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      closeOnOverlay
      closeOnEscape
      className="overflow-hidden"
    >
      <div 
        className="flex w-full flex-col h-[80vh] overflow-hidden"
      >
        <div className="flex items-center justify-between px-3 p-1 pb-0">
          <div className="flex items-center gap-4">
            {currentIndex !== null && totalWords && (
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Word {currentIndex + 1} of {totalWords}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFavorite}
              className={cn(
                'p-2 rounded-lg transition-colors',
                isFavorite
                  ? 'text-rose-500 bg-rose-50 dark:bg-rose-900/30'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={cn(
                'w-5 h-5 transition-transform',
                isFavorite && 'fill-current'
              )} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 md:p-6">
          <div className="md:max-w-2xl w-full mx-auto space-y-8">
            <div className="relative">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold pb-5 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    {word.name || word.term}
                  </h1>
                  
                  {word.phonetic && (
                    <div className="flex items-center gap-2 mt-1">
                      <Volume2 className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        /{word.phonetic}/
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePronounceAll}
                    className={cn(
                      'relative p-3 rounded-xl transition-all duration-200',
                      'bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30',
                      'text-primary-600 dark:text-primary-400 hover:scale-105 active:scale-95',
                      'shadow-sm hover:shadow-md',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900'
                    )}
                    aria-label="Pronounce word, definition, and example"
                    disabled={isSpeakingAll}
                  >
                    <Volume2 className={cn(
                      "md:w-6 md:h-6 w-4 h-4",
                      isSpeakingAll && "animate-pulse"
                    )} />
                    {isSpeakingAll && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full animate-ping" />
                    )}
                  </button>

                  {isSpeakingAll && (
                    <button
                      onClick={handlePause}
                      className={cn(
                        'p-3 rounded-xl transition-all duration-200',
                        'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30',
                        'text-amber-600 dark:text-amber-400 hover:scale-105 active:scale-95',
                        'shadow-sm hover:shadow-md',
                        'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
                        'animate-in slide-in-from-right-5 duration-300'
                      )}
                      aria-label={isPaused ? "Resume" : "Pause"}
                    >
                      <Pause className={cn(
                        "md:w-6 md:h-6 w-4 h-4",
                        isPaused && "fill-current"
                      )} />
                    </button>
                  )}

                  {isSpeakingAll && (
                    <button
                      onClick={handleRepeat}
                      className={cn(
                        'p-3 rounded-xl transition-all duration-200',
                        'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30',
                        'text-emerald-600 dark:text-emerald-400 hover:scale-105 active:scale-95',
                        'shadow-sm hover:shadow-md',
                        'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
                        'animate-in slide-in-from-right-5 duration-300 delay-75'
                      )}
                      aria-label="Repeat from beginning"
                    >
                      <RotateCcw className="md:w-6 md:h-6 w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {word.image && (
              <div className="relative group aspect-video overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                <Image
                  src={word.image}
                  alt={word.name || word.term || 'Word illustration'}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target;
                    target.style.display = 'none';
                    target.parentElement.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                        <div class="text-center">
                          <div class="w-12 h-12 mx-auto mb-2 text-slate-400">${ImageIcon}</div>
                          <p class="text-slate-500 dark:text-slate-400">Image not available</p>
                        </div>
                      </div>
                    `;
                  }}
                />
                
                <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {onPrevious && currentIndex !== null && currentIndex > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.speechSynthesis.cancel();
                        setIsSpeakingAll(false);
                        setIsPaused(false);
                        setCurrentUtterance(null);
                        setShouldAutoPlay(true);
                        onPrevious(currentIndex);
                      }}
                      className="p-3 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 hover:bg-white dark:hover:bg-slate-800"
                      aria-label="Previous word"
                    >
                      <ChevronLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                    </button>
                  )}
                  
                  {onNext && currentIndex !== null && currentIndex < (totalWords || 0) - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.speechSynthesis.cancel();
                        setIsSpeakingAll(false);
                        setIsPaused(false);
                        setCurrentUtterance(null);
                        setShouldAutoPlay(true);
                        onNext(currentIndex);
                      }}
                      className="p-3 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 hover:bg-white dark:hover:bg-slate-800 ml-auto"
                      aria-label="Next word"
                    >
                      <ChevronRight className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                    </button>
                  )}
                </div>

    
              </div>
            )}

       

            {word.definition && (
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-blue-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500" />
                <div className="relative p-2 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                        <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Definition
                      </h3>
                    </div>
                    <button
                      onClick={handlePronounceDefinition}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      aria-label="Pronounce definition"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                    {word.definition}
                  </p>
                </div>
              </div>
            )}

            {word.sentence && (
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500" />
                <div className="relative p-2 bg-gradient-to-br from-white to-emerald-50 dark:from-slate-800 dark:to-emerald-900/5 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                     
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Example Usage
                      </h3>
                    </div>
                    <button
                      onClick={handlePronounceExample}
                      className="p-2 md:px-6 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                      aria-label="Pronounce example"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="relative">
                  
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg  italic">
                      {word.sentence}
                    </p>
                   
                  </div>
                </div>
              </div>
            )}

            {(onPrevious || onNext) && !word.image && currentIndex !== null && (
              <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
                {onPrevious && currentIndex > 0 ? (
                  <button
                    onClick={() => {
                      window.speechSynthesis.cancel();
                      setIsSpeakingAll(false);
                      setIsPaused(false);
                      setCurrentUtterance(null);
                      setShouldAutoPlay(true);
                      onPrevious(currentIndex);
                    }}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span>Previous</span>
                  </button>
                ) : (
                  <div />
                )}
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {currentIndex !== null && totalWords ? `Word ${currentIndex + 1} of ${totalWords}` : 'Navigation'}
                </div>
                {onNext && currentIndex < (totalWords || 0) - 1 ? (
                  <button
                    onClick={() => {
                      window.speechSynthesis.cancel();
                      setIsSpeakingAll(false);
                      setIsPaused(false);
                      setCurrentUtterance(null);
                      setShouldAutoPlay(true);
                      onNext(currentIndex);
                    }}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <div />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
});
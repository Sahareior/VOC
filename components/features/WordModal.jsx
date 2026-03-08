'use client';

import React, { useCallback, memo, useState, useEffect, useRef } from 'react';
import {
  X,
  Pause,
  RotateCcw,
  Play,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Heart,
  MoveRight,
} from 'lucide-react';
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
  allData = [],
  onNext,
  onPrevious,
  onSelectWord,
  currentIndex,
  totalWords,
  locationPath,
}) {
  const { speak } = useVoice();
  const [isSpeakingAll, setIsSpeakingAll] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [progress, setProgress] = useState(0);

  const currentUtteranceRef = useRef(null);
  const speechTimeoutRef = useRef(null);
  const isMountedRef = useRef(false);
  const autoPlayInitiatedRef = useRef(false);
  const sidebarRef = useRef(null);

  const cleanupSpeech = useCallback(() => {
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
    window.speechSynthesis.cancel();
    if (currentUtteranceRef.current) {
      const utterance = currentUtteranceRef.current;
      utterance.onend = null;
      utterance.onerror = null;
      currentUtteranceRef.current = null;
    }
    if (isMountedRef.current) {
      setIsSpeakingAll(false);
      setIsPaused(false);
      setProgress(0);
    }
  }, []);

  const handlePronounceAll = useCallback(async () => {
    if (!word || !isMountedRef.current) return;
    cleanupSpeech();
    await new Promise((resolve) => setTimeout(resolve, 50));
    if (!isMountedRef.current) return;

    setIsSpeakingAll(true);
    setIsPaused(false);
    autoPlayInitiatedRef.current = true;

    const parts = [];
    if (word.name || word.term) parts.push(word.name || word.term);
    if (word.definition) parts.push(word.definition);
    if (word.sentence) {
      const sentence = Array.isArray(word.sentence) ? word.sentence[0] : word.sentence;
      parts.push(`Example: ${sentence}`);
    }

    let currentPartIndex = 0;
    const totalParts = parts.length;

    const speakNextPart = () => {
      if (!isMountedRef.current || currentPartIndex >= totalParts) {
        if (isMountedRef.current) {
          setIsSpeakingAll(false);
          setProgress(100);
          if (onNext && currentIndex !== null && currentIndex < (totalWords || 0) - 1) {
            speechTimeoutRef.current = setTimeout(() => {
              if (isMountedRef.current) {
                setShouldAutoPlay(true);
                onNext(currentIndex);
              }
            }, 1000);
          }
        }
        return;
      }

      const utterance = new SpeechSynthesisUtterance(parts[currentPartIndex]);
      utterance.rate = 0.9;
      utterance.onstart = () => setProgress(((currentPartIndex) / totalParts) * 100);
      utterance.onend = () => {
        if (isMountedRef.current) {
          currentPartIndex++;
          speechTimeoutRef.current = setTimeout(speakNextPart, 800);
        }
      };
      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    speakNextPart();
  }, [word, cleanupSpeech, onNext, currentIndex, totalWords]);

  const handlePause = useCallback(() => {
    if (window.speechSynthesis.speaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    } else if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  const handleClose = useCallback(() => {
    cleanupSpeech();
    onClose();
  }, [cleanupSpeech, onClose]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanupSpeech();
    };
  }, [cleanupSpeech]);

  useEffect(() => {
    if (isOpen) {
      setShouldAutoPlay(true);
    } else {
      cleanupSpeech();
      setShouldAutoPlay(false);
      autoPlayInitiatedRef.current = false;
    }
  }, [isOpen, cleanupSpeech]);

  useEffect(() => {
    if (shouldAutoPlay && word && isMountedRef.current) {
      handlePronounceAll();
      setShouldAutoPlay(false);
    }
  }, [word?.id, shouldAutoPlay, handlePronounceAll]);

  // Auto-scroll sidebar to active item
  useEffect(() => {
    if (sidebarRef.current && currentIndex !== null) {
      const activeEl = sidebarRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [currentIndex]);

  if (!word) return null;

  const displayWord = word.name || word.term;
  const exampleSentence = Array.isArray(word.sentence) ? word.sentence[0] : word.sentence;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      className="overflow-hidden"
    >
      <div className="flex flex-col  bg-white dark:bg-slate-900" style={{ height: '88vh', maxHeight: '700px' }}>

        {/* ── TOP BAR ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          {/* Audio controls */}
          <div className="flex items-center gap-2 mx-auto">
            <button
              onClick={onPrevious ? () => { setShouldAutoPlay(true); onPrevious(currentIndex); } : undefined}
              disabled={currentIndex === 0}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-9 h-9 text-slate-500" />
            </button>

            <button
              onClick={isSpeakingAll ? handlePause : handlePronounceAll}
              className="w-9 h-9 flex items-center justify-center bg-slate-800 dark:bg-white rounded-full text-white dark:text-slate-900 shadow hover:scale-105 transition-transform"
            >
              {isSpeakingAll && !isPaused
                ? <Pause className="w-4 h-4 fill-current" />
                : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={onNext ? () => { setShouldAutoPlay(true); onNext(currentIndex); } : undefined}
              disabled={currentIndex === (totalWords || 0) - 1}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-9 h-9 text-slate-500" />
            </button>

            <button
              onClick={() => { cleanupSpeech(); handlePronounceAll(); }}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400"
            >
              <RotateCcw className="w-7 h-7" />
            </button>

            <span className="text-xs text-slate-700 ml-1 tabular-nums">
              {(currentIndex ?? 0) + 1} / {totalWords || allData.length}
            </span>
          </div>


        </div>

        {/* ── BODY ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── LEFT SIDEBAR: Word List ── */}
          <div
            ref={sidebarRef}
            className="hidden md:flex pl-4 flex-col w-56 overflow-y-auto border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 word-list-scroll"
          >
            <ul className="py-3 mt-1 space-y-0.5">
              {allData.map((item, idx) => {
                const isActive = currentIndex === idx;
                return (
                  <li key={item.id ?? idx}>
                    <button
                      data-active={isActive}
                      onClick={() => { setShouldAutoPlay(true); onSelectWord && onSelectWord(idx); }}
                      className={cn(
                        'w-full flex items-center gap-1 py-1 px-1 rounded-md text-left transition-all',
                        isActive
                          ? 'bg-slate-50 dark:bg-slate-800'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      )}
                    >
                      {/* Arrow / number */}
                      <span className="w-8 flex items-center justify-center shrink-0">
                        {isActive ? (
                          <svg viewBox="0 0 20 14" className="w-4 h-3 text-purple-600 fill-current">
                            <path d="M0 2 L10 2 L10 0 L20 7 L10 14 L10 12 L0 12 Z" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 20 14" className="w-4 h-3 text-purple-300 dark:text-purple-700 fill-none stroke-current stroke-[1.5]">
                            <path d="M0 2 L10 2 L10 0 L20 7 L10 14 L10 12 L0 12 Z" />
                          </svg>
                        )}
                      </span>

                      {/* Number */}
                      <span className="text-[14px] mr-1 text-slate-400 w-4 text-right shrink-0 tabular-nums">
                        {idx + 1}.
                      </span>

                      {/* Word */}
                      <span
                        className={cn(
                          'font-bold text-[18px] lg:text-[20px] capitalize truncate',
                          isActive
                            ? 'text-[#E11D48]'
                            : 'text-[#C0143C]/70 dark:text-rose-400/70'
                        )}
                      >
                        {item.name || item.term}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ── RIGHT: Word Card ── */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 flex flex-col items-center justify-start bg-slate-50 dark:bg-slate-950 word-list-scroll">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-100 dark:border-slate-800">

              {/* Card top: badge + category */}
              <div className="px-6 pt-6 pb-0">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-[#0F172A] dark:bg-slate-700 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-widest">
                    {word.type || 'Noun'}
                  </span>
                  <span className="text-lg font-semibold text-[#E11D48] uppercase tracking-wide">
                    {word.category?.name || 'Bad'} / {word.subcategory?.name || 'Strange'}
                  </span>
                </div>

                {/* Word + definition */}
                <p className="text-slate-800 dark:text-slate-200 leading-snug mb-2">
                  <span className="font-extrabold text-[#E11D48] text-2xl mr-2">
                    {displayWord}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-base">
                    - {word.definition}
                  </span>
                </p>

                {/* Red divider */}
                <div className="h-px bg-[#E11D48]/20 my-4" />

                {/* Example sentence */}
                <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed mb-6">
                  {exampleSentence
                    ? highlightWord(exampleSentence, displayWord)
                    : 'No example available.'}
                </p>
              </div>

              {/* Image */}
              <div className="px-3 pb-3">
                <div className="relative w-full overflow-hidden rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  style={{ aspectRatio: '4/3' }}>
                  {word.image ? (
                    <Image
                      src={word.image}
                      alt={displayWord}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <ImageIcon className="w-10 h-10 text-slate-300" />
                      <p className="text-slate-400 text-xs">No image available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>

      <style jsx global>{`
        .word-list-scroll::-webkit-scrollbar { width: 4px; }
        .word-list-scroll::-webkit-scrollbar-track { background: transparent; }
        .word-list-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .dark .word-list-scroll::-webkit-scrollbar-thumb { background: #1e293b; }
      `}</style>
    </Modal>
  );
});

/* ── Helper: bold the target word in the example sentence ── */
function highlightWord(sentence, word) {
  if (!word) return sentence;
  const regex = new RegExp(`(${word})`, 'gi');
  const parts = sentence.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <strong key={i} className="font-bold text-slate-900 dark:text-slate-100">{part}</strong>
      : part
  );
}
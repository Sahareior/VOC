'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Pause,
  RotateCcw,
  Play,
  SkipForward,
  SkipBack
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '../../lib/utils';

export const WordDetailView = ({
  word,
  currentIndex,
  totalWords,
  onNext,
  onPrevious,
  onSpeechEnd,
}) => {
  const [isSpeakingAll, setIsSpeakingAll] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMaleVoice, setIsMaleVoice] = useState(true);

  const currentUtteranceRef = useRef(null);
  const speechTimeoutRef = useRef(null);
  const isMountedRef = useRef(false);


  const cleanupSpeech = useCallback(() => {
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
    window.speechSynthesis.cancel();
    if (currentUtteranceRef.current) {
      currentUtteranceRef.current = null;
    }
    if (isMountedRef.current) {
      setIsSpeakingAll(false);
      setIsPaused(false);
    }
  }, []);

  const handlePronounceAll = useCallback(async () => {
    if (!word || !isMountedRef.current) return;
    cleanupSpeech();
    await new Promise(resolve => setTimeout(resolve, 50));
    if (!isMountedRef.current) return;

    setIsSpeakingAll(true);
    setIsPaused(false);

    const parts = [
      `The word is, ${word.name || word.term}.`,
      `The definition is, ${word.definition}.`,
    ];

    if (word.sentence) {
      const firstSentence = Array.isArray(word.sentence) ? word.sentence[0] : word.sentence;
      parts.push(`An example is, ${firstSentence}`);
    }

    let currentPartIndex = 0;

    const getVoice = (isMale) => {
      const voices = window.speechSynthesis.getVoices();
      const targetGender = isMale ? 'male' : 'female';

      // 1. Try to find by explicit gender keyword, being careful about "female" containing "male"
      let preferred = voices.find(v => {
        const name = v.name.toLowerCase();
        if (isMale) {
          return name.includes('male') && !name.includes('female') && v.lang.startsWith('en');
        } else {
          return name.includes('female') && v.lang.startsWith('en');
        }
      });

      // 2. Try common Windows/Google names if not found
      if (!preferred) {
        const maleNames = ['david', 'mark', 'james', 'richard', 'george', 'stefan'];
        const femaleNames = ['zira', 'linda', 'susan', 'catherine', 'mary', 'hazel'];
        const targetNames = isMale ? maleNames : femaleNames;

        preferred = voices.find(v =>
          targetNames.some(name => v.name.toLowerCase().includes(name)) && v.lang.startsWith('en')
        );
      }

      return preferred || voices.find(v => v.lang.startsWith('en'));
    };

    const speakNextPart = () => {
      if (!isMountedRef.current || currentPartIndex >= parts.length) {
        if (isMountedRef.current) {
          setIsSpeakingAll(false);
          setIsPaused(false);
          if (typeof onSpeechEnd === 'function') {
            onSpeechEnd();
          }
        }
        return;
      }

      const utterance = new SpeechSynthesisUtterance(parts[currentPartIndex]);
      const selectedVoice = getVoice(isMaleVoice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.rate = 0.85; // Slightly slower for more "narrative" feel
      utterance.pitch = isMaleVoice ? 1.0 : 1.15;

      utterance.onend = () => {
        if (!isMountedRef.current) return;

        currentPartIndex++;
        // Slightly longer pause between narrative parts
        speechTimeoutRef.current = setTimeout(speakNextPart, 1000);
      };

      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };
    speakNextPart();
  }, [word, cleanupSpeech, isMaleVoice, onSpeechEnd]);

  const handlePause = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      if (!isPaused) {
        window.speechSynthesis.pause();
        setIsPaused(true);
      } else {
        window.speechSynthesis.resume();
        setIsPaused(false);
      }
    }
  }, [isPaused]);

  const handleRepeat = useCallback(() => {
    cleanupSpeech();
    setTimeout(() => {
      if (isMountedRef.current) handlePronounceAll();
    }, 100);
  }, [handlePronounceAll, cleanupSpeech]);


  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanupSpeech();
    };
  }, [cleanupSpeech]);

  // Auto-start speech whenever the word changes (new card loaded)
  useEffect(() => {
    if (!word?.id || !isMountedRef.current) return;

    let interactionHappened = false;

    const startSpeech = () => {
      if (isMountedRef.current) {
        handlePronounceAll();
      }
    };

    // Browsers block audio until a user gesture. We can "capture" the first gesture anywhere on the page.
    const unblockAndStart = () => {
      if (interactionHappened) return;
      interactionHappened = true;
      startSpeech();
      window.removeEventListener('click', unblockAndStart);
      window.removeEventListener('keydown', unblockAndStart);
    };

    // Check if voices are loaded (essential for first load)
    const checkAndStart = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Try to start immediately (works if navigations unblocked it previously)
        startSpeech();
      } else {
        // Wait for voiceschanged if they aren't ready
        const voiceChangeHandler = () => {
          window.speechSynthesis.onvoiceschanged = null;
          startSpeech();
        };
        window.speechSynthesis.onvoiceschanged = voiceChangeHandler;
        setTimeout(() => {
          if (window.speechSynthesis.onvoiceschanged === voiceChangeHandler) {
            window.speechSynthesis.onvoiceschanged = null;
            startSpeech();
          }
        }, 1500);
      }
    };

    // 1. Listen for first interaction to unblock browser audio policy
    window.addEventListener('click', unblockAndStart);
    window.addEventListener('keydown', unblockAndStart);

    // 2. Also try auto-starting after a delay (works if already unblocked by previous navigations)
    const timer = setTimeout(checkAndStart, 600);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', unblockAndStart);
      window.removeEventListener('keydown', unblockAndStart);
      window.speechSynthesis.onvoiceschanged = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word?.id]);

  if (!word) return null;




  const firstSentence = Array.isArray(word.sentence) ? word.sentence[0] : word.sentence;
  const highlightedSentence = firstSentence
    ? firstSentence.replace(
      new RegExp(`\\b${(word.name || word.term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'),
      (match) => `<span class="text-red-600 font-semibold">${match}</span>`
    )
    : '';

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      {/* Top header */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-2xl font-semibold">
          <span className="text-blue-600">{word?.category?.name}</span>
          <span className="text-red-600"> {totalWords}</span>
        </div>
        <button
          className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-8 py-2.5 rounded-3xl font-bold text-sm tracking-wide shadow-sm transition-all"
        >
          Random
        </button>
      </div>


      <div className="flex gap-8">
        {/* Main content card */}
        <div className="flex-1">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            {/* Top bar: NOUN + progress + Male toggle */}
            <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-5">
                <div className="bg-red-600 text-white text-xs font-bold tracking-widest px-4 py-1.5 rounded">
                  NOUN
                </div>
                <div className="text-slate-600 font-medium text-lg">
                  <span className="text-red-600 font-semibold">
                    {currentIndex !== undefined && totalWords ? currentIndex + 1 : 'N/A'}
                  </span>{' '}
                  of {totalWords || 'N/A'}
                </div>
              </div>

              {/* Male toggle */}
              <div
                onClick={() => setIsMaleVoice(!isMaleVoice)}
                className="flex items-center gap-3 bg-slate-50 px-5 py-2 rounded-3xl cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <span className="text-slate-700 font-semibold text-sm">
                  {isMaleVoice ? 'Male Voice' : 'Female Voice'}
                </span>
                <div className={cn(
                  "relative w-11 h-6 rounded-full transition-colors duration-200",
                  isMaleVoice ? "bg-blue-500" : "bg-pink-500"
                )}>
                  <div
                    className={cn(
                      "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200",
                      isMaleVoice ? "translate-x-5" : "translate-x-0.5"
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="px-8 pt-8 pb-4 text-center">
              <div className="inline-flex text-2xl font-medium">
                <span className="text-blue-600">{word?.category?.name || 'Category'}</span>
                {word?.subcategory?.name && (
                  <>
                    <span className="text-slate-300 mx-3">/</span>
                    <span className="text-red-600">{word.subcategory.name}</span>
                  </>
                )}
              </div>
            </div>

            {/* Definition */}
            <div className="px-8 pb-8">
              <p className="text-[27px] leading-tight font-semibold text-slate-900">
                <span className="text-red-600">
                  {word.name || word.term}
                </span>{' '}
                - {word.definition}
              </p>
            </div>

            {/* Image */}
            {word.image && (
              <div className="px-8 pb-8">
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                  <Image
                    src={word.image}
                    alt={word.name || word.term}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {/* Example sentence */}
            {word.sentence && (
              <div className="px-8 pb-10">
                <p
                  className="text-xl text-slate-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: highlightedSentence }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right control panel */}
        <div className="w-60 flex-shrink-0 pt-3">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 flex flex-col gap-4">
            <button
              onClick={handlePause}
              disabled={!isSpeakingAll}
              className={cn(
                "w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 transition-all active:scale-[0.985]",
                "bg-red-500 hover:bg-red-600 text-white shadow-sm"
              )}
            >
              <Pause className="w-6 h-6" />
              Pause
            </button>

            <button
              onClick={handleRepeat}
              className="w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 transition-all active:scale-[0.985] bg-yellow-400 hover:bg-yellow-500 text-slate-900 shadow-sm"
            >
              <RotateCcw className="w-6 h-6" />
              Repeat
            </button>

            <button
              onClick={onNext}
              className="w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 transition-all active:scale-[0.985] bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
            >
              <SkipForward className="w-6 h-6" />
              Skip
            </button>

            <button
              onClick={onPrevious}
              className="w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 transition-all active:scale-[0.985] bg-cyan-500 hover:bg-cyan-600 text-white shadow-sm"
            >
              <SkipBack className="w-6 h-6" />
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
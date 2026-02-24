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
}) => {
  const [isSpeakingAll, setIsSpeakingAll] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMaleVoice, setIsMaleVoice] = useState(true);
  const [audioProgress, setAudioProgress] = useState(0);

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
      setAudioProgress(0);
    }
  }, []);

  const handlePronounceAll = useCallback(async () => {
    if (!word || !isMountedRef.current) return;
    cleanupSpeech();
    await new Promise(resolve => setTimeout(resolve, 50));
    if (!isMountedRef.current) return;

    setIsSpeakingAll(true);
    setIsPaused(false);
    setAudioProgress(0);

    const parts = [];
    if (word.name || word.term) parts.push(word.name || word.term || '');
    if (word.definition) parts.push(word.definition);
    if (word.sentence) parts.push(`Example: ${word.sentence}`);

    let currentPartIndex = 0;
    
    const speakNextPart = () => {
      if (!isMountedRef.current || currentPartIndex >= parts.length) {
        if (isMountedRef.current) {
          setIsSpeakingAll(false);
          setIsPaused(false);
          setAudioProgress(100);
        }
        return;
      }

      const utterance = new SpeechSynthesisUtterance(parts[currentPartIndex]);
      utterance.rate = 0.9;
      utterance.pitch = isMaleVoice ? 1.0 : 1.2; // subtle difference
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
  }, [word, cleanupSpeech, isMaleVoice]);

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

  // Simulate audio progress (≈10 seconds total)
  useEffect(() => {
    let intervalId = null;

    if (isSpeakingAll && !isPaused) {
      intervalId = setInterval(() => {
        setAudioProgress((prev) => {
          const next = prev + 4.2; // ~24 ticks for ~10s
          return next >= 100 ? 100 : next;
        });
      }, 420);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isSpeakingAll, isPaused]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanupSpeech();
    };
  }, [cleanupSpeech]);

  if (!word) return null;

  const formatTime = (percent) => {
    const seconds = Math.floor((percent / 100) * 10);
    return `0:${seconds.toString().padStart(2, '0')}`;
  };

  const highlightedSentence = word.sentence
    ? word.sentence.replace(
        new RegExp(`\\b${(word.name || word.term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'),
        (match) => `<span class="text-red-600 font-semibold">${match}</span>`
      )
    : '';

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      {/* Top header */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-2xl font-semibold">
          <span className="text-blue-600">Other-</span>
          <span className="text-red-600"> {totalWords || 3213}</span>
        </div>
        <button
          className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-8 py-2.5 rounded-3xl font-bold text-sm tracking-wide shadow-sm transition-all"
        >
          Random
        </button>
      </div>

      {/* Audio player bar */}
      <div className="bg-white border border-slate-200 rounded-3xl flex items-center px-6 py-4 mb-8 shadow-sm">
        <button
          onClick={isSpeakingAll && !isPaused ? handlePause : handlePronounceAll}
          className="mr-5 text-slate-700 hover:text-slate-900 transition-colors"
        >
          {isSpeakingAll && !isPaused ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8" />
          )}
        </button>

        <div className="tabular-nums text-sm text-slate-500 w-12">
          {formatTime(audioProgress)}
        </div>

        <div className="flex-1 mx-6 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-1.5 bg-slate-900 rounded-full transition-all duration-300"
            style={{ width: `${audioProgress}%` }}
          />
        </div>

        <div className="tabular-nums text-sm text-slate-500 w-12 text-right">
          0:10
        </div>

        <Volume2 className="ml-6 w-5 h-5 text-slate-400" />
        <div className="ml-4 text-slate-400 text-xl leading-none">⋯</div>
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
                    {currentIndex !== undefined && totalWords ? currentIndex + 1 : 1139}
                  </span>{' '}
                  of {totalWords || 3213}
                </div>
              </div>

              {/* Male toggle */}
              <div 
                onClick={() => setIsMaleVoice(!isMaleVoice)}
                className="flex items-center gap-3 bg-emerald-50 px-5 py-2 rounded-3xl cursor-pointer hover:bg-emerald-100 transition-colors"
              >
                <span className="text-emerald-700 font-semibold text-sm">Male</span>
                <div className="relative w-11 h-6 bg-emerald-500 rounded-full">
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
                <span className="text-blue-600">Other</span>
                <span className="text-slate-300 mx-3">/</span>
                <span className="text-red-600">Desire</span>
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
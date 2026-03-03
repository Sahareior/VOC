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
  const [audioProgress, setAudioProgress] = useState(0);

  const currentUtteranceRef = useRef(null);
  const speechTimeoutRef = useRef(null);
  const isMountedRef = useRef(false);
  const rafRef = useRef(null);
  const speechStartTimeRef = useRef(null);     // performance.now() when FIRST utterance starts
  const totalSpeechDurationRef = useRef(0);    // total estimated ms for all parts
  const utteranceStartTimeRef = useRef(null);  // performance.now() when CURRENT utterance starts
  const accumulatedRealMsRef = useRef(0);      // real ms spent in already-finished utterances
  const [totalDurationSec, setTotalDurationSec] = useState(0);

  const stopRaf = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const cleanupSpeech = useCallback(() => {
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
    stopRaf();
    window.speechSynthesis.cancel();
    if (currentUtteranceRef.current) {
      currentUtteranceRef.current = null;
    }
    speechStartTimeRef.current = null;
    utteranceStartTimeRef.current = null;
    totalSpeechDurationRef.current = 0;
    accumulatedRealMsRef.current = 0;
    if (isMountedRef.current) {
      setIsSpeakingAll(false);
      setIsPaused(false);
      setAudioProgress(0);
      setTotalDurationSec(0);
    }
  }, [stopRaf]);

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
    if (word.sentence) {
      const firstSentence = Array.isArray(word.sentence) ? word.sentence[0] : word.sentence;
      parts.push(`Example: ${firstSentence}`);
    }

    // --- Estimate total duration upfront from character count ---
    // At rate=0.9, speech synthesis does roughly 8 chars/sec.
    const CHARS_PER_SEC = 8;
    const gapMs = (parts.length - 1) * 800; // 800ms pauses between parts
    const totalChars = parts.reduce((s, p) => s + p.length, 0);
    const estimatedTotalMs = (totalChars / CHARS_PER_SEC) * 1000 + gapMs;
    totalSpeechDurationRef.current = estimatedTotalMs;
    accumulatedRealMsRef.current = 0;
    setTotalDurationSec(Math.ceil(estimatedTotalMs / 1000));

    let currentPartIndex = 0;

    const speakNextPart = () => {
      if (!isMountedRef.current || currentPartIndex >= parts.length) {
        if (isMountedRef.current) {
          setIsSpeakingAll(false);
          setIsPaused(false);
          setAudioProgress(100);
          if (typeof onSpeechEnd === 'function') {
            onSpeechEnd();
          }
        }
        return;
      }

      const utterance = new SpeechSynthesisUtterance(parts[currentPartIndex]);
      utterance.rate = 0.9;
      utterance.pitch = isMaleVoice ? 1.0 : 1.2;

      utterance.onstart = () => {
        utteranceStartTimeRef.current = performance.now();
        if (currentPartIndex === 0) {
          speechStartTimeRef.current = performance.now();
        }
      };

      utterance.onend = () => {
        if (!isMountedRef.current) return;

        // Measure real duration of this utterance
        const realUtterMs = utteranceStartTimeRef.current
          ? performance.now() - utteranceStartTimeRef.current
          : 0;
        accumulatedRealMsRef.current += realUtterMs;

        // Re-estimate total using actual rate from completed chars
        const completedChars = parts
          .slice(0, currentPartIndex + 1)
          .reduce((s, p) => s + p.length, 0);
        const remainingChars = parts
          .slice(currentPartIndex + 1)
          .reduce((s, p) => s + p.length, 0);

        if (completedChars > 0) {
          const realMsPerChar = accumulatedRealMsRef.current / completedChars;
          const remainingMs = remainingChars * realMsPerChar;
          const remainingGaps = (parts.length - 1 - currentPartIndex) * 800;
          const refined = accumulatedRealMsRef.current + remainingMs + remainingGaps;
          totalSpeechDurationRef.current = refined;
          setTotalDurationSec(Math.ceil(refined / 1000));
        }

        currentPartIndex++;
        accumulatedRealMsRef.current += 800; // count the pause gap too
        speechTimeoutRef.current = setTimeout(speakNextPart, 800);
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

  // Real-time progress via requestAnimationFrame
  useEffect(() => {
    if (!isSpeakingAll || isPaused) {
      stopRaf();
      return;
    }

    const tick = () => {
      if (!isMountedRef.current || !speechStartTimeRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const elapsed = performance.now() - speechStartTimeRef.current;
      const total = totalSpeechDurationRef.current || 1; // avoid /0
      const pct = Math.min((elapsed / total) * 100, 99); // cap at 99 until onend fires
      setAudioProgress(pct);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [isSpeakingAll, isPaused, stopRaf]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanupSpeech();
    };
  }, [cleanupSpeech]);

  // Auto-start speech whenever the word changes (new card loaded)
  useEffect(() => {
    if (!word) return;
    // Small delay so the browser voice list is ready
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        handlePronounceAll();
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word?.id]);

  if (!word) return null;

  const formatTime = (pct, totalSec) => {
    const elapsed = Math.floor((pct / 100) * totalSec);
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

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
          {formatTime(audioProgress, totalDurationSec)}
        </div>

        <div className="flex-1 mx-6 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-1.5 bg-slate-900 rounded-full transition-all duration-300"
            style={{ width: `${audioProgress}%` }}
          />
        </div>

        <div className="tabular-nums text-sm text-slate-500 w-12 text-right">
          {formatTotalTime(totalDurationSec)}
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
"use client";

import React, { useCallback, useState, useEffect, useRef } from "react";
import { Pause, Play, RotateCcw, SkipForward, SkipBack } from "lucide-react";
import Image from "next/image";
import { cn } from "../../lib/utils";

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
  const autoStartTimerRef = useRef(null);
  const isMountedRef = useRef(false);
  const isStartingRef = useRef(false); // Lock to prevent re-entrant starts

  // ─── Core cancel (no side-effects, just stops everything) ─────────────────
  const cancelAll = useCallback(() => {
    isStartingRef.current = false;

    if (autoStartTimerRef.current) {
      clearTimeout(autoStartTimerRef.current);
      autoStartTimerRef.current = null;
    }
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }

    window.speechSynthesis.cancel();
    currentUtteranceRef.current = null;

    if (isMountedRef.current) {
      setIsSpeakingAll(false);
      setIsPaused(false);
    }
  }, []);

  // ─── Internal speak engine ────────────────────────────────────────────────
  const startSpeaking = useCallback(
    (useMale, wordData) => {
      if (!wordData || !isMountedRef.current) return;
      if (isStartingRef.current) return; // Already starting — bail
      isStartingRef.current = true;

      window.speechSynthesis.cancel();
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = null;
      }

      setIsSpeakingAll(true);
      setIsPaused(false);

      const parts = [
        `The word is, ${wordData.name || wordData.term}.`,
        `The definition is, ${wordData.definition}.`,
      ];
      if (wordData.sentence) {
        const firstSentence = Array.isArray(wordData.sentence)
          ? wordData.sentence[0]
          : wordData.sentence;
        parts.push(`An example is, ${firstSentence}`);
      }

      let partIndex = 0;

      const getVoice = (male) => {
        const voices = window.speechSynthesis.getVoices();
        const enVoices = voices.filter((v) => v.lang.startsWith("en"));

        const femaleNames = [
          "zira", "linda", "susan", "catherine", "mary", "hazel", "moira",
          "tessa", "veena", "karen", "samantha", "victoria", "fiona",
          "allison", "ava", "emily", "joanna", "salli", "kendra", "kimberly",
          "ivy", "amy", "emma", "olivia", "female", "woman",
        ];
        const maleNames = [
          "david", "mark", "james", "richard", "george", "stefan", "daniel",
          "fred", "arthur", "oliver", "thomas", "male", "man", "matthew",
          "joey", "justin", "russell", "lee",
        ];

        const targetNames = male ? maleNames : femaleNames;
        const oppositeNames = male ? femaleNames : maleNames;

        const match = enVoices.find((v) => {
          const n = v.name.toLowerCase();
          return (
            targetNames.some((t) => n.includes(t)) &&
            !oppositeNames.some((o) => n.includes(o))
          );
        });
        if (match) return match;

        const fallback = enVoices.find((v) => {
          const n = v.name.toLowerCase();
          return !oppositeNames.some((o) => n.includes(o));
        });
        return fallback || enVoices[0] || voices[0];
      };

      const speakPart = () => {
        isStartingRef.current = false; // Release lock once first utterance fires

        if (!isMountedRef.current || partIndex >= parts.length) {
          if (isMountedRef.current) {
            setIsSpeakingAll(false);
            setIsPaused(false);
            if (typeof onSpeechEnd === "function") onSpeechEnd();
          }
          return;
        }

        const utterance = new SpeechSynthesisUtterance(parts[partIndex]);
        const voice = getVoice(useMale);
        if (voice) utterance.voice = voice;
        utterance.rate = 0.85;
        utterance.pitch = useMale ? 1.0 : 1.15;

        utterance.onend = () => {
          if (!isMountedRef.current) return;
          partIndex++;
          speechTimeoutRef.current = setTimeout(speakPart, 800);
        };

        utterance.onerror = (e) => {
          // "interrupted" / "canceled" fires when we cancel on purpose — ignore
          if (e.error === "interrupted" || e.error === "canceled") return;
          if (isMountedRef.current) {
            setIsSpeakingAll(false);
            setIsPaused(false);
          }
        };

        currentUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      };

      // Single tick after cancel() before we speak
      speechTimeoutRef.current = setTimeout(speakPart, 120);
    },
    [onSpeechEnd]
  );

  // ─── Public handlers ──────────────────────────────────────────────────────
  const handlePronounceAll = useCallback(
    (forceMale) => {
      const useMale = forceMale !== undefined ? forceMale : isMaleVoice;
      cancelAll();
      autoStartTimerRef.current = setTimeout(() => {
        startSpeaking(useMale, word);
      }, 150);
    },
    [isMaleVoice, word, cancelAll, startSpeaking]
  );

  const handlePause = useCallback(() => {
    if (!isSpeakingAll) return;
    const synth = window.speechSynthesis;
    if (!isPaused) {
      synth.pause();
      setIsPaused(true);
    } else {
      synth.resume();
      setIsPaused(false);
    }
  }, [isPaused, isSpeakingAll]);

  const handleRepeat = useCallback(() => {
    handlePronounceAll();
  }, [handlePronounceAll]);

  const handleVoiceToggle = useCallback(() => {
    const newIsMale = !isMaleVoice;
    setIsMaleVoice(newIsMale);
    handlePronounceAll(newIsMale);
  }, [isMaleVoice, handlePronounceAll]);

  // ─── Mount / unmount ──────────────────────────────────────────────────────
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cancelAll();
    };
  }, [cancelAll]);

  // ─── Auto-start when word changes ─────────────────────────────────────────
  useEffect(() => {
    if (!word?.id) return;

    cancelAll();

    let unblocked = false;

    const tryStart = () => {
      if (!isMountedRef.current) return;
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        startSpeaking(isMaleVoice, word);
      } else {
        const handler = () => {
          window.speechSynthesis.onvoiceschanged = null;
          if (isMountedRef.current) startSpeaking(isMaleVoice, word);
        };
        window.speechSynthesis.onvoiceschanged = handler;
        setTimeout(() => {
          if (window.speechSynthesis.onvoiceschanged === handler) {
            window.speechSynthesis.onvoiceschanged = null;
            if (isMountedRef.current) startSpeaking(isMaleVoice, word);
          }
        }, 1500);
      }
    };

    const unblockAndStart = () => {
      if (unblocked) return;
      unblocked = true;
      window.removeEventListener("click", unblockAndStart);
      window.removeEventListener("keydown", unblockAndStart);
      tryStart();
    };

    window.addEventListener("click", unblockAndStart);
    window.addEventListener("keydown", unblockAndStart);

    autoStartTimerRef.current = setTimeout(tryStart, 600);

    return () => {
      cancelAll();
      window.removeEventListener("click", unblockAndStart);
      window.removeEventListener("keydown", unblockAndStart);
      window.speechSynthesis.onvoiceschanged = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word?.id]);

  // ─── Render ───────────────────────────────────────────────────────────────
  if (!word) return null;

  const firstSentence = Array.isArray(word.sentence)
    ? word.sentence[0]
    : word.sentence;

  const highlightedSentence = firstSentence
    ? firstSentence.replace(
        new RegExp(
          `\\b${(word.name || word.term).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
          "gi"
        ),
        (match) => `<span class="text-red-600 font-semibold">${match}</span>`
      )
    : "";

  return (
    <div className="w-full max-w-4xl mx-auto p-1 md:p-2">
      {/* Top header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="text-xl mx-2 md:text-2xl font-semibold">
          <span className="text-blue-600">{word?.category?.name}</span>
          <span className="text-red-600"> ({totalWords}) words</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Main content card */}
        <div className="flex-1 w-full">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl border border-slate-100 overflow-hidden">
            {/* Top bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 md:px-8 py-4 md:py-6 border-b border-slate-100 gap-4">
              <div className="flex items-center gap-4 md:gap-5">
                <div className="bg-red-600 text-white text-[10px] md:text-xs font-bold tracking-widest px-3 md:px-4 py-1 md:py-1.5 rounded">
                  {word?.type}
                </div>
                <div className="text-slate-600 font-medium text-base md:text-lg">
                  <span className="text-red-600 font-semibold">
                    {currentIndex !== undefined && totalWords
                      ? currentIndex + 1
                      : "N/A"}
                  </span>{" "}
                  of {totalWords || "N/A"}
                </div>
              </div>

              {/* Voice gender toggle */}
              <div
                onClick={handleVoiceToggle}
                className="flex items-center gap-2 md:gap-3 bg-slate-50 px-4 md:px-5 py-2 rounded-3xl cursor-pointer hover:bg-slate-100 transition-colors self-end sm:self-auto"
              >
                <span className="text-slate-700 font-semibold text-xs md:text-sm whitespace-nowrap">
                  {isMaleVoice ? "Male Voice" : "Female Voice"}
                </span>
                <div
                  className={cn(
                    "relative w-9 md:w-11 h-5 md:h-6 rounded-full transition-colors duration-200",
                    isMaleVoice ? "bg-blue-500" : "bg-pink-500"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 w-4 md:w-5 h-4 md:h-5 bg-white rounded-full shadow transition-all duration-200",
                      isMaleVoice
                        ? "translate-x-4 md:translate-x-5"
                        : "translate-x-0.5"
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="px-6 md:px-8 pt-6 md:pt-8 pb-3 md:pb-4 text-center">
              <div className="inline-flex text-xl md:text-2xl font-medium">
                <span className="text-blue-600">
                  {word?.category?.name || "Category"}
                </span>
                {word?.subcategory?.name && (
                  <>
                    <span className="text-slate-300 mx-2 md:mx-3">/</span>
                    <span className="text-red-600">{word.subcategory.name}</span>
                  </>
                )}
              </div>
            </div>

            {/* Definition */}
            <div className="px-6 md:px-8 pb-6 md:pb-8">
              <p className="text-xl md:text-[27px] leading-tight font-semibold text-slate-900">
                <span className="text-red-600">{word.name || word.term}</span>{" "}
                - {word.definition}
              </p>
            </div>

            {/* Image */}
            {word.image && (
              <div className="px-6 md:px-8 pb-6 md:pb-8">
                <div className="relative aspect-[4/3] sm:aspect-[16/9] rounded-xl md:rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                  <Image
                    src={word.image}
                    alt={word.name || word.term}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 896px"
                  />
                </div>
              </div>
            )}

            {/* Example sentence */}
            {word.sentence && (
              <div className="px-6 md:px-8 pb-8 md:pb-10">
                <p
                  className="text-lg md:text-xl text-slate-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: highlightedSentence }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Control panel */}
        <div className="w-full md:w-60 md:flex-shrink-0">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl border border-slate-100 p-4 md:p-5 grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-4">
            <button
              onClick={handlePause}
              disabled={!isSpeakingAll}
              className={cn(
                "w-full py-3 rounded-xl md:rounded-2xl font-semibold flex items-center justify-center gap-2 md:gap-3 transition-all active:scale-[0.985]",
                "bg-red-500 hover:bg-red-600 text-white shadow-sm text-sm md:text-base",
                !isSpeakingAll && "opacity-50 cursor-not-allowed"
              )}
            >
              {isPaused ? (
                <>
                  <Play className="w-5 h-5 md:w-6 md:h-6" />
                  Play
                </>
              ) : (
                <>
                  <Pause className="w-5 h-5 md:w-6 md:h-6" />
                  Pause
                </>
              )}
            </button>

            <button
              onClick={handleRepeat}
              className="w-full py-3 rounded-xl md:rounded-2xl font-semibold flex items-center justify-center gap-2 md:gap-3 transition-all active:scale-[0.985] bg-yellow-400 hover:bg-yellow-500 text-slate-900 shadow-sm text-sm md:text-base"
            >
              <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
              Repeat
            </button>

            <button
              onClick={onNext}
              className="w-full py-3 rounded-xl md:rounded-2xl font-semibold flex items-center justify-center gap-2 md:gap-3 transition-all active:scale-[0.985] bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm text-sm md:text-base"
            >
              <SkipForward className="w-5 h-5 md:w-6 md:h-6" />
              Skip
            </button>

            <button
              onClick={onPrevious}
              className="w-full py-3 rounded-xl md:rounded-2xl font-semibold flex items-center justify-center gap-2 md:gap-3 transition-all active:scale-[0.985] bg-cyan-500 hover:bg-cyan-600 text-white shadow-sm text-sm md:text-base"
            >
              <SkipBack className="w-5 h-5 md:w-6 md:h-6" />
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
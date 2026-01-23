'use client'

import { useVoice } from '@/contexts/VoiceContext';
import { Mic, MicOff, Volume2, VolumeX, AlertCircle, CheckCircle } from 'lucide-react';
import React, { useCallback, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const VoiceCommand = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRippling, setIsRippling] = useState(false);
  const [showFeedback, setShowFeedback] = useState(true);
  const {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    speak,
    isVoiceEnabled,
    toggleVoiceEnabled,
    lastCommandDescription,
  } = useVoice();

  // Auto-hide feedback messages after a delay
  useEffect(() => {
    if (transcript || error || lastCommandDescription) {
      setShowFeedback(true);
      const timer = setTimeout(() => setShowFeedback(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [transcript, error, lastCommandDescription]);

  // Handle ripple effect when listening starts/stops
  useEffect(() => {
    if (isListening) {
      setIsRippling(true);
    } else {
      // Delay stopping ripple for smooth transition
      const timer = setTimeout(() => setIsRippling(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isListening]);

  const handleToggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  if (!isSupported) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <button
          className="p-4 rounded-full shadow-lg bg-gray-400 text-white cursor-not-allowed"
          aria-label="Voice commands not supported"
          disabled
        >
          <MicOff className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-4">
      {/* Voice enabled toggle button */}


      {/* Main mic button with ripple effect */}
      <div className="relative">
        {/* Ripple effect layers */}
        {isRippling && (
          <>
            <div className="absolute inset-0 animate-ripple-1 rounded-full bg-primary-400/30" />
            <div className="absolute inset-0 animate-ripple-2 rounded-full bg-primary-400/20" />
            <div className="absolute inset-0 animate-ripple-3 rounded-full bg-primary-400/10" />
          </>
        )}

        {/* Mic button */}
        <button
          onClick={handleToggleListening}
          disabled={!isVoiceEnabled}
          className={cn(
            'relative p-4 rounded-full shadow-lg transition-all duration-300',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            'transform hover:scale-105 active:scale-95',
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : isVoiceEnabled
              ? 'bg-primary-600 hover:bg-primary-700 text-white'
              : 'bg-gray-400 text-white cursor-not-allowed'
          )}
          aria-label={isListening ? 'Stop listening' : 'Start voice command'}
        >
          {isListening ? (
            <div className="relative w-6 h-6">
              {/* Pulsing dot when active */}
              <div className="absolute inset-0 rounded-full bg-white/90 animate-ping" />
              <Mic className="w-6 h-6 relative" />
            </div>
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Transcript/Command display */}
      {showFeedback && (transcript || lastCommandDescription || error) && (
        <div className="max-w-xs space-y-3">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg shadow-lg border border-red-200 dark:border-red-800 animate-in fade-in slide-in-from-top">
              <p className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span><span className="font-semibold">Error:</span> {error}</span>
              </p>
            </div>
          )}
          
          {transcript && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg shadow-lg border border-blue-200 dark:border-blue-800 animate-in fade-in slide-in-from-top">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                <span className="font-semibold">You said:</span> "{transcript}"
              </p>
            </div>
          )}

          {lastCommandDescription && (
            <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg shadow-lg border border-green-200 dark:border-green-800 animate-in fade-in slide-in-from-top">
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span><span className="font-semibold">Executed:</span> {lastCommandDescription}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Listening hint */}
      {isListening && (
        <div className="max-w-xs p-3 bg-blue-500 text-white rounded-lg shadow-lg text-sm text-center font-medium animate-pulse">
          Listening... Speak now
        </div>
      )}
    </div>
  );
};

export default VoiceCommand;
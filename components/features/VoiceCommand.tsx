'use client'

import { useVoice } from '@/contexts/VoiceContext';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import React, { useCallback, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const VoiceCommand = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRippling, setIsRippling] = useState(false);
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
      {(transcript || lastCommandDescription) && (
        <div className="max-w-xs p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          {transcript && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              <span className="font-semibold">You said:</span> {transcript}
            </p>
          )}
          {lastCommandDescription && (
            <p className="text-sm text-green-600 dark:text-green-400">
              <span className="font-semibold">Executed:</span>{' '}
              {lastCommandDescription}
            </p>
          )}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="max-w-xs p-4 bg-red-50 dark:bg-red-900/30 rounded-lg shadow-lg">
          <p className="text-sm text-red-600 dark:text-red-400">
            <span className="font-semibold">Error:</span> {error}
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceCommand;
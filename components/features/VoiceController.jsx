'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoice } from '@/contexts/VoiceContext';
import { useTheme } from '@/contexts/ThemeContext';

export function VoiceController() {
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
  
  const { theme, toggleTheme } = useTheme();
  const [showFeedback, setShowFeedback] = useState(false);

  // Handle voice commands globally
  useEffect(() => {
    const handleVoiceCommand = (event: CustomEvent) => {
      const { command } = event.detail;
      
      switch (command) {
        case 'toggle-theme':
          toggleTheme();
          break;
      }
    };

    window.addEventListener('voice-command', handleVoiceCommand as EventListener);
    return () => window.removeEventListener('voice-command', handleVoiceCommand as EventListener);
  }, [toggleTheme]);

  // Show feedback when command is recognized
  useEffect(() => {
    if (lastCommandDescription) {
      setShowFeedback(true);
      const timer = setTimeout(() => setShowFeedback(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastCommandDescription]);

  // Handle microphone toggle
  const handleToggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Don't render if not supported
  if (!isSupported) return null;

  return (
    <div className="relative">
      {/* Voice feedback tooltip */}
      {/* {showFeedback && lastCommandDescription && (
        <div className="absolute bottom-full mb-2 right-0 px-3 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm rounded-lg shadow-lg whitespace-nowrap animate-slide-down">
          <span className="text-emerald-400 dark:text-emerald-600">✓ </span>
          {lastCommandDescription}
        </div>
      )} */}

      {/* Main voice control button */}
      <button
        onClick={handleToggleListening}
        className={cn(
          'relative p-2 rounded-lg transition-all duration-200',
          isListening
            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
          !isVoiceEnabled && 'opacity-50 cursor-not-allowed'
        )}
        disabled={!isVoiceEnabled}
        aria-label={isListening ? 'Stop listening' : 'Start voice commands'}
        title={isListening ? 'Click to stop voice commands' : 'Click to start voice commands'}
      >
        {isListening ? (
          <>
            <Mic className="w-5 h-5" />
            {/* Pulsing indicator */}
            <span className="absolute inset-0 rounded-lg bg-red-500 animate-ping opacity-25" />
          </>
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {/* Voice status indicator */}
      {isListening && (
        <div className="absolute top-full mt-2 right-0 w-64 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 animate-scale-in">
          {/* Waveform visualization */}
          <div className="flex items-center justify-center gap-1 h-8 mb-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary-500 rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.5s',
                }}
              />
            ))}
          </div>
          
          {/* Transcript */}
          {transcript && (
            <p className="text-sm text-center text-slate-600 dark:text-slate-300 font-medium">
              &ldquo;{transcript}&rdquo;
            </p>
          )}
          
          {/* Error message */}
          {error && (
            <p className="text-xs text-center text-red-500 mt-2">
              Error: {error === 'not-allowed' ? 'Microphone access denied' : error}
            </p>
          )}
          
          {/* Instructions */}
          <p className="text-xs text-center text-slate-400 mt-2">
            Try: &ldquo;Open dashboard&ldquo; or &ldquo;Explain this word&ldquo;
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Voice command help component
 */
export function VoiceHelpModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const commands = [
    { command: 'Go home', description: 'Navigate to home page' },
    { command: 'Go to dashboard', description: 'Open your profile dashboard' },
    { command: 'Next card / Previous card', description: 'Navigate between word cards' },
    { command: 'Explain this word', description: 'Get word definition and examples' },
    { command: 'Read this word', description: 'Hear the pronunciation' },
    { command: 'Save this word', description: 'Mark word as learned' },
    { command: 'Scroll down / Scroll up', description: 'Navigate the page' },
    { command: 'Close', description: 'Close current modal' },
    { command: 'Toggle theme', description: 'Switch between light and dark mode' },
  ];

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity',
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          'w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-modal overflow-hidden animate-scale-in',
          isOpen ? 'scale-100' : 'scale-95'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Voice Commands
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Navigate and interact using your voice
          </p>
        </div>
        
        <div className="p-6 max-h-96 overflow-y-auto">
          <ul className="space-y-3">
            {commands.map((item, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <code className="text-sm font-mono text-primary-600 dark:text-primary-400">
                  &ldquo;{item.command}&rdquo;
                </code>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {item.description}
                </span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <p className="text-xs text-center text-slate-500 dark:text-slate-400">
            Note: Voice commands work best in Chrome and Edge browsers
          </p>
        </div>
      </div>
    </div>
  );
}

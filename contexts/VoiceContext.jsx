'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
// import { isSpeechRecognitionSupported, storage } from '@/lib/utils';
import { useRouter } from 'next/navigation';
// import { SAMPLE_WORDS } from '@/lib/data';
import { isSpeechRecognitionSupported,storage } from '../lib/utils';
import { SAMPLE_WORDS } from './../lib/data';

const STORAGE_KEY = 'vocabflow-voice-enabled';

const INITIAL_STATE = {
  isListening: false,
  isSupported: false,
  transcript: '',
  error: null,
  lastCommand: null,
};

const wordNames = SAMPLE_WORDS.map(w => w.term.toLowerCase());
const wordPattern = new RegExp(`^(open|show)\\s+(${wordNames.join('|')})$`, 'i');

const VOICE_COMMANDS = [
  {
    patterns: [/^(go\s+)?(to\s+)?home$/, /^go\s+to\s+home$/, /^home$/i],
    action: '/',
    description: 'Navigate to home page',
  },
  {
    patterns: [/^(go\s+)?(to\s+)?(my\s+)?(dashboard|profile)$/, /^open\s+(my\s+)?(dashboard|profile)$/, /^dashboard$/, /^profile$/i],
    action: '/dashboard',
    description: 'Navigate to dashboard',
  },
  {
    patterns: [/^(go\s+)?(to\s+)?(my\s+)?(group|groups)$/, /^open\s+(my\s+)?(groups|groups)$/, /^groups$/, /^groups$/i],
    action: '/groups',
    description: 'Navigate to Groups',
  },
  {
    patterns: [/^(go\s+)?next/, /^next\s+card?/, /^next$/i],
    action: 'next-card',
    description: 'Go to next card',
  },
  {
    patterns: [/^(go\s+)?previous/, /^previous\s+card?/, /^back$/, /^prev$/i],
    action: 'previous-card',
    description: 'Go to previous card',
  },
  {
    patterns: [/^(open|card)\s+(\d+)/, /^number\s+(\d+)/i],
    action: 'open-card',
    description: 'Open a specific card by number',
  },
  {
    patterns: [/^(explain|define|meaning|what).*word/, /^what.*this.*word/, /^define.*word/i],
    action: 'explain-word',
    description: 'Explain the current word',
  },
  {
    patterns: [/^(save|add|mark).*word/, /^learn\s+this/, /^mark\s+learned/i],
    action: 'save-word',
    description: 'Save/mark current word as learned',
  },
  {
    patterns: [/^(read|pronounce|say).*word/, /^speak\s+word/, /^say\s+it/i],
    action: 'read-word',
    description: 'Read the current word aloud',
  },
  {
    patterns: [/^search.*/, /^find\s+/, /^look\s+for/i],
    action: 'search',
    description: 'Search for a word',
  },
  {
    patterns: [/^(scroll\s+)?down$/, /^down$/i],
    action: 'scroll-down',
    description: 'Scroll down the page',
  },
  {
    patterns: [/^(scroll\s+)?up$/, /^up$/i],
    action: 'scroll-up',
    description: 'Scroll up the page',
  },
  {
    patterns: [/^close/, /^exit/, /^done$/i],
    action: 'close',
    description: 'Close current modal or dialog',
  },
  {
    patterns: [/^(toggle|switch).*theme/, /^(dark|light)\s+mode/, /^theme$/i],
    action: 'toggle-theme',
    description: 'Toggle dark mode',
  },
  {
    patterns: [wordPattern],
    action: 'open-word',
    description: 'Open word modal by name',
  },
  {
    patterns: [/^open\s+(.+)$/, /^show\s+(.+)$/i],
    action: 'open-word-flexible',
    description: 'Open word modal by name',
  },
  {
    patterns: [/^sort.*random/, /^shuffle$/i],
    action: 'sort-random',
    description: 'Sort words randomly',
  },
  {
    patterns: [/^sort.*alphabetical/, /^sort.*az/, /^a\s+to\s+z/i],
    action: 'sort-az',
    description: 'Sort words A-Z',
  },
  {
    patterns: [/^sort.*newest/, /^sort.*date/, /^newest$/i],
    action: 'sort-newest',
    description: 'Sort by newest words',
  },
  {
    patterns: [/^sort.*difficult/, /^by\s+difficulty/i],
    action: 'sort-difficulty',
    description: 'Sort by word difficulty',
  },
  {
    patterns: [/^(sort|show|filter).*learned/, /^learned$/i],
    action: 'filter-learned',
    description: 'Filter by learned words',
  },
  {
    patterns: [/^(sort|show|filter).*favorite/, /^favorite$/, /^favorites$/i],
    action: 'filter-favorites',
    description: 'Filter by favorite words',
  },
];

const VoiceContext = createContext(undefined);

export function VoiceProvider({ children }) {
  const [state, setState] = useState(INITIAL_STATE);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [lastCommandDescription, setLastCommandDescription] = useState(null);
  
  const router = useRouter();
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);

  const restartTimeoutRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const listeningStateRef = useRef(false);
  const SILENCE_TIMEOUT = 5000;
  const CONFIDENCE_THRESHOLD = 0.3;

  useEffect(() => {
    const isSupported = isSpeechRecognitionSupported();
    setState((prev) => ({ ...prev, isSupported }));
    
    if (isSupported) {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 3;
        recognitionRef.current = recognition;
      }
    }
    
    synthesisRef.current = window.speechSynthesis;
    
    const savedPreference = storage.get(STORAGE_KEY, true);
    setIsVoiceEnabled(savedPreference);

    return () => {
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;

    const clearTimeouts = () => {
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    };

    recognition.onstart = () => {
      setState((prev) => ({ ...prev, isListening: true, error: null }));
      clearTimeouts();
    };

    recognition.onresult = (event) => {
      clearTimeouts();
      
      const current = event.resultIndex;
      const result = event.results[current];
      
      let bestTranscript = '';
      let bestConfidence = 0;
      
      if (result && result.length > 0) {
        const alternative = result[0];
        bestTranscript = alternative.transcript.trim().toLowerCase();
        bestConfidence = alternative.confidence;
        
        for (let i = 0; i < result.length; i++) {
          if (result[i].confidence > bestConfidence) {
            bestConfidence = result[i].confidence;
            bestTranscript = result[i].transcript.trim().toLowerCase();
          }
        }
      }
      
      setState((prev) => ({
        ...prev,
        transcript: bestTranscript,
      }));

      if (result.isFinal && bestConfidence >= CONFIDENCE_THRESHOLD) {
        processCommand(bestTranscript);
      } else if (result.isFinal && bestConfidence < CONFIDENCE_THRESHOLD) {
        setState((prev) => ({
          ...prev,
          error: `Low confidence (${Math.round(bestConfidence * 100)}%). Please try again.`,
        }));
      }
    };

    recognition.onerror = (event) => {
      clearTimeouts();
      
      const errorMessages = {
        'no-speech': 'No speech detected. Try again.',
        'audio-capture': 'No microphone found. Check your audio settings.',
        'network': 'Network error. Please check your connection.',
      };
      
      const errorMessage = errorMessages[event.error] || event.error;
      
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
      
      if (listeningStateRef.current && isVoiceEnabled && recognitionRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          if (listeningStateRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (error) {
              console.error('Failed to restart after error:', error);
            }
          }
        }, 500);
      }
    };

    recognition.onend = () => {
      clearTimeouts();
      
      if (listeningStateRef.current && isVoiceEnabled && recognitionRef.current) {
        try {
          restartTimeoutRef.current = setTimeout(() => {
            if (listeningStateRef.current && recognitionRef.current) {
              recognitionRef.current.start();
            }
          }, 100);
        } catch (error) {
          console.error('Failed to restart recognition:', error);
        }
      } else {
        setState((prev) => ({
          ...prev,
          isListening: false,
        }));
      }
    };

    return () => {
      clearTimeouts();
      recognition.stop();
    };
  }, [isVoiceEnabled]);

  const processCommand = useCallback((transcript) => {
    for (const command of VOICE_COMMANDS) {
      for (const pattern of command.patterns) {
        if (pattern.test(transcript)) {
          setState((prev) => ({ ...prev, lastCommand: transcript }));
          setLastCommandDescription(command.description);
          executeCommand(command.action, transcript);
          return;
        }
      }
    }
    
    if (transcript.startsWith('open ') || transcript.startsWith('show ')) {
      setState((prev) => ({ ...prev, lastCommand: transcript }));
      setLastCommandDescription('Try to open word by name');
      executeCommand('open-word-flexible', transcript);
    }
  }, []);

  const speak = useCallback((text) => {
    if (!synthesisRef.current || !isVoiceEnabled) return;
    
    synthesisRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    synthesisRef.current.speak(utterance);
  }, [isVoiceEnabled]);

  const findWordByName = useCallback((wordName) => {
    const cleanWordName = wordName.toLowerCase().trim();
    
    let word = SAMPLE_WORDS.find(w => 
      w.term.toLowerCase() === cleanWordName
    );
    
    if (word) return word;
    
    word = SAMPLE_WORDS.find(w => 
      cleanWordName.includes(w.term.toLowerCase()) || 
      w.term.toLowerCase().includes(cleanWordName)
    );
    
    if (word) return word;
    
    return null;
  }, []);

  const executeCommand = useCallback((action, transcript) => {
    switch (action) {
      case '/':
        router.push('/');
        speak('Navigating to home');
        break;
      case '/dashboard':
        router.push('/dashboard');
        speak('Navigating to dashboard');
        break;
      case '/groups':
        router.push('/groups');
        speak('Navigating to groups');
        break;
      case 'next-card':
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { command: 'next' } }));
        speak('Moving to next card');
        break;
      case 'previous-card':
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { command: 'previous' } }));
        speak('Moving to previous card');
        break;
      case 'open-card':
        if (transcript) {
          const match = transcript.match(/(\d+)/);
          if (match) {
            const index = parseInt(match[1]) - 1;
            window.dispatchEvent(new CustomEvent('voice-command', { 
              detail: { command: 'open-card', index } 
            }));
            speak(`Opening card ${match[1]}`);
          }
        }
        break;
      case 'explain-word':
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { command: 'explain' } }));
        speak('Explaining current word');
        break;
      case 'save-word':
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { command: 'save' } }));
        speak('Saving current word');
        break;
      case 'read-word':
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { command: 'read' } }));
        speak('Reading word aloud');
        break;
      case 'search':
        if (transcript) {
          const searchQuery = transcript.replace(/^(search|find)\s+for\s+/i, '');
          window.dispatchEvent(new CustomEvent('voice-command', { 
            detail: { command: 'search', query: searchQuery } 
          }));
          speak(`Searching for ${searchQuery}`);
        }
        break;
      case 'scroll-down':
        window.scrollBy({ top: 600, behavior: 'smooth' });
        speak('Scrolling down');
        break;
      case 'scroll-up':
        window.scrollBy({ top: -600, behavior: 'smooth' });
        speak('Scrolling up');
        break;
      case 'close':
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { command: 'close' } }));
        speak('Closing modal');
        break;
      case 'toggle-theme':
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { command: 'toggle-theme' } }));
        speak('Toggling theme');
        break;
      case 'open-word':
      case 'open-word-flexible':
        if (transcript) {
          const wordName = transcript.toLowerCase().replace(/^(open|show)\s+/i, '').trim();
          const word = findWordByName(wordName);
          
          if (word) {
            window.dispatchEvent(new CustomEvent('voice-command', { 
              detail: { 
                command: 'open-word', 
                word 
              } 
            }));
            speak(`Opening ${word.term}`);
          } else {
            speak(`Sorry, I couldn't find the word "${wordName}"`);
          }
        }
        break;
      case 'sort-random':
        window.dispatchEvent(new CustomEvent('voice-command', { 
          detail: { command: 'sort', sortType: 'random' } 
        }));
        speak('Sorting randomly');
        break;
      case 'sort-az':
        window.dispatchEvent(new CustomEvent('voice-command', { 
          detail: { command: 'sort', sortType: 'az' } 
        }));
        speak('Sorting A to Z');
        break;
      case 'sort-newest':
        window.dispatchEvent(new CustomEvent('voice-command', { 
          detail: { command: 'sort', sortType: 'newest' } 
        }));
        speak('Sorting by newest');
        break;
      case 'sort-difficulty':
        window.dispatchEvent(new CustomEvent('voice-command', { 
          detail: { command: 'sort', sortType: 'difficulty' } 
        }));
        speak('Sorting by difficulty');
        break;
      case 'filter-learned':
        window.dispatchEvent(new CustomEvent('voice-command', { 
          detail: { command: 'filter', filterType: 'learned' } 
        }));
        speak('Showing learned words');
        break;
      case 'filter-favorites':
        window.dispatchEvent(new CustomEvent('voice-command', { 
          detail: { command: 'filter', filterType: 'favorites' } 
        }));
        speak('Showing favorite words');
        break;
    }
  }, [router, speak, findWordByName]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isVoiceEnabled) return;
    
    try {
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      
      listeningStateRef.current = true;
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setState((prev) => ({ ...prev, error: 'Failed to start listening' }));
    }
  }, [isVoiceEnabled]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      listeningStateRef.current = false;
      
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      
      recognitionRef.current.stop();
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
    }
  }, []);

  const toggleVoiceEnabled = useCallback(() => {
    setIsVoiceEnabled((prev) => {
      const newValue = !prev;
      storage.set(STORAGE_KEY, newValue);
      
      if (newValue) {
        speak('Voice commands enabled');
      } else {
        speak('Voice commands disabled');
        stopListening();
      }
      
      return newValue;
    });
  }, [speak, stopListening]);

  const value = {
    ...state,
    startListening,
    stopListening,
    speak,
    isVoiceEnabled,
    toggleVoiceEnabled,
    lastCommandDescription,
    executeCommand
  };

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}
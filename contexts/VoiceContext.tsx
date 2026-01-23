'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { VoiceState, VoiceCommand, Word, SortType } from '@/types';
import { isSpeechRecognitionSupported, storage } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { SAMPLE_WORDS } from '@/lib/data';

const STORAGE_KEY = 'vocabflow-voice-enabled';

const INITIAL_STATE: VoiceState = {
  isListening: false,
  isSupported: false,
  transcript: '',
  error: null,
  lastCommand: null,
};

// Create dynamic patterns for all words
const wordNames = SAMPLE_WORDS.map(w => w.term.toLowerCase());
const wordPattern = new RegExp(`^(open|show)\\s+(${wordNames.join('|')})$`, 'i');

// Voice command definitions with regex patterns (improved for better accuracy)
const VOICE_COMMANDS: VoiceCommand[] = [
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
  // Commands for opening specific words
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
  // Commands for sorting
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

interface VoiceContextType extends VoiceState {
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  
  isVoiceEnabled: boolean;
  toggleVoiceEnabled: () => void;
  lastCommandDescription: string | null;
  executeCommand: (command: string) => void;
  openWordModal? : (word: Word) => void;
  sortWords? : (sortType: SortType) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

/**
 * Provider component that manages voice recognition state and commands
 */
export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<VoiceState>(INITIAL_STATE);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [lastCommandDescription, setLastCommandDescription] = useState<string | null>(null);
  
  const router = useRouter();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  // Refs for tracking state
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const SILENCE_TIMEOUT = 5000; // Restart after 5 seconds of silence
  const CONFIDENCE_THRESHOLD = 0.3; // Only accept results with at least 30% confidence

  // Check for browser support
  useEffect(() => {
    const isSupported = isSpeechRecognitionSupported();
    setState((prev) => ({ ...prev, isSupported }));
    
    if (isSupported) {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass();
        // Settings for continuous listening
        recognition.continuous = true; // Keep listening continuously
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 3; // Get top 3 alternatives
        recognitionRef.current = recognition;
      }
    }
    
    synthesisRef.current = window.speechSynthesis;
    
    // Load voice preference
    const savedPreference = storage.get<boolean>(STORAGE_KEY, true);
    setIsVoiceEnabled(savedPreference);

    // Cleanup timeouts on unmount
    return () => {
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    };
  }, []);

  // Handle recognition results
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

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      clearTimeouts();
      
      const current = event.resultIndex;
      const result = event.results[current];
      
      // Get the best match with highest confidence
      let bestTranscript = '';
      let bestConfidence = 0;
      
      if (result && result.length > 0) {
        const alternative = result[0];
        bestTranscript = alternative.transcript.trim().toLowerCase();
        bestConfidence = alternative.confidence;
        
        // Also check other alternatives if available
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

      // Process command when speech is finalized and has sufficient confidence
      if (result.isFinal && bestConfidence >= CONFIDENCE_THRESHOLD) {
        processCommand(bestTranscript);
      } else if (result.isFinal && bestConfidence < CONFIDENCE_THRESHOLD) {
        // Low confidence result - show message but don't process
        setState((prev) => ({
          ...prev,
          error: `Low confidence (${Math.round(bestConfidence * 100)}%). Please try again.`,
        }));
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      clearTimeouts();
      
      const errorMessages: { [key: string]: string } = {
        'no-speech': 'No speech detected. Try again.',
        'audio-capture': 'No microphone found. Check your audio settings.',
        'network': 'Network error. Please check your connection.',
      };
      
      const errorMessage = errorMessages[event.error] || event.error;
      
      setState((prev) => ({
        ...prev,
        isListening: false,
        error: errorMessage,
      }));
    };

    recognition.onend = () => {
      setState((prev) => ({
        ...prev,
        isListening: false,
      }));
      
      clearTimeouts();
    };

    return () => {
      clearTimeouts();
      recognition.stop();
    };
  }, [isVoiceEnabled]);

  // Process a voice command
  const processCommand = useCallback((transcript: string) => {
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
    
    // If no command matched, try to handle as "open [word]" flexibly
    if (transcript.startsWith('open ') || transcript.startsWith('show ')) {
      setState((prev) => ({ ...prev, lastCommand: transcript }));
      setLastCommandDescription('Try to open word by name');
      executeCommand('open-word-flexible', transcript);
    }
  }, []);

  // Speak text using speech synthesis
  const speak = useCallback((text: string) => {
    if (!synthesisRef.current || !isVoiceEnabled) return;
    
    // Cancel any ongoing speech
    synthesisRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    synthesisRef.current.speak(utterance);
  }, [isVoiceEnabled]);

  // Find word by name (with fuzzy matching)
  const findWordByName = useCallback((wordName: string): Word | null => {
    const cleanWordName = wordName.toLowerCase().trim();
    
    // 1. Exact match
    let word = SAMPLE_WORDS.find(w => 
      w.term.toLowerCase() === cleanWordName
    );
    
    if (word) return word;
    
    // 2. Contains match
    word = SAMPLE_WORDS.find(w => 
      cleanWordName.includes(w.term.toLowerCase()) || 
      w.term.toLowerCase().includes(cleanWordName)
    );
    
    if (word) return word;
    
    // 3. Soundex or fuzzy matching could be added here
    // For now, return null if no match found
    return null;
  }, []);

  // Execute a recognized command
  const executeCommand = useCallback((action: string, transcript?: string) => {
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
      case 'finish':
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { command: 'finish' } }));
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
        
      // New commands for opening words
      case 'open-word':
      case 'open-word-flexible':
        if (transcript) {
          // Extract word name from transcript
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
        
      // New commands for sorting
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

  // Start listening for voice commands
  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isVoiceEnabled) return;
    
    try {
      // Clear any existing timeouts
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setState((prev) => ({ ...prev, error: 'Failed to start listening' }));
    }
  }, [isVoiceEnabled]);

  // Stop listening for voice commands
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      
      recognitionRef.current.stop();
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
    }
  }, []);

  // Toggle voice feature on/off
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





  const value: VoiceContextType = {
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

/**
 * Hook to access the voice context
 * @throws Error if used outside of VoiceProvider
 */
export function useVoice() {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives:number;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}
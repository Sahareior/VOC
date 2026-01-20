'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { VoiceState, VoiceCommand } from '@/types';
import { isSpeechRecognitionSupported, storage } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { delay } from '@/lib/utils';

const STORAGE_KEY = 'vocabflow-voice-enabled';

const INITIAL_STATE: VoiceState = {
  isListening: false,
  isSupported: false,
  transcript: '',
  error: null,
  lastCommand: null,
};

// Voice command definitions with regex patterns
const VOICE_COMMANDS: VoiceCommand[] = [
  {
    patterns: [/^(go\s+)?home$/i, /^go\s+to\s+home$/i],
    action: '/',
    description: 'Navigate to home page',
  },
  {
    patterns: [/^(go\s+)?(to\s+)?(my\s+)?(dashboard|profile)$/i, /^open\s+(my\s+)?(dashboard|profile)$/i],
    action: '/dashboard',
    description: 'Navigate to dashboard',
  },
  {
    patterns: [/^(go\s+)?next$/i, /^next\s+card$/i],
    action: 'next-card',
    description: 'Go to next card',
  },
  {
    patterns: [/^(go\s+)?previous$/i, /^previous\s+card$/i, /^back$/i],
    action: 'previous-card',
    description: 'Go to previous card',
  },
  {
    patterns: [/^open\s+(\d+)$/i, /^card\s+(\d+)$/i],
    action: 'open-card',
    description: 'Open a specific card by number',
  },
  {
    patterns: [/^(explain|define|meaning\s+of)\s+(this|current)\s+word$/i, /^what('s|\s+is)\s+(this|current)\s+word$/i],
    action: 'explain-word',
    description: 'Explain the current word',
  },
  {
    patterns: [/^(save|add)\s+(this|current)\s+word$/i, /^mark\s+(this|current)\s+word(\s+as\s+learned)?$/i],
    action: 'save-word',
    description: 'Save/mark current word as learned',
  },
  {
    patterns: [/^(read|pronounce|say)\s+(this|current)\s+word$/i],
    action: 'read-word',
    description: 'Read the current word aloud',
  },
  {
    patterns: [/^search\s+for\s+(.+)$/i, /^find\s+(.+)$/i],
    action: 'search',
    description: 'Search for a word',
  },
  {
    patterns: [/^(scroll\s+)?down$/i, /^scroll\s+down$/i],
    action: 'scroll-down',
    description: 'Scroll down the page',
  },
  {
    patterns: [/^(scroll\s+)?up$/i, /^scroll\s+up$/i],
    action: 'scroll-up',
    description: 'Scroll up the page',
  },
  {
    patterns: [/^close$/i, /^close\s+(modal|this)$/i],
    action: 'close',
    description: 'Close current modal or dialog',
  },
  {
    patterns: [/^(toggle\s+)?dark(\s+mode)?$/i, /^switch\s+theme$/i],
    action: 'toggle-theme',
    description: 'Toggle dark mode',
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

  // Check for browser support
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
        recognitionRef.current = recognition;
      }
    }
    
    synthesisRef.current = window.speechSynthesis;
    
    // Load voice preference
    const savedPreference = storage.get<boolean>(STORAGE_KEY, true);
    setIsVoiceEnabled(savedPreference);
  }, []);

  // Handle recognition results
  useEffect(() => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;

    recognition.onstart = () => {
      setState((prev) => ({ ...prev, isListening: true, error: null }));
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const transcript = result[0].transcript.trim().toLowerCase();
      
      setState((prev) => ({
        ...prev,
        transcript,
      }));

      // Process command when speech is finalized
      if (result.isFinal) {
        processCommand(transcript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setState((prev) => ({
        ...prev,
        isListening: false,
        error: event.error,
      }));
    };

    recognition.onend = () => {
      setState((prev) => ({
        ...prev,
        isListening: false,
      }));
    };

    return () => {
      recognition.stop();
    };
  }, []);

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
  }, []);

  // Execute a recognized command
  const executeCommand = useCallback((action: string, transcript?: string) => {
    switch (action) {
      case '/':
        router.push('/');
        break;
      case '/dashboard':
        router.push('/dashboard');
        break;
      case 'next-card':
        // Dispatch custom event for next card navigation
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { command: 'next' } }));
        break;
      case 'previous-card':
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { command: 'previous' } }));
        break;
      case 'open-card':
        // Extract card number from transcript
        if (transcript) {
          const match = transcript.match(/(\d+)/);
          if (match) {
            window.dispatchEvent(new CustomEvent('voice-command', { detail: { command: 'open', index: parseInt(match[1]) - 1 } }));
          }
        }
        break;
      case 'explain-word':
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { command: 'explain' } }));
        break;
      case 'save-word':
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { command: 'save' } }));
        break;
      case 'read-word':
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { command: 'read' } }));
        break;
      case 'search':
        // Handle search command - would require search context
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { command: 'search', query: transcript?.replace(/^(search|find)\s+for\s+/i, '') } }));
        break;
      case 'scroll-down':
        window.scrollBy({ top: 300, behavior: 'smooth' });
        break;
      case 'scroll-up':
        window.scrollBy({ top: -300, behavior: 'smooth' });
        break;
      case 'close':
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { command: 'close' } }));
        break;
      case 'toggle-theme':
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { command: 'toggle-theme' } }));
        break;
    }
  }, [router]);

  // Start listening for voice commands
  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isVoiceEnabled) return;
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
    }
  }, [isVoiceEnabled]);

  // Stop listening for voice commands
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
    }
  }, []);

  // Speak text using speech synthesis
  const speak = useCallback(async (text: string) => {
    if (!synthesisRef.current) return;
    
    // Cancel any ongoing speech
    synthesisRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    synthesisRef.current.speak(utterance);
  }, []);

  // Toggle voice feature on/off
  const toggleVoiceEnabled = useCallback(() => {
    setIsVoiceEnabled((prev) => {
      const newValue = !prev;
      storage.set(STORAGE_KEY, newValue);
      return newValue;
    });
  }, []);

  const value: VoiceContextType = {
    ...state,
    startListening,
    stopListening,
    speak,
    isVoiceEnabled,
    toggleVoiceEnabled,
    lastCommandDescription,
    executeCommand,
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

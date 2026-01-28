'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { VoiceState, VoiceCommand, Word, SortType } from '@/types';
import { storage } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { SAMPLE_WORDS } from '@/lib/data';
import { useSpeechContext } from '@speechly/react-client';

const STORAGE_KEY = 'vocabflow-voice-enabled';

const INITIAL_STATE: VoiceState = {
  isListening: false,
  isSupported: true,
  transcript: '',
  error: null,
  lastCommand: null,
};

// Create dynamic patterns for all words
const wordNames = SAMPLE_WORDS.map(w => w.term.toLowerCase());
const wordPattern = new RegExp(`^(open|show)\\s+(${wordNames.join('|')})$`, 'i');

// Voice command definitions with regex patterns
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

interface VoiceContextType extends VoiceState {
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  isVoiceEnabled: boolean;
  toggleVoiceEnabled: () => void;
  lastCommandDescription: string | null;
  executeCommand: (command: string) => void;
  openWordModal?: (word: Word) => void;
  sortWords?: (sortType: SortType) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

/**
 * Provider component that manages voice recognition state and commands using Speechly
 */
export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<VoiceState>(INITIAL_STATE);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [lastCommandDescription, setLastCommandDescription] = useState<string | null>(null);
  
  const router = useRouter();
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const listeningStateRef = useRef<boolean>(false);

  // Use Speechly's React hook
  const { listening, transcript, startListening: speechlyStart, stopListening: speechlyStop } = useSpeechContext();

  // Initialize speech synthesis
  useEffect(() => {
    synthesisRef.current = window.speechSynthesis;
    
    // Load voice preference
    const savedPreference = storage.get<boolean>(STORAGE_KEY, true);
    setIsVoiceEnabled(savedPreference);
  }, []);

  // Update state when Speechly listening changes
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      isListening: listening,
    }));
  }, [listening]);

  // Update transcript
  useEffect(() => {
    if (transcript) {
      const finalTranscript = transcript.isFinal ? transcript.value.toLowerCase().trim() : '';
      
      setState((prev) => ({
        ...prev,
        transcript: finalTranscript || transcript.value.toLowerCase().trim(),
      }));

      // Process final transcript
      if (transcript.isFinal && finalTranscript) {
        processCommand(finalTranscript);
      }
    }
  }, [transcript]);

  // Process a voice command
  const processCommand = useCallback((text: string) => {
    for (const command of VOICE_COMMANDS) {
      for (const pattern of command.patterns) {
        if (pattern.test(text)) {
          setState((prev) => ({ ...prev, lastCommand: text }));
          setLastCommandDescription(command.description);
          executeCommand(command.action, text);
          return;
        }
      }
    }
    
    // Try flexible word opening
    if (text.startsWith('open ') || text.startsWith('show ')) {
      setState((prev) => ({ ...prev, lastCommand: text }));
      setLastCommandDescription('Try to open word by name');
      executeCommand('open-word-flexible', text);
    }
  }, []);

  // Speak text using speech synthesis
  const speak = useCallback((text: string) => {
    if (!synthesisRef.current || !isVoiceEnabled) return;
    
    synthesisRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    synthesisRef.current.speak(utterance);
  }, [isVoiceEnabled]);

  // Find word by name
  const findWordByName = useCallback((wordName: string): Word | null => {
    const cleanWordName = wordName.toLowerCase().trim();
    
    let word = SAMPLE_WORDS.find(w => 
      w.term.toLowerCase() === cleanWordName
    );
    
    if (word) return word;
    
    word = SAMPLE_WORDS.find(w => 
      cleanWordName.includes(w.term.toLowerCase()) || 
      w.term.toLowerCase().includes(cleanWordName)
    );
    
    return word || null;
  }, []);

  // Execute a recognized command
  const executeCommand = useCallback((action: string, text?: string) => {
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
        if (text) {
          const match = text.match(/(\d+)/);
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
      case 'read-word':
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { command: 'read' } }));
        speak('Reading word aloud');
        break;
      case 'search':
        if (text) {
          const searchQuery = text.replace(/^(search|find)\s+for\s+/i, '');
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
        if (text) {
          const wordName = text.toLowerCase().replace(/^(open|show)\s+/i, '').trim();
          const word = findWordByName(wordName);
          
          if (word) {
            window.dispatchEvent(new CustomEvent('voice-command', { 
              detail: { command: 'open-word', word } 
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
    if (!isVoiceEnabled) return;
    listeningStateRef.current = true;
    speechlyStart();
  }, [isVoiceEnabled, speechlyStart]);

  const stopListening = useCallback(() => {
    listeningStateRef.current = false;
    speechlyStop();
  }, [speechlyStop]);

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
    executeCommand,
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

// Word related types
export type WordCategory = 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type SortType = 'random' | 'az' | 'newest' | 'difficulty';

export interface Word {
  id: string;
  term: string;
  phonetic: string;
  definition: string;
  example: string;
  category: WordCategory;
  difficulty: DifficultyLevel;
  imageUrl: string;
  synonyms: string[];
  antonyms: string[];
}

// User progress types
export interface UserStats {
  totalWordsLearned: number;
  totalFavorites: number;
  currentStreak: number;
  longestStreak: number;
  wordsByCategory: Record<WordCategory, number>;
  lastActivityDate: string | null;
}

// User state types
export interface UserState {
  learnedWords: string[];
  favorites: string[];
  stats: UserStats;
}

// AI Chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AIChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  isTyping: boolean;
}

// Voice navigation types
export interface VoiceState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
  lastCommand: string | null;
  openWordModal: (word: Word) => void;
  sortWords: (sortType: SortType) => void;
}

// Voice command mappings
export interface VoiceCommand {
  patterns: RegExp[];
  action: string;
  description: string;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface WordCardProps {
  word: Word;
  isLearned: boolean;
  isFavorite: boolean;
  onOpenModal: (word: Word) => void;
  onToggleFavorite: (wordId: string) => void;
  onToggleLearned: (wordId: string) => void;
}

export interface WordModalProps {
  word: Word | null;
  isOpen: boolean;
  isLearned: boolean;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (wordId: string) => void;
  onToggleLearned: (wordId: string) => void;
  onAskAI: (word: Word) => void;
}

// Category configuration
export interface CategoryConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

export const CATEGORY_CONFIGS: Record<WordCategory, CategoryConfig> = {
  noun: {
    label: 'Noun',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    icon: '📍',
  },
  verb: {
    label: 'Verb',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950',
    icon: '⚡',
  },
  adjective: {
    label: 'Adjective',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    icon: '✨',
  },
  adverb: {
    label: 'Adverb',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    icon: '🏃',
  },
  preposition: {
    label: 'Preposition',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950',
    icon: '🔗',
  },
};

// Difficulty configuration
export interface DifficultyConfig {
  label: string;
  color: string;
  bgColor: string;
}

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  beginner: {
    label: 'Beginner',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950',
  },
  intermediate: {
    label: 'Intermediate',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950',
  },
  advanced: {
    label: 'Advanced',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950',
  },
};

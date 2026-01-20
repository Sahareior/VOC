'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserState, UserStats, WordCategory } from '@/types';
import { storage } from '@/lib/utils';

interface UserContextType extends UserState {
  // Actions
  toggleLearned: (wordId: string) => void;
  toggleFavorite: (wordId: string) => void;
  isLearned: (wordId: string) => boolean;
  isFavorite: (wordId: string) => boolean;
  resetProgress: () => void;
  updateStats: () => void;
}

const STORAGE_KEY = 'vocabflow-user-state';

const INITIAL_STATS: UserStats = {
  totalWordsLearned: 0,
  totalFavorites: 0,
  currentStreak: 0,
  longestStreak: 0,
  wordsByCategory: {
    noun: 0,
    verb: 0,
    adjective: 0,
    adverb: 0,
    preposition: 0,
  },
  lastActivityDate: null,
};

const INITIAL_STATE: UserState = {
  learnedWords: [],
  favorites: [],
  stats: INITIAL_STATS,
};

// Create the context with a default undefined value
const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * Provider component that manages user state and persistence
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UserState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = storage.get<UserState>(STORAGE_KEY, INITIAL_STATE);
    if (savedState) {
      setState(savedState);
    }
    setIsLoaded(true);
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      storage.set(STORAGE_KEY, state);
    }
  }, [state, isLoaded]);

  // Toggle a word as learned
  const toggleLearned = useCallback((wordId: string) => {
    setState((prev) => {
      const isCurrentlyLearned = prev.learnedWords.includes(wordId);
      const newLearnedWords = isCurrentlyLearned
        ? prev.learnedWords.filter((id) => id !== wordId)
        : [...prev.learnedWords, wordId];

      return {
        ...prev,
        learnedWords: newLearnedWords,
      };
    });
  }, []);

  // Toggle a word as favorite
  const toggleFavorite = useCallback((wordId: string) => {
    setState((prev) => {
      const isCurrentlyFavorite = prev.favorites.includes(wordId);
      const newFavorites = isCurrentlyFavorite
        ? prev.favorites.filter((id) => id !== wordId)
        : [...prev.favorites, wordId];

      return {
        ...prev,
        favorites: newFavorites,
      };
    });
  }, []);

  // Check if a word is learned
  const isLearned = useCallback(
    (wordId: string) => state.learnedWords.includes(wordId),
    [state.learnedWords]
  );

  // Check if a word is favorite
  const isFavorite = useCallback(
    (wordId: string) => state.favorites.includes(wordId),
    [state.favorites]
  );

  // Reset all progress
  const resetProgress = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  // Update stats based on current state
  const updateStats = useCallback(() => {
    setState((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        totalWordsLearned: prev.learnedWords.length,
        totalFavorites: prev.favorites.length,
      },
    }));
  }, []);

  // Calculate stats whenever learnedWords or favorites change
  useEffect(() => {
    if (isLoaded) {
      updateStats();
    }
  }, [state.learnedWords, state.favorites, isLoaded, updateStats]);

  const value: UserContextType = {
    ...state,
    toggleLearned,
    toggleFavorite,
    isLearned,
    isFavorite,
    resetProgress,
    updateStats,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/**
 * Hook to access the user context
 * @throws Error if used outside of UserProvider
 */
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { storage } from '../lib/utils';


const STORAGE_KEY = 'vocabflow-user-state';

const INITIAL_STATS = {
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

const INITIAL_STATE = {
  learnedWords: [],
  favorites: [],
  stats: INITIAL_STATS,
};

const UserContext = createContext(undefined);

export function UserProvider({ children }) {
  const [state, setState] = useState(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedState = storage.get(STORAGE_KEY, INITIAL_STATE);
    if (savedState) {
      setState(savedState);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      storage.set(STORAGE_KEY, state);
    }
  }, [state, isLoaded]);

  const toggleLearned = useCallback((wordId) => {
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

  const toggleFavorite = useCallback((wordId) => {
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

  const isLearned = useCallback(
    (wordId) => state.learnedWords.includes(wordId),
    [state.learnedWords]
  );

  const isFavorite = useCallback(
    (wordId) => state.favorites.includes(wordId),
    [state.favorites]
  );

  const resetProgress = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

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

  useEffect(() => {
    if (isLoaded) {
      updateStats();
    }
  }, [state.learnedWords, state.favorites, isLoaded, updateStats]);

  const value = {
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

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
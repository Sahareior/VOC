'use client';

import React, { useState, useCallback } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { WordCard } from './WordCard';
import { Button } from '@/components/ui/Button';
import { Word, WordCategory, DifficultyLevel } from '@/types';
import { cn } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';

interface WordGridProps {
  words: Word[];
  onOpenModal: (word: Word) => void;
}

export function WordGrid({ words, onOpenModal }: WordGridProps) {
  const { isLearned, isFavorite, toggleLearned, toggleFavorite } = useUser();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WordCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter words based on search and filters
  const filteredWords = words.filter((word) => {
    const matchesSearch =
      word.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.synonyms.some((syn) => syn.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || word.category === selectedCategory;

    const matchesDifficulty =
      selectedDifficulty === 'all' || word.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
  }, []);

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all';

  return (
    <div className="space-y-6">
      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search words, definitions, or synonyms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter toggle button */}
        <Button
          variant={showFilters ? 'primary' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
          leftIcon={<Filter className="w-4 h-4" />}
        >
          Filters
        </Button>
      </div>

      {/* Filter options */}
      {showFilters && (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as WordCategory | 'all')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Categories</option>
                <option value="noun">Noun</option>
                <option value="verb">Verb</option>
                <option value="adjective">Adjective</option>
                <option value="adverb">Adverb</option>
                <option value="preposition">Preposition</option>
              </select>
            </div>

            {/* Difficulty filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel | 'all')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4" />
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-slate-500 dark:text-slate-400">
        Showing {filteredWords.length} of {words.length} words
        {hasActiveFilters && (
          <span className="ml-2 text-primary-600 dark:text-primary-400">
            (filtered)
          </span>
        )}
      </div>

      {/* Word grid */}
      {filteredWords.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredWords.map((word) => (
            <WordCard
              key={word.id}
              word={word}
              isLearned={isLearned(word.id)}
              isFavorite={isFavorite(word.id)}
              onOpenModal={onOpenModal}
              onToggleFavorite={toggleFavorite}
              onToggleLearned={toggleLearned}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No words found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { BookOpen, Heart, Trophy, Flame, TrendingUp, Clock, Star, ChevronRight, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { WordModal } from '@/components/features/WordModal';
import { SAMPLE_WORDS } from '@/lib/data';
import { useUser } from '@/contexts/UserContext';
import { Word, WordCategory } from '@/types';
import { cn, formatDate } from '@/lib/utils';
import { CATEGORY_CONFIGS } from '@/types';

type TabType = 'learned' | 'favorites';

export default function DashboardPage() {
  const { learnedWords, favorites, stats, toggleLearned, toggleFavorite, isLearned, isFavorite, resetProgress } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>('learned');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get word objects from IDs
  const learnedWordObjects = useMemo(() => {
    return SAMPLE_WORDS.filter(word => learnedWords.includes(word.id));
  }, [learnedWords]);

  const favoriteWordObjects = useMemo(() => {
    return SAMPLE_WORDS.filter(word => favorites.includes(word.id));
  }, [favorites]);

  // Handle word click
  const handleWordClick = (word: Word) => {
    setSelectedWord(word);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWord(null);
  };

  // Handle AI ask
  const handleAskAI = (word: Word) => {
    setIsModalOpen(false);
    // The AI widget will show with context
  };

  // Count words by category
  const wordsByCategory = useMemo(() => {
    const counts: Record<WordCategory, number> = {
      noun: 0,
      verb: 0,
      adjective: 0,
      adverb: 0,
      preposition: 0,
    };
    
    learnedWordObjects.forEach(word => {
      counts[word.category]++;
    });
    
    return counts;
  }, [learnedWordObjects]);

  // Calculate progress percentage
  const progressPercentage = Math.round((learnedWords.length / SAMPLE_WORDS.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Your Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Track your vocabulary learning progress
            </p>
          </div>
          
          {learnedWords.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                if (confirm('Are you sure you want to reset all your progress?')) {
                  resetProgress();
                }
              }}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Reset Progress
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {learnedWords.length}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Words Learned</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {favorites.length}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Favorites</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Flame className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.currentStreak || 0}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Day Streak</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {progressPercentage}%
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Completion</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress Card */}
        <Card className="mb-8 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Learning Progress
            </h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {learnedWords.length} of {SAMPLE_WORDS.length} words
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Category breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(wordsByCategory).map(([category, count]) => {
              const config = CATEGORY_CONFIGS[category as WordCategory];
              return (
                <div
                  key={category}
                  className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <span className="text-lg">{config.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {count}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {config.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('learned')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'learned'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            )}
          >
            <BookOpen className="w-4 h-4" />
            Learned Words
            <Badge size="sm" variant="default" rounded>
              {learnedWordObjects.length}
            </Badge>
          </button>
          
          <button
            onClick={() => setActiveTab('favorites')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'favorites'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            )}
          >
            <Heart className="w-4 h-4" />
            Favorites
            <Badge size="sm" variant="default" rounded>
              {favoriteWordObjects.length}
            </Badge>
          </button>
        </div>

        {/* Word Lists */}
        {activeTab === 'learned' && (
          <div className="space-y-3">
            {learnedWordObjects.length > 0 ? (
              learnedWordObjects.map((word) => (
                <DashboardWordItem
                  key={word.id}
                  word={word}
                  isFavorite={isFavorite(word.id)}
                  onClick={() => handleWordClick(word)}
                  onToggleFavorite={() => toggleFavorite(word.id)}
                />
              ))
            ) : (
              <EmptyState
                icon={<BookOpen className="w-12 h-12" />}
                title="No words learned yet"
                description="Start exploring words and mark them as learned to track your progress"
                action={
                  <Link href="/">
                    <Button variant="primary">Explore Words</Button>
                  </Link>
                }
              />
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="space-y-3">
            {favoriteWordObjects.length > 0 ? (
              favoriteWordObjects.map((word) => (
                <DashboardWordItem
                  key={word.id}
                  word={word}
                  isFavorite={true}
                  onClick={() => handleWordClick(word)}
                  onToggleFavorite={() => toggleFavorite(word.id)}
                />
              ))
            ) : (
              <EmptyState
                icon={<Star className="w-12 h-12" />}
                title="No favorites yet"
                description="Click the heart icon on any word to add it to your favorites"
                action={
                  <Link href="/">
                    <Button variant="primary">Explore Words</Button>
                  </Link>
                }
              />
            )}
          </div>
        )}
      </div>

      {/* Word Detail Modal */}
      <WordModal
        word={selectedWord}
        isOpen={isModalOpen}
        isLearned={selectedWord ? isLearned(selectedWord.id) : false}
        isFavorite={selectedWord ? isFavorite(selectedWord.id) : false}
        onClose={handleCloseModal}
        onToggleFavorite={toggleFavorite}
        onToggleLearned={toggleLearned}
        onAskAI={handleAskAI}
      />
    </div>
  );
}

/**
 * Dashboard word list item component
 */
function DashboardWordItem({
  word,
  isFavorite,
  onClick,
  onToggleFavorite,
}: {
  word: Word;
  isFavorite: boolean;
  onClick: () => void;
  onToggleFavorite: () => void;
}) {
  const categoryConfig = CATEGORY_CONFIGS[word.category];

  return (
    <div
      className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-card-hover transition-all cursor-pointer group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Word preview image */}
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
        <img
          src={word.imageUrl}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* Word info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
            {word.term}
          </h3>
          <Badge size="sm" className={cn(categoryConfig.color, categoryConfig.bgColor)}>
            {categoryConfig.label}
          </Badge>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
          {word.definition}
        </p>
      </div>

      {/* Favorite button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className={cn(
          'p-2 rounded-lg transition-colors',
          isFavorite
            ? 'text-accent-500'
            : 'text-slate-300 hover:text-accent-500 dark:text-slate-600'
        )}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart className={cn('w-5 h-5', isFavorite && 'fill-current')} />
      </button>

      {/* Arrow */}
      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary-500 transition-colors" />
    </div>
  );
}

/**
 * Empty state component
 */
function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {action}
    </div>
  );
}

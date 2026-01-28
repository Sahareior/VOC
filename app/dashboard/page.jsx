'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { BookOpen, Heart, Trophy, Flame, TrendingUp, Clock, Star, ChevronRight, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import { cn } from '../../lib/utils';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { WordModal } from '../../components/features/WordModal';
import { SAMPLE_WORDS } from '../../lib/data';
import { useUser } from '../../contexts/UserContext';

// Define CATEGORY_CONFIGS locally since it's not in @/types
const CATEGORY_CONFIGS = {
  noun: {
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    label: 'Noun',
  },
  verb: {
    color: 'bg-green-500/10 text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    label: 'Verb',
  },
  adjective: {
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    label: 'Adjective',
  },
  adverb: {
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    label: 'Adverb',
  },
  preposition: {
    color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    label: 'Preposition',
  },
};

export default function DashboardPage() {
  const { learnedWords, favorites, stats, toggleLearned, toggleFavorite, isLearned, isFavorite, resetProgress } = useUser();
  const [activeTab, setActiveTab] = useState('learned');
  const [selectedWord, setSelectedWord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const learnedWordObjects = useMemo(() => {
    return SAMPLE_WORDS.filter(word => learnedWords.includes(String(word.id)))
  }, [learnedWords]);

  const favoriteWordObjects = useMemo(() => {
    return SAMPLE_WORDS.filter(word => favorites.includes(String(word.id)));
  }, [favorites]);

  const handleWordClick = (word) => {
    setSelectedWord(word);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWord(null);
  };

  const handleAskAI = (word) => {
    setIsModalOpen(false);
  };

  const wordsByCategory = useMemo(() => {
    const counts = {
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

  const progressPercentage = Math.round((learnedWords.length / SAMPLE_WORDS.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
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

        <div className="flex gap-2 justify-between md:justify-start mb-6 border-b border-slate-200 dark:border-slate-700">
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

      <WordModal
        word={selectedWord}
        isOpen={isModalOpen}
        isLearned={selectedWord ? isLearned(selectedWord.id) : false}
        isFavorite={selectedWord ? isFavorite(selectedWord.id) : false}
        onClose={handleCloseModal}
        onToggleFavorite={(wordId) => toggleFavorite(wordId)}
        onToggleLearned={(wordId) => toggleLearned(wordId)}
        onAskAI={selectedWord ? () => handleAskAI(selectedWord) : undefined}
      />
    </div>
  );
}

function DashboardWordItem({
  word,
  isFavorite,
  onClick,
  onToggleFavorite,
}) {
  const categoryConfig = CATEGORY_CONFIGS[word.category] || {
    color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-900/30',
    label: word.category || 'Unknown',
  };

  return (
    <div
      className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-card-hover transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
        <Image
          src={word.imageUrl}
          alt=""
          width={64}
          height={64}
          className="w-full h-full object-cover"
        />
      </div>

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

      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary-500 transition-colors" />
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
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
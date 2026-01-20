'use client';

import React, { useState } from 'react';
import { Heart, CheckCircle, Volume2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Word } from '@/types';
import { cn } from '@/lib/utils';
import { CATEGORY_CONFIGS, DIFFICULTY_CONFIGS } from '@/types';

interface WordCardProps {
  word: Word;
  isLearned: boolean;
  isFavorite: boolean;
  onOpenModal: (word: Word) => void;
  onToggleFavorite: (wordId: string) => void;
  onToggleLearned: (wordId: string) => void;
}

export function WordCard({
  word,
  isLearned,
  isFavorite,
  onOpenModal,
  onToggleFavorite,
  onToggleLearned,
}: WordCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const categoryConfig = CATEGORY_CONFIGS[word.category];
  const difficultyConfig = DIFFICULTY_CONFIGS[word.difficulty];

  return (
    <Card
      hoverable
      padding="none"
      className="overflow-hidden group"
    >
      {/* Image container */}
      <div className="relative h-40 bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {!imageError ? (
          <img
            src={word.imageUrl}
            alt={`Illustration for ${word.term}`}
            className={cn(
              'w-full h-full object-cover transition-transform duration-500 group-hover:scale-110',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
            <span className="text-4xl">{categoryConfig.icon}</span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <Badge
            variant="default"
            className={cn(
              'bg-white/90 backdrop-blur-sm dark:bg-slate-900/90',
              categoryConfig.color
            )}
          >
            {categoryConfig.label}
          </Badge>
        </div>

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(word.id);
            }}
            className={cn(
              'p-2 rounded-full backdrop-blur-sm transition-all duration-200',
              isFavorite
                ? 'bg-accent-400 text-white'
                : 'bg-white/80 text-slate-600 hover:bg-white dark:bg-slate-800/80 dark:text-slate-300'
            )}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={cn('w-4 h-4', isFavorite && 'fill-current')}
            />
          </button>
        </div>

        {/* Learned indicator */}
        {isLearned && (
          <div className="absolute bottom-3 right-3">
            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500 text-white rounded-full text-xs font-medium">
              <CheckCircle className="w-3 h-3" />
              <span>Learned</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => onOpenModal(word)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenModal(word);
          }
        }}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {word.term}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {word.phonetic}
            </p>
          </div>
          <Badge
            size="sm"
            className={cn(difficultyConfig.color, difficultyConfig.bgColor)}
          >
            {difficultyConfig.label}
          </Badge>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
          {word.definition}
        </p>

        {/* Preview example */}
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 italic line-clamp-1">
          &ldquo;{word.example}&rdquo;
        </p>
      </div>
    </Card>
  );
}

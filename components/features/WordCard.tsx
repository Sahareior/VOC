'use client';

import React, { useState } from 'react';
import { Heart, CheckCircle, Volume2, ExternalLink, Sparkles } from 'lucide-react';
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
  const [isHovered, setIsHovered] = useState(false);

  const categoryConfig = CATEGORY_CONFIGS[word.category];
  const difficultyConfig = DIFFICULTY_CONFIGS[word.difficulty];

  return (
    <div
      className="relative group perspective-1000"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Glass-morphism card */}
      <div
        className={cn(
          "relative bg-white/5 dark:bg-slate-900/20 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 rounded-2xl overflow-hidden transition-all duration-500 transform-gpu",
          "group-hover:scale-[1.02] group-hover:border-white/40 dark:group-hover:border-slate-600/50",
          "hover:shadow-2xl hover:shadow-purple-500/10"
        )}
        style={{
          transformStyle: 'preserve-3d',
          transform: isHovered ? 'rotateY(5deg) rotateX(2deg)' : 'none',
        }}
      >
        {/* Premium gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        
        {/* Image container with parallax effect */}
        <div className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/30 via-purple-900/20 to-pink-900/10" />
          
          {!imageError ? (
            <div className="relative h-full">
              <img
                src={word.imageUrl}
                alt={`Illustration for ${word.term}`}
                className={cn(
                  'w-full h-full object-cover transition-all duration-700',
                  imageLoaded ? 'opacity-100' : 'opacity-0',
                  'group-hover:scale-110 group-hover:rotate-1'
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                style={{
                  transform: isHovered ? 'translateZ(20px)' : 'none',
                }}
              />
              {/* Image overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900/50 to-slate-800/50">
              <div className="relative">
                <span className="text-5xl text-white/20">{categoryConfig.icon}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl" />
              </div>
            </div>
          )}

          {/* Premium badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <Badge
              variant="default"
              className={cn(
                'glass-effect backdrop-blur-md border-white/20 px-3 py-1.5',
                'font-medium tracking-wide text-xs uppercase',
                'transition-all duration-300 transform-gpu',
                'group-hover:scale-105',
                categoryConfig.color
              )}
              style={{
                transform: isHovered ? 'translateZ(10px)' : 'none',
              }}
            >
              <span className="mr-1.5">{categoryConfig.icon}</span>
              {categoryConfig.label}
            </Badge>
          </div>

          {/* Floating action buttons */}
          <div 
            className="absolute top-4 right-4 flex gap-2 transition-all duration-500"
            style={{
              transform: isHovered ? 'translateZ(15px)' : 'none',
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(word.id);
              }}
              className={cn(
                'p-2.5 rounded-xl backdrop-blur-lg border transition-all duration-300',
                'transform-gpu hover:scale-110 active:scale-95',
                isFavorite
                  ? 'bg-gradient-to-br from-pink-500 to-rose-500 border-pink-400/30 text-white shadow-lg shadow-pink-500/30'
                  : 'bg-white/10 border-white/20 text-slate-300 hover:bg-white/20'
              )}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={cn(
                  'w-4 h-4 transition-all duration-300',
                  isFavorite && 'fill-current animate-pulse'
                )}
              />
            </button>
            
            <button
              onClick={() => onOpenModal(word)}
              className="p-2.5 rounded-xl backdrop-blur-lg border border-white/20 text-slate-300 hover:bg-white/20 hover:text-white transition-all duration-300 transform-gpu hover:scale-110 active:scale-95"
              aria-label="Open word details"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* Learned indicator - premium */}
          {isLearned && (
            <div 
              className="absolute bottom-4 right-4"
              style={{
                transform: isHovered ? 'translateZ(10px)' : 'none',
              }}
            >
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-500/90 to-emerald-600/90 backdrop-blur-lg rounded-full border border-emerald-400/30 shadow-lg shadow-emerald-500/20">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
                <span className="text-xs font-semibold text-white tracking-wide">Learned</span>
              </div>
            </div>
          )}
        </div>

        {/* Content area */}
        <div
          className="p-5 cursor-pointer"
          onClick={() => onOpenModal(word)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenModal(word);
            }
          }}
          style={{
            transform: isHovered ? 'translateZ(5px)' : 'none',
          }}
        >
          {/* Header with premium typography */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-500">
                  {word.term}
                </h3>
                {word.difficulty === 'advanced' && (
                  <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                )}
              </div>

            </div>
            
            {/* Difficulty badge - premium */}
            <Badge
              size="sm"
              className={cn(
                'glass-effect backdrop-blur-md border-white/20 px-3 py-1.5',
                'font-semibold tracking-wide text-xs uppercase',
                'transition-all duration-300 transform-gpu hover:scale-105',
                difficultyConfig.color
              )}
              style={{
                transform: isHovered ? 'translateZ(10px)' : 'none',
              }}
            >
              {difficultyConfig.label}
            </Badge>
          </div>

          {/* Definition */}
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3 line-clamp-2 transition-colors duration-300 group-hover:text-slate-700 dark:group-hover:text-slate-200">
            {word.definition}
          </p>

          {/* Example preview with premium styling */}
          <div className="relative pl-4 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/50">
            <div className="absolute left-0 top-3 w-1 h-1/2 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full" />
            <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-snug line-clamp-1">
              &ldquo;{word.example}&rdquo;
            </p>
          </div>

          {/* Subtle hover reveal effect */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-0 group-hover:w-24 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent transition-all duration-700" />
        </div>

        {/* Hover overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>
    </div>
  );
}

// Add to your global CSS or Tailwind config:
const premiumStyles = `
.glass-effect {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

.perspective-1000 {
  perspective: 1000px;
}

.transform-gpu {
  transform-style: preserve-3d;
  backface-visibility: hidden;
}
`;
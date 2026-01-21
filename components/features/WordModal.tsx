'use client';

import React, { useEffect, useCallback } from 'react';
import { Volume2, Heart, CheckCircle, MessageSquare, Sparkles, Share2, RotateCcw } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Word } from '@/types';
import { cn } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';
import { useVoice } from '@/contexts/VoiceContext';
import { CATEGORY_CONFIGS, DIFFICULTY_CONFIGS } from '@/types';

interface WordModalProps {
  word: Word | null;
  isOpen: boolean;
  isLearned: boolean;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (wordId: string) => void;
  onToggleLearned: (wordId: string) => void;
  onAskAI: (word: Word) => void;
}

export function WordModal({
  word,
  isOpen,
  isLearned,
  isFavorite,
  onClose,
  onToggleFavorite,
  onToggleLearned,
  onAskAI,
}: WordModalProps) {
  const { speak, isListening, startListening, stopListening } = useVoice();
  const { toggleLearned: toggleLearnedState, toggleFavorite: toggleFavoriteState } = useUser();

  // Handle voice commands for the modal
  useEffect(() => {
    const handleVoiceCommand = (event: CustomEvent) => {
      if (!word) return;
      
      const { command } = event.detail;
      
      switch (command) {
        case 'read':
          speak(word.term);
          break;
        case 'save':
          toggleLearnedState(word.id);
          break;
        case 'close':
          onClose();
          break;
        case 'explain':
          onAskAI(word);
          break;
      }
    };

    window.addEventListener('voice-command', handleVoiceCommand as EventListener);
    return () => window.removeEventListener('voice-command', handleVoiceCommand as EventListener);
  }, [word, speak, toggleLearnedState, onClose, onAskAI]);

  const handlePronounce = useCallback(() => {
    if (word) {
      speak(word.term);
    }
  }, [word, speak]);

  const handleAskAI = useCallback(() => {
    if (word) {
      onAskAI(word);
    }
  }, [word, onAskAI]);

  // Don't render if no word
  if (!word) return null;

  const categoryConfig = CATEGORY_CONFIGS[word.category];
  const difficultyConfig = DIFFICULTY_CONFIGS[word.difficulty];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      closeOnOverlay
      closeOnEscape
    >
      <div className="space-y-6">
        {/* Header with image and basic info */}
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Image */}
          <div className="w-full sm:w-40 h-40 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img
              src={word.imageUrl}
              alt={`Illustration for ${word.term}`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Word info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {word.term}
                </h2>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-mono mt-1">
                  {word.phonetic}
                </p>
              </div>
              
              {/* Voice button */}
              <button
                onClick={handlePronounce}
                className={cn(
                  'p-3 rounded-xl transition-all duration-200',
                  'bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500'
                )}
                aria-label="Pronounce word"
              >
                <Volume2 className="w-6 h-6" />
              </button>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={cn(categoryConfig.color, categoryConfig.bgColor)}>
                {categoryConfig.icon} {categoryConfig.label}
              </Badge>
              <Badge className={cn(difficultyConfig.color, difficultyConfig.bgColor)}>
                {difficultyConfig.label}
              </Badge>
              {isLearned && (
                <Badge variant="success">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Learned
                </Badge>
              )}
            </div>

            {/* Quick actions */}
            <div className="flex gap-2">
              <button
                onClick={() => toggleFavoriteState(word.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium',
                  isFavorite
                    ? 'bg-accent-400 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                )}
              >
                <Heart className={cn('w-4 h-4', isFavorite && 'fill-current')} />
                {isFavorite ? 'Favorited' : 'Favorite'}
              </button>
              
              <button
                onClick={() => toggleLearnedState(word.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium',
                  isLearned
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                )}
              >
                <CheckCircle className={cn('w-4 h-4', isLearned && 'fill-current')} />
                {isLearned ? 'Learned' : 'Mark Learned'}
              </button>
            </div>
          </div>
        </div>

        {/* Definition */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Definition
          </h3>
          <p className="text-lg text-slate-900 dark:text-slate-100 leading-relaxed">
            {word.definition}
          </p>
        </div>

        {/* Example sentence */}
        <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border-l-4 border-primary-500">
          <h3 className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">
            Example
          </h3>
          <p className="text-slate-900 dark:text-slate-100 leading-relaxed italic">
            &ldquo;{word.example}&rdquo;
          </p>
        </div>



        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="primary"
            onClick={handleAskAI}
            leftIcon={<MessageSquare className="w-4 h-4" />}
            className="flex-1"
          >
            Ask AI for more info
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              // Share functionality
              if (navigator.share) {
                navigator.share({
                  title: word.term,
                  text: `${word.term} - ${word.definition}`,
                  url: window.location.href,
                });
              }
            }}
            leftIcon={<Share2 className="w-4 h-4" />}
          >
            Share
          </Button>
        </div>

        {/* Voice status indicator */}
        {isListening && (
          <div className="flex items-center justify-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Listening for voice commands...</span>
          </div>
        )}
      </div>
    </Modal>
  );
}

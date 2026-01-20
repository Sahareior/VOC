'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Word, ChatMessage } from '@/types';
import { delay } from '@/lib/utils';

interface AIChatWidgetProps {
  currentWord?: Word | null;
  savedWords?: string[];
}

export function AIChatWidget({ currentWord, savedWords = [] }: AIChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: getWelcomeMessage(),
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get welcome message based on context
  function getWelcomeMessage(): string {
    if (currentWord) {
      return `Hi! I'm your vocabulary assistant. I can help you understand "${currentWord.term}" or answer questions about it. What would you like to know?`;
    }
    return `Hi! I'm your vocabulary assistant. I can help you understand words, provide examples, find synonyms, and more. Just ask me anything!`;
  }

  // Generate AI response (mock implementation)
  const generateResponse = useCallback(async (userMessage: string): Promise<string> => {
    // Simulate API delay
    await delay(800 + Math.random() * 700);

    const lowerMessage = userMessage.toLowerCase();

    // Context-aware responses based on current word
    if (currentWord) {
      if (lowerMessage.includes('meaning') || lowerMessage.includes('definition') || lowerMessage.includes('what does')) {
        return `"${currentWord.term}" means: ${currentWord.definition}. It's a ${currentWord.category} used to describe ${lowerMessage.includes('example') ? 'something specific' : 'concepts related to its meaning'}.`;
      }
      
      if (lowerMessage.includes('example') || lowerMessage.includes('use') || lowerMessage.includes('sentence')) {
        return `Here's how "${currentWord.term}" is typically used:\n\n"${currentWord.example}"\n\nThis sentence shows the word in context as a ${currentWord.category}.`;
      }
      
      if (lowerMessage.includes('synonym') || lowerMessage.includes('similar')) {
        return `Words similar to "${currentWord.term}" include: ${currentWord.synonyms.slice(0, 3).join(', ')}, and ${currentWord.synonyms[3] || 'others'}. These all share similar meanings but may have slightly different connotations.`;
      }
      
      if (lowerMessage.includes('antonym') || lowerMessage.includes('opposite')) {
        return `Opposite of "${currentWord.term}": ${currentWord.antonyms.join(', ')}. These words express contrasting meanings.`;
      }
      
      if (lowerMessage.includes('pronounce') || lowerMessage.includes('pronunciation') || lowerMessage.includes('say')) {
        return `The pronunciation of "${currentWord.term}" is: ${currentWord.phonetic}. You can click the speaker icon on the word card to hear it spoken aloud.`;
      }
      
      if (lowerMessage.includes('difficulty') || lowerMessage.includes('hard') || lowerMessage.includes('level')) {
        return `"${currentWord.term}" is considered a ${currentWord.difficulty} level word. ${currentWord.difficulty === 'advanced' ? 'This is a sophisticated vocabulary word that shows linguistic proficiency.' : currentWord.difficulty === 'intermediate' ? 'This is a mid-level vocabulary word commonly used in academic and professional settings.' : 'This is a fundamental vocabulary word that learners encounter early in their language journey.'}`;
      }
    }

    // General vocabulary questions
    if (lowerMessage.includes('help') || lowerMessage.includes('what can')) {
      return `I can help you with:\n\n• Word definitions and meanings\n• Example sentences\n• Synonyms and antonyms\n• Pronunciation guidance\n• Word usage in context\n• Vocabulary learning tips\n\nWhat would you like to explore?`;
    }

    if (lowerMessage.includes('random') || lowerMessage.includes('new word')) {
      return `Great idea! Would you like me to suggest a new word to learn from your vocabulary list? Just say "suggest a word" and I'll pick one for you!`;
    }

    if (lowerMessage.includes('study') || lowerMessage.includes('learn')) {
      return `Here are some effective vocabulary learning tips:\n\n1. Practice with spaced repetition\n2. Use new words in sentences\n3. Learn synonyms and antonyms together\n4. Read extensively to see words in context\n5. Review regularly to reinforce memory\n\nWould you like me to quiz you on your saved words?`;
    }

    // Default response
    return `That's an interesting question about vocabulary! While I'm here to help with word meanings, examples, and learning tips, you might want to ask me something more specific like:\n\n• "What does [word] mean?"\n• "Give me an example with [word]"\n• "What are synonyms for [word]?"\n\nHow can I assist you further?`;
  }, [currentWord]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await generateResponse(inputValue.trim());
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an issue processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Chat toggle button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            'relative p-4 rounded-full shadow-lg transition-all duration-300',
            'bg-primary-600 text-white hover:bg-primary-700 hover:scale-110',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
          )}
          aria-label="Open AI chat"
        >
          <MessageSquare className="w-6 h-6" />
          
          {/* Notification dot */}
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent-400 rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          className={cn(
            'w-96 h-[32rem] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-modal overflow-hidden',
            'animate-scale-in'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary-600 text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold">Vocabulary AI</h3>
                <p className="text-xs text-primary-100">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Context indicator */}
          {currentWord && (
            <div className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 border-b border-primary-100 dark:border-primary-800">
              <p className="text-xs text-primary-600 dark:text-primary-400">
                <Sparkles className="w-3 h-3 inline mr-1" />
                Currently discussing: <strong>{currentWord.term}</strong>
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' && 'flex-row-reverse'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    message.role === 'assistant'
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  )}
                >
                  {message.role === 'assistant' ? (
                    <Bot className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div
                
                  className={cn(
                    'max-w-[75%] px-4 py-2 rounded-2xl',
                    message.role === 'assistant'
                      ? 'bg-slate-100 dark:bg-slate-800 rounded-tl-none'
                      : 'bg-primary-600 text-white rounded-tr-none'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className={cn(
                    'text-xs mt-1',
                    message.role === 'user' ? 'text-primary-200' : 'text-slate-400'
                  )}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about words..."
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 border-0 rounded-full text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isTyping}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="rounded-full px-4"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

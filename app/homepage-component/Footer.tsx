'use client'

import React from 'react';
import { BookOpen, Globe, GraduationCap, Brain, Sparkles } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const Footer = () => {
     const { theme } = useTheme();
//   const theme = 'dark'; 
  
  const colors = {
    light: {
      bg: 'bg-white',
      border: 'border-slate-100',
      text: 'text-slate-600',
      textMuted: 'text-slate-500',
      title: 'text-slate-900',
      hover: 'hover:text-purple-600',
      icon: 'text-slate-400',
      iconHover: 'hover:text-purple-500',
      logoBg: 'bg-purple-50',
      logoIcon: 'text-purple-600',
    },
    dark: {
      bg: 'bg-slate-900',
      border: 'border-slate-800',
      text: 'text-slate-400',
      textMuted: 'text-slate-500',
      title: 'text-white',
      hover: 'hover:text-purple-300',
      icon: 'text-slate-500',
      iconHover: 'hover:text-purple-400',
      logoBg: 'bg-purple-900/30',
      logoIcon: 'text-purple-300',
    }
  };

  const themeColors = colors[theme];

  return (
    <footer className={`${themeColors.bg} border-t ${themeColors.border} transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        
        {/* Main footer content */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* Logo section */}
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${themeColors.logoBg} transition-colors duration-300`}>
              <BookOpen className={`w-7 h-7 ${themeColors.logoIcon}`} />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className={`text-xl font-bold ${themeColors.title}`}>VocabGlossary</span>
                <Sparkles className="w-4 h-4 text-purple-500" />
              </div>
              <p className={`text-xs ${themeColors.textMuted} mt-1`}>Your AI-powered dictionary</p>
            </div>
          </div>

          {/* Links section */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {[
              { label: 'Dictionary', icon: BookOpen },
              { label: 'Thesaurus', icon: Brain },
              { label: 'Translator', icon: Globe },
              { label: 'Learning', icon: GraduationCap },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <div className={`p-2 rounded-lg ${themeColors.border} border transition-colors duration-200 ${themeColors.hover}`}>
                  <item.icon className={`w-5 h-5 ${themeColors.icon} ${themeColors.iconHover} transition-colors duration-200`} />
                </div>
                <span className={`text-xs font-medium ${themeColors.text}`}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Right section - Quick contact */}
          <div className="text-center md:text-right">
            <p className={`text-sm ${themeColors.title} font-semibold mb-2`}>Need Help?</p>
            <a 
              href="mailto:support@vocabglossary.com" 
              className={`text-sm ${themeColors.text} ${themeColors.hover} transition-colors duration-200`}
            >
              support@vocabglossary.com
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className={`h-px ${themeColors.border} my-6 md:my-8`}></div>

        {/* Bottom section - Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className={`text-sm ${themeColors.textMuted} text-center md:text-left`}>
            © {new Date().getFullYear()} VocabGlossary. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <a href="#" className={`text-xs ${themeColors.text} ${themeColors.hover} transition-colors duration-200`}>
              Privacy Policy
            </a>
            <a href="#" className={`text-xs ${themeColors.text} ${themeColors.hover} transition-colors duration-200`}>
              Terms of Service
            </a>
            <a href="#" className={`text-xs ${themeColors.text} ${themeColors.hover} transition-colors duration-200`}>
              Cookie Policy
            </a>
          </div>
        </div>

        {/* Attribution */}
        <div className="mt-6 text-center">
          <p className={`text-xs ${themeColors.textMuted}`}>
            Made with <BookOpen className="inline w-3 h-3 mx-1 text-purple-500" /> for language learners worldwide
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
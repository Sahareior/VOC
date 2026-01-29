'use client'

import { BookOpen, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import logo from '../../public/logo.png' 
import Image from 'next/image';

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
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${themeColors.logoBg} transition-colors duration-300`}>
              <BookOpen className={`w-7 h-7 ${themeColors.logoIcon}`} />
            </div>
            <div>
              <div className="flex items-center gap-1">
                 <Image
                 src={logo}
                 alt="Logo"
                 width={120}
                 height={50}
                 priority
               />
                <Sparkles className="w-4 h-4 text-purple-500" />
              </div>
              <p className={`text-xs ${themeColors.textMuted} mt-1`}>Your AI-powered dictionary</p>
            </div>
          </div>      
        </div>      
      </div>
    </footer>
  );
};

export default Footer;
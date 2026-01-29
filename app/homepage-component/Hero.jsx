'use client';



import { Sparkles, ArrowRight, Zap, Brain, Target } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';

const Hero = () => {

  const { theme } = useTheme();

  return (
    <div className={`relative min-h-[80vh] py-16 pb-36 flex items-center overflow-hidden ${theme === 'light' ? 'bg-gradient-to-br from-rose-50 via-red-50 to-orange-50' : 'bg-gradient-to-br from-slate-900 via-red-950 to-slate-950'}`}>
      <div className={`absolute inset-0 ${theme === 'light' ? 'bg-gradient-to-br from-rose-50 via-red-50 to-orange-50' : 'bg-gradient-to-br from-slate-900 via-red-950 to-slate-950'}`}>
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: theme === 'light' 
              ? `linear-gradient(to right, #00000011 1px, transparent 1px),
                 linear-gradient(to bottom, #00000011 1px, transparent 1px)`
              : `linear-gradient(to right, #ffffff22 1px, transparent 1px),
                 linear-gradient(to bottom, #ffffff22 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
            opacity: theme === 'light' ? 0.2 : 0.1,
          }}
        />
        
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-pulse ${theme === 'light' ? 'bg-gradient-to-r from-red-400/20 to-rose-400/20' : 'bg-gradient-to-r from-red-600/20 to-rose-600/20'}`} />
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 ${theme === 'light' ? 'bg-gradient-to-r from-orange-400/10 to-amber-400/10' : 'bg-gradient-to-r from-orange-600/10 to-amber-600/10'}`} />
        <div className={`absolute top-1/2 left-1/3 w-64 h-64 rounded-full blur-3xl animate-pulse delay-500 ${theme === 'light' ? 'bg-gradient-to-r from-rose-400/15 to-pink-400/15' : 'bg-gradient-to-r from-rose-600/15 to-pink-600/15'}`} />
        
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className={`absolute w-[1px] h-[1px] rounded-full animate-float ${theme === 'light' ? 'bg-red-800/30' : 'bg-red-300/30'}`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center">


          <div className="relative mb-10">
            <h1 className={`text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 leading-tight tracking-tight ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
              Master Vocabulary
              <span className="block mt-2">
                <span className="relative">
                  <span className="relative z-10 bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 bg-clip-text text-transparent animate-gradient-x">
                    Effortlessly
                  </span>
                  <div className={`absolute -bottom-2 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent animate-pulse ${
                    theme === 'light' ? 'via-red-500/70' : 'via-red-400/50'
                  }`} />
                </span>
              </span>
            </h1>
            
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl">
              <div className={`absolute left-0 top-0 w-32 h-32 rounded-full blur-xl ${
                theme === 'light' 
                  ? 'bg-gradient-to-r from-red-400/10 to-transparent' 
                  : 'bg-gradient-to-r from-red-600/10 to-transparent'
              }`} />
              <div className={`absolute right-0 bottom-0 w-32 h-32 rounded-full blur-xl ${
                theme === 'light'
                  ? 'bg-gradient-to-l from-orange-400/10 to-transparent'
                  : 'bg-gradient-to-l from-orange-600/10 to-transparent'
              }`} />
            </div>
          </div>

          <p className={`text-lg sm:text-xl lg:text-2xl max-w-2xl mx-auto mb-12 leading-relaxed font-light tracking-wide ${
            theme === 'light' ? 'text-gray-600' : 'text-white/70'
          }`}>
            Discover words through immersive learning, receive{' '}
            <span className="relative">
              <span className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                intelligent explanations
              </span>
              <span className={`absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent ${
                theme === 'light' ? 'via-red-500/70' : 'via-red-400/50'
              }`} />
            </span>
            , and accelerate your progress with personalized guidance.
          </p>

 

      
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="flex flex-col items-center gap-2">
          <span className={`text-xs tracking-widest font-medium ${
            theme === 'light' ? 'text-gray-400' : 'text-white/40'
          }`}>
            EXPLORE
          </span>
          <div className={`w-px h-8 bg-gradient-to-b animate-bounce ${
            theme === 'light' 
              ? 'from-red-400 to-transparent' 
              : 'from-red-400/40 to-transparent'
          }`} />
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(120deg); }
          66% { transform: translateY(-5px) rotate(240deg); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
        }
        
        .animate-gradient-x {
          background-size: 300% 300%;
          animation: gradient-x 8s ease infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Hero;
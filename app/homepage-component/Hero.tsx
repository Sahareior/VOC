import { useUser } from '@/contexts/UserContext';
import { SAMPLE_WORDS } from '@/lib/data';
import { Sparkles, ArrowRight, Zap, Brain, Target } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const Hero = () => {
  const { isLearned } = useUser();
  const [isAnimating, setIsAnimating] = useState(false);
  
  const stats = {
    totalWords: SAMPLE_WORDS.length,
    learnedCount: SAMPLE_WORDS.filter(w => isLearned(w.id)).length,
    progress: Math.round((SAMPLE_WORDS.filter(w => isLearned(w.id)).length / SAMPLE_WORDS.length) * 100),
  };

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [stats.learnedCount]);

  return (
    <div className="relative min-h-screen py-16 flex items-center overflow-hidden">
      {/* Elegant Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-950">
        {/* Subtle Grid */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff22 1px, transparent 1px),
                              linear-gradient(to bottom, #ffffff22 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />
        
        {/* Floating Abstract Shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-violet-600/15 to-purple-600/15 rounded-full blur-3xl animate-pulse delay-500" />
        
        {/* Animated Particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-[1px] h-[1px] bg-white rounded-full animate-float"
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

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center">
          {/* Elegant Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-lg rounded-full border border-white/10 mb-8 group hover:bg-white/10 transition-all duration-500 cursor-pointer">
            <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
            <span className="text-sm font-medium text-white/80 tracking-wide">
              AI-Powered Learning Platform
            </span>
            <div className="w-px h-3 bg-white/20 mx-2" />
            <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
              Join 10,000+ learners
            </span>
          </div>

          {/* Main Title */}
          <div className="relative mb-10">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 leading-tight tracking-tight">
              Master Vocabulary
              <span className="block mt-2">
                <span className="relative">
                  <span className="relative z-10 bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent animate-gradient-x">
                    Effortlessly
                  </span>
                  <div className="absolute -bottom-2 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse" />
                </span>
              </span>
            </h1>
            
            {/* Title Decoration */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl">
              <div className="absolute left-0 top-0 w-32 h-32 bg-gradient-to-r from-purple-600/10 to-transparent rounded-full blur-xl" />
              <div className="absolute right-0 bottom-0 w-32 h-32 bg-gradient-to-l from-cyan-600/10 to-transparent rounded-full blur-xl" />
            </div>
          </div>

          {/* Elegant Subtitle */}
          <p className="text-lg sm:text-xl lg:text-2xl text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed font-light tracking-wide">
            Discover words through immersive learning, receive{' '}
            <span className="relative">
              <span className="text-white font-medium">
                intelligent explanations
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
            </span>
            , and accelerate your progress with personalized guidance.
          </p>

          {/* CTA Buttons - Elegant Design */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            {/* Primary Button */}
            <button className="group relative px-10 py-4 rounded-xl overflow-hidden">
              {/* Animated Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 animate-gradient-x" />
              
              {/* Solid Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-600 opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shimmer" />
              </div>
              
              {/* Border Glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-xl blur opacity-0 group-hover:opacity-70 transition-opacity duration-500" />
              
              {/* Content */}
              <div className="relative flex items-center justify-center gap-3 text-white font-semibold tracking-wide">
                <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </button>

            {/* Secondary Button */}
            <button className="group px-10 py-4 bg-transparent text-white font-semibold tracking-wide rounded-xl border border-white/20 hover:border-white/40 transition-all duration-500 backdrop-blur-sm hover:bg-white/5">
              <div className="flex items-center justify-center gap-3">
                <Brain className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="relative">
                  See How It Works
                  <span className="absolute -bottom-1 left-0 right-0 h-[1px] bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </span>
              </div>
            </button>
          </div>

          {/* Feature Highlights - Minimal */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Sparkles, text: 'AI-Powered Insights', color: 'text-cyan-300' },
              { icon: Target, text: 'Personalized Goals', color: 'text-purple-300' },
              { icon: Brain, text: 'Smart Learning', color: 'text-pink-300' },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/5 hover:border-white/10 transition-all duration-500 group"
              >
                <div className={`p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors ${feature.color}`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <span className="text-sm text-white/70 font-medium tracking-wide">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-white/40 tracking-widest font-medium">EXPLORE</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent animate-bounce" />
        </div>
      </div>

      {/* CSS Animations */}
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
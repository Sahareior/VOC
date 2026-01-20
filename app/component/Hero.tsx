import { useUser } from '@/contexts/UserContext';
import { SAMPLE_WORDS } from '@/lib/data';
import { BookOpen, Sparkles, Target, Trophy, ArrowRight, Star, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const Hero = () => {
  const { isLearned, isFavorite, toggleLearned, toggleFavorite } = useUser();
  const [isAnimating, setIsAnimating] = useState(false);
  
  const stats = {
    totalWords: SAMPLE_WORDS.length,
    learnedCount: SAMPLE_WORDS.filter(w => isLearned(w.id)).length,
    streak: 7,
    progress: Math.round((SAMPLE_WORDS.filter(w => isLearned(w.id)).length / SAMPLE_WORDS.length) * 100),
  };

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [stats.learnedCount]);

  const floatingShapes = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    style: {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${i * 0.2}s`,
      opacity: 0.1 + Math.random() * 0.2,
    },
  }));

  return (
    <div className="relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingShapes.map((shape) => (
          <div
            key={shape.id}
            className="absolute w-4 h-4 rounded-full bg-primary-300 dark:bg-primary-700 animate-float"
            style={shape.style}
          />
        ))}
      </div>

      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-accent-400/20 animate-gradient-shift" />
        </div>

        {/* SVG Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,var(--primary-300),transparent_50%),radial-gradient(circle_at_80%_70%,var(--accent-300),transparent_50%)]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="text-center">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-accent-100 dark:from-primary-900/40 dark:to-accent-900/40 rounded-full text-primary-600 dark:text-primary-300 text-sm font-medium mb-6 animate-pulse hover:scale-105 transition-transform duration-300 cursor-pointer group">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              <span className="group-hover:text-primary-700 dark:group-hover:text-primary-200 transition-colors">
                Interactive Vocabulary Learning
              </span>
              <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 translate-x-[-5px] group-hover:translate-x-0 transition-all duration-300" />
            </div>

            {/* Animated Title */}
            <div className="relative mb-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                Master <span className="relative">
                  <span className="relative z-10 bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600 dark:from-primary-400 dark:via-accent-300 dark:to-primary-400 bg-clip-text text-transparent animate-gradient-x">
                    Vocabulary
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 to-accent-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </span>
              </h1>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-700 dark:text-slate-300">
                Like Never Before
              </h2>
            </div>

            {/* Subtitle with Highlight */}
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 text-balance relative">
              <span className="absolute -left-4 top-1/2 transform -translate-y-1/2 text-primary-400">
                ✨
              </span>
              Discover new words through interactive cards, get{' '}
              <span className="font-semibold text-primary-600 dark:text-primary-400 relative">
                AI-powered explanations
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary-400/30" />
              </span>
              , and track your learning journey with personalized progress.
            </p>

            {/* Progress Bar */}
     

            {/* Enhanced Stats Cards */}
     

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button className="group relative px-8 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300 transform hover:-translate-y-0.5">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-400 to-accent-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
                <span className="relative flex items-center justify-center gap-2">
                  Start Learning Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>
              
              <button className="group px-8 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-700 dark:text-slate-300 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-500 transition-all duration-300 hover:shadow-md">
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Try AI Features
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Animated Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto text-white dark:text-slate-950"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="currentColor"
              className="animate-wave"
            />
          </svg>
        </div>
      </section>

      {/* Add to your global CSS or Tailwind config */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes wave {
          0% { transform: translateX(0); }
          50% { transform: translateX(-30px); }
          100% { transform: translateX(0); }
        }
        @keyframes ping-once {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-wave {
          animation: wave 8s ease-in-out infinite;
        }
        .animate-ping-once {
          animation: ping-once 0.5s ease-out;
        }
        .animate-gradient-shift {
          background-size: 400% 400%;
          animation: gradient-x 15s ease infinite;
        }
        .animate-spin-slow {
          animation: spin 4s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Hero;
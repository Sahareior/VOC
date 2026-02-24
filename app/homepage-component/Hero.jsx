'use client';

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Hero = () => {
  const { theme } = useTheme();

  return (
    <section
      className={`py-24 h-[70vh]  border-b ${
        theme === 'light'
          ? 'bg-white text-gray-900 border-gray-200'
          : 'bg-slate-950 text-white border-slate-800'
      }`}
    >
      <div className="max-w-4xl space-y-10 mx-auto px-4 text-center">
        <span className="inline-block mb-4 text-sm font-medium text-red-600">
          Vocabulary Builder
        </span>

        <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
          Master Vocabulary
          <br />
          <span className="text-red-600">Effortlessly</span>
        </h1>

        <p
          className={`text-lg max-w-2xl mx-auto ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-300'
          }`}
        >
          Learn words with clear definitions, real-life examples, and
          structured practice designed to help you remember them for good.
        </p>
      </div>
    </section>
  );
};

export default Hero;

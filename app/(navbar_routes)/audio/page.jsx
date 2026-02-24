'use client';

import React from 'react';
import { Speaker } from 'lucide-react';

export default function AudioPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-full mb-6">
        <Speaker className="w-16 h-16 text-primary-600 dark:text-red-400" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
        Audio Feature
      </h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto">
        This feature is coming soon! You'll be able to listen to vocabulary words and pronunciations here.
      </p>
      <div className="mt-10">
        <button 
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

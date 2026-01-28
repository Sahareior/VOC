import { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthLayout({ 
  children, 
  title, 
  subtitle,
  showBackButton = false 
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <header className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-xl">
          {showBackButton && (
            <Link 
              href="/auth/login" 
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to login
            </Link>
          )}
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-8">
            {children}
          </div>
        </div>
      </main>

      <footer className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} WordMaster. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
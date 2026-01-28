'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, User, Home, Settings, Menu, X, Sun, Moon, HelpCircle, FileQuestion, BookDownIcon  } from 'lucide-react';
import logo from '../../public/logo.png'
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';
import Image from 'next/image';




export function Header({ onOpenHelp }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: User },
    { name: 'Quiz', href: '/quiz', icon: FileQuestion },
    { name: 'Groups', href: '/groups', icon: BookDownIcon  },
  ];

  const isActive = (href) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/10 dark:bg-slate-950/30 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-[#F4C1C4] dark:text-primary-400 hover:opacity-80 transition-opacity"
            >
              <BookOpen className="w-8 h-8 sm:inline-block hidden" />
              <span className="text-xl font-bold  sm:inline-block">
               <Image
  src={logo}
  alt="Logo"
  width={120}
  height={50}
  priority
/>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      active
                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-red-400'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={()=> router.push('/login')}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              aria-label="Help and voice commands"
            >
              Login
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 animate-slide-down">
          <div className="px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
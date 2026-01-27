import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { UserProvider } from '@/contexts/UserContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { VoiceProvider } from '@/contexts/VoiceContext';
import { Header } from '@/components/layout/Header';

import { useState } from 'react';
import VoiceCommand from '@/components/features/VoiceCommand';
import Footer from './homepage-component/Footer';
import ReduxProvider from '@/redux/ReduxProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'VocabFlow - Master Vocabulary with Interactive Learning',
  description: 'A modern vocabulary learning platform with interactive word cards, AI assistance, and voice navigation. Learn new words through engaging visuals, examples, and personalized tracking.',
  keywords: ['vocabulary', 'learning', 'words', 'language', 'education', 'flashcards'],
  authors: [{ name: 'VocabFlow Team' }],
  openGraph: {
    title: 'VocabFlow - Master Vocabulary with Interactive Learning',
    description: 'A modern vocabulary learning platform with interactive word cards, AI assistance, and voice navigation.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VocabFlow - Master Vocabulary',
    description: 'Learn new words through engaging visuals and personalized tracking.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#4f46e5" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider>
          <UserProvider>
            <VoiceProvider>
              <div className="flex flex-col min-h-screen">
                <VoiceCommandHandler />
                <Header />
                <main className="flex-1">
                  <ReduxProvider>{children}</ReduxProvider>
                </main>
                <VoiceCommand />
                <Footer />
              </div>
            </VoiceProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

/**
 * Component to handle voice commands globally
 */
function VoiceCommandHandler() {
  return null;
}

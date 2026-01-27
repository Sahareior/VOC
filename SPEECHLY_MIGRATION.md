# Migration Guide: Web Speech API → Speechly

## Quick Start

### Step 1: Get Your Speechly App ID
1. Go to [https://www.speechly.com/dashboard](https://www.speechly.com/dashboard)
2. Create a free account
3. Create a new app
4. Copy your **App ID**

### Step 2: Create `.env.local`
```bash
# At the root of your project, create .env.local
NEXT_PUBLIC_SPEECHLY_APP_ID=your-app-id-here
```

### Step 3: Update `app/layout.tsx`
Replace your current layout with:

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { UserProvider } from '@/contexts/UserContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SpeechlyProviderWrapper } from '@/components/providers/SpeechlyProvider';
import { VoiceProvider } from '@/contexts/VoiceContext';
import { Header } from '@/components/layout/Header';
import VoiceCommand from '@/components/features/VoiceCommand';
import Footer from './homepage-component/Footer';

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
            <SpeechlyProviderWrapper>
              <VoiceProvider>
                <div className="flex flex-col min-h-screen">
                  <VoiceCommandHandler />
                  <Header />
                  <main className="flex-1">
                    {children}
                  </main>
                  <VoiceCommand />
                  <Footer />
                </div>
              </VoiceProvider>
            </SpeechlyProviderWrapper>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

function VoiceCommandHandler() {
  return null;
}
```

### Step 4: Replace VoiceContext
```bash
# Backup old version
mv contexts/VoiceContext.tsx contexts/VoiceContext-backup.tsx

# Use new Speechly version
mv contexts/VoiceContext-speechly.tsx contexts/VoiceContext.tsx
```

### Step 5: Restart Dev Server
```bash
npm run dev
```

## What's New?

| Feature | Web Speech API | Speechly |
|---------|---|---|
| Accuracy | ~70% | ~95%+ |
| Mobile Support | Fair | Excellent |
| Offline | Yes | No (cloud-based) |
| Cost | Free | Free tier available |
| Latency | Variable | Low & consistent |
| Accents | Limited | Better support |
| Setup | Minimal | Requires App ID |

## Troubleshooting

### "Microphone not working" error
- Check `.env.local` has correct Speechly App ID
- Make sure you're using HTTPS or localhost
- Check browser permissions for microphone

### Commands not recognized
- Speechly works differently - it may need you to speak more clearly
- All existing voice commands still work
- Verify your Speechly app is active

### "No app ID" error
- Create `.env.local` with: `NEXT_PUBLIC_SPEECHLY_APP_ID=your-id`
- Restart dev server
- Clear browser cache

## Reverting Back
If you want to go back to Web Speech API:
```bash
# Restore backup
mv contexts/VoiceContext.tsx contexts/VoiceContext-speechly.tsx
mv contexts/VoiceContext-backup.tsx contexts/VoiceContext.tsx

# Remove SpeechlyProviderWrapper from layout.tsx
```

## Free Tier Limits
- ✅ 10 hours/month
- ✅ Unlimited users
- ✅ All features included
- ✅ Perfect for development

## Support
- Speechly Docs: https://docs.speechly.com/
- React Client Docs: https://docs.speechly.com/client-libraries/react
- Dashboard: https://www.speechly.com/dashboard

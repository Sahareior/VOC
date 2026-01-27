# Speechly Integration Setup

## What Changed?
Your voice system has been migrated from Web Speech API to **@speechly/react-client** for better accuracy and reliability.

## Setup Steps

### 1. Get Speechly App ID
- Go to [https://www.speechly.com/dashboard](https://www.speechly.com/dashboard)
- Sign up (free account available)
- Create a new app
- Copy your App ID

### 2. Configure Environment Variable
Create a `.env.local` file in your project root:

```
NEXT_PUBLIC_SPEECHLY_APP_ID=your-app-id-from-speechly-dashboard
```

### 3. Update Root Layout
Add the Speechly provider to your root layout. Open `app/layout.tsx` and wrap your app:

```tsx
import { SpeechlyProviderWrapper } from '@/components/providers/SpeechlyProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SpeechlyProviderWrapper>
          {/* Your existing providers */}
          {children}
        </SpeechlyProviderWrapper>
      </body>
    </html>
  );
}
```

### 4. Use New VoiceContext
Update your imports to use the new Speechly version:

**Option A: Rename the file** (recommended)
```bash
mv contexts/VoiceContext.tsx contexts/VoiceContext-old.tsx
mv contexts/VoiceContext-speechly.tsx contexts/VoiceContext.tsx
```

**Option B: Keep both and use separately**
- Keep the current implementation as fallback

## Benefits of Speechly

✅ **Better Accuracy** - ML-powered speech recognition
✅ **Lower Latency** - Faster response times
✅ **Mobile Optimized** - Works great on mobile devices
✅ **Cloud Processing** - Doesn't use browser resources
✅ **Better Language Support** - More accurate for various accents
✅ **No Local Processing** - Reduced client-side load

## Voice Commands
All existing voice commands remain the same:
- "next" / "next card"
- "previous" / "back"
- "home" / "dashboard"
- "explain word" / "define word"
- "save word" / "mark learned"
- "read word" / "pronounce"
- And many more!

## Troubleshooting

### Mic not working?
1. Check your `.env.local` has correct App ID
2. Restart the dev server: `npm run dev`
3. Check browser console for errors

### Need to go back?
Simply restore the original VoiceContext:
```bash
mv contexts/VoiceContext.tsx contexts/VoiceContext-speechly.tsx
mv contexts/VoiceContext-old.tsx contexts/VoiceContext.tsx
```

## Speechly Free Tier
- 10 hours/month of voice input
- Perfect for development and testing
- Unlimited users
- No credit card required

Start using it today!

import React from 'react';
import { SpeechProvider } from '@speechly/react-client';

interface SpeechlyProviderWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that initializes Speechly with your app ID
 * Get your app ID from: https://www.speechly.com/dashboard
 */
export function SpeechlyProviderWrapper({ children }: SpeechlyProviderWrapperProps) {
  // Replace with your actual Speechly app ID
  const SPEECHLY_APP_ID = process.env.NEXT_PUBLIC_SPEECHLY_APP_ID || 'your-app-id-here';

  return (
    <SpeechProvider appId={SPEECHLY_APP_ID} language="en-US">
      {children}
    </SpeechProvider>
  );
}

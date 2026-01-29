import './globals.css';

// import { ThemeProvider } from '@/contexts/ThemeContext';
// import { VoiceProvider } from '@/contexts/VoiceContext';
// import { Header } from '@/components/layout/Header';

import Footer from './homepage-component/Footer';
import ReduxProvider from './../redux/ReduxProvider';
import { UserProvider } from './../contexts/UserContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { VoiceProvider } from '../contexts/VoiceContext';
import VoiceCommand from './../components/features/VoiceCommand';
import { Header } from '../components/layout/Header';


export default function RootLayout({
  children,
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#4f46e5" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className="font-sans antialiased min-h-screen flex flex-col"
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
                {/* <VoiceCommand /> */}
                <Footer />
              </div>
            </VoiceProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

function VoiceCommandHandler() {
  return null;
}
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import { AppHeader } from '@/components/AppHeader';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PrivacyProvider } from '@/components/PrivacyProvider';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'meu.pluggy',
  description: 'Visão geral dos seus dados financeiros.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
};

export const viewport = {
  themeColor: '#09090b',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#09090b] text-[#fafafa] font-sans selection:bg-blue-600 selection:text-white">
        <ServiceWorkerRegister />
        <TooltipProvider>
          <PrivacyProvider>
            <Suspense fallback={null}>
              <AppHeader />
            </Suspense>
            <main className="flex-1">
              {children}
            </main>
          </PrivacyProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NotificationCenter } from "@/components/NotificationCenter";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finance Manager",
  description: "Gerenciador financeiro pessoal",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#1e293b",
};

import { Navigation } from '@/components/Navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50">
        <ServiceWorkerRegister />
        <header className="sticky top-0 z-50 w-full border-b bg-white">
          <div className="flex h-16 items-center justify-between px-4 md:px-8">
            <div className="flex items-center">
              <div className="font-bold text-xl text-slate-900 mr-8">FinanceManager</div>
              <Navigation />
            </div>
            <div className="flex items-center gap-4">
              <NotificationCenter />
            </div>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}

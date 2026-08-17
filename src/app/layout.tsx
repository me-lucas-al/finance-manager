import type { Metadata } from "next";
import { Suspense } from "react";
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { AppHeader } from "@/components/AppHeader";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
  themeColor: "#0B1120",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${poppins.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ServiceWorkerRegister />
        <Suspense fallback={null}>
          <AppHeader />
        </Suspense>
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}

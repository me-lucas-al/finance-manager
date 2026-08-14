"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream: unknown }).MSStream
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  if (isStandalone) {
    return null; // Don't show if already installed
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between rounded-lg bg-white p-4 shadow-lg ring-1 ring-slate-900/10 dark:bg-slate-900 dark:ring-white/10 md:bottom-8 md:left-auto md:right-8 md:w-96">
      <div className="flex flex-col">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Instalar Aplicativo</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isIOS
            ? "Para instalar o app no iOS, toque em Compartilhar e selecione 'Adicionar à Tela de Início'."
            : "Adicione este aplicativo à sua tela inicial para acesso rápido e offline."}
        </p>
      </div>
      {!isIOS && deferredPrompt && (
        <Button
          onClick={async () => {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
              setDeferredPrompt(null);
            }
          }}
          className="ml-4 shrink-0"
        >
          Instalar
        </Button>
      )}
    </div>
  );
}

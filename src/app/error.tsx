"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorState({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] p-8 bg-background">
      <div className="max-w-md w-full flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Algo deu errado!</h2>
          <p className="text-muted-foreground">
            Encontramos um problema inesperado ao carregar esta página.
          </p>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => router.push('/')}>
            Ir para Dashboard
          </Button>
          <Button variant="outline" onClick={() => reset()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    </div>
  );
}

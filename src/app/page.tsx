import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black p-4">
      <main className="flex flex-col items-center text-center max-w-lg w-full gap-8">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Finance Manager
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Gerencie suas finanças de forma simples e segura.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Cadastrar</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

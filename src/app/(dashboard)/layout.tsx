import { NotificationBell } from '@/components/notifications/NotificationBell';
import { MobileNav } from '@/components/layout/mobile-nav';
import Link from 'next/link';

export const dynamic = 'force-dynamic';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black">
      <header className="sticky top-0 z-10 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex h-16 items-center px-4 md:px-8 justify-between">
          <Link href="/dashboard" className="font-bold text-xl tracking-tight text-zinc-900 dark:text-white">
            Finance Manager
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-4">
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary">Dashboard</Link>
              <Link href="/expenses" className="text-sm font-medium hover:text-primary">Despesas</Link>
              <Link href="/incomes" className="text-sm font-medium hover:text-primary">Receitas</Link>
              <Link href="/investments" className="text-sm font-medium hover:text-primary">Investimentos</Link>
              <Link href="/reports" className="text-sm font-medium hover:text-primary">Relatórios</Link>
              <Link href="/calendar" className="text-sm font-medium hover:text-primary">Calendário</Link>
              <Link href="/settings" className="text-sm font-medium hover:text-primary">Configurações</Link>
            </nav>
            <NotificationBell />
            <MobileNav />
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { Menu } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Overview' },
  { href: '/movements', label: 'Fluxo' },
  { href: '/ativos', label: 'Ativos' },
  { href: '/connections', label: 'Conexões' },
];

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile Nav Button */}
      <div className="md:hidden flex items-center">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-400 hover:bg-zinc-800 hover:text-white h-9 w-9"
              />
            }
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] bg-[#09090b] border-zinc-800 text-zinc-200">
            <div className="flex flex-col space-y-4 py-4">
              <Logo className="mb-4 px-2" />
              <div className="flex flex-col space-y-1">
                {navLinks.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        active
                          ? 'bg-zinc-800 text-white font-semibold'
                          : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Nav - Clean Pill Tabs */}
      <nav className="hidden md:flex items-center space-x-1.5 text-sm font-medium">
        {navLinks.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-150 ${
                active
                  ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/periods", label: "Calendário" },
  { href: "/incomes", label: "Receitas" },
  { href: "/expenses", label: "Despesas" },
  { href: "/investments", label: "Investimentos" },
  { href: "/analytics", label: "Análises" },
  { href: "/reports", label: "Relatórios" },
  { href: "/settings", label: "Configurações" },
];

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Nav */}
      <div className="md:hidden flex items-center">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <div className="flex flex-col space-y-4 py-4">
              <div className="font-bold text-xl text-foreground mb-4 px-2">FinanceManager</div>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`px-2 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    pathname === link.href
                      ? "bg-muted text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`transition-colors hover:text-foreground ${
              pathname === link.href ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  );
}

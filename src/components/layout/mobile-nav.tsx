"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const routes = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/expenses", label: "Despesas" },
  { href: "/incomes", label: "Receitas" },
  { href: "/investments", label: "Investimentos" },
  { href: "/reports", label: "Relatórios" },
  { href: "/calendar", label: "Calendário" },
  { href: "/settings", label: "Configurações" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col gap-4 mt-8">
          {routes.map((route) => {
            const isActive = pathname === route.href;
            return (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setOpen(false)}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary font-semibold" : "text-muted-foreground"
                }`}
              >
                {route.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

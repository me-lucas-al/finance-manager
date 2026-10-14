import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

interface OverviewCardLinkLabelProps {
  icon: ReactNode;
  children: string;
  href: string;
}

export function OverviewCardLinkLabel({ icon, children, href }: OverviewCardLinkLabelProps) {
  return (
    <Link
      href={href}
      className="group/label inline-flex items-center gap-2 rounded text-zinc-400 text-xs font-semibold uppercase tracking-wider outline-none transition-colors hover:text-white focus-visible:ring-1 focus-visible:ring-blue-500"
    >
      {icon}
      <span>{children}</span>
      <ChevronRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover/label:translate-x-0.5" />
    </Link>
  );
}

import type { ReactNode } from 'react';
import Link from 'next/link';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface HeaderMenuLinkProps {
  href: string;
  icon: ReactNode;
  label: string;
}

export function HeaderMenuLink({ href, icon, label }: HeaderMenuLinkProps) {
  return (
    <DropdownMenuItem
      render={
        <Link
          href={href}
          className="flex items-center gap-2.5 cursor-pointer w-full text-xs hover:bg-zinc-800 hover:text-white py-2 px-3 rounded-md transition"
        />
      }
    >
      {icon}
      <span>{label}</span>
    </DropdownMenuItem>
  );
}

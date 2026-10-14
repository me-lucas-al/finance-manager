import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export type CarouselStep = {
  title: string;
  description: string;
  icon: LucideIcon;
  content?: ReactNode;
};

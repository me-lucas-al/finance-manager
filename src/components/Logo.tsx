import { cn } from '@/lib/utils';

/**
 * Custom monogram: an "F" drawn as a single monoline stroke whose two arms
 * kick upward, so the letterform itself reads as a rising trend line.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn('h-8 w-8 shrink-0', className)}
      role="img"
      aria-label="Finance Manager"
    >
      <rect x="4" y="4" width="92" height="92" rx="22" fill="#0B1220" />
      <path
        d="M38,79 L38,23 L63,23 L77,10"
        fill="none"
        stroke="#F6F7FB"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M38,52 L58,52 L70,41"
        fill="none"
        stroke="#4C86F7"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    // Wordmark has no color of its own — it inherits from the caller's text color.
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark className={markClassName} />
      <span className="font-heading text-lg font-semibold italic tracking-tight">
        Finance Manager
      </span>
    </div>
  );
}

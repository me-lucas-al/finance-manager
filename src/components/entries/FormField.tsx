import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
};

export function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs text-zinc-400">
        {label}
      </Label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PasswordInputProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  toggleLabelShow?: string;
  toggleLabelHide?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, toggleLabelShow = 'Mostrar senha', toggleLabelHide = 'Ocultar senha', ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="relative w-full flex items-center">
        <Input
          type={showPassword ? 'text' : 'password'}
          className={cn('pr-9', className)}
          ref={ref}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute right-1.5 h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={() => setShowPassword((prev) => !prev)}
          tabIndex={-1}
          aria-label={showPassword ? toggleLabelHide : toggleLabelShow}
          title={showPassword ? toggleLabelHide : toggleLabelShow}
        >
          {showPassword ? (
            <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </Button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };

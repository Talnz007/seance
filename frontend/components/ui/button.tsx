import * as React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-950',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          
          // Variant styles
          variant === 'primary' && [
            'bg-purple-600 text-white',
            'hover:bg-purple-700',
            'active:bg-purple-800'
          ],
          variant === 'secondary' && [
            'bg-slate-800 text-slate-100 border border-purple-500/30',
            'hover:bg-slate-700 hover:border-purple-500/50',
            'active:bg-slate-600'
          ],
          variant === 'ghost' && [
            'bg-transparent text-slate-300',
            'hover:bg-slate-800/50 hover:text-slate-100',
            'active:bg-slate-700/50'
          ],
          
          // Size styles
          size === 'sm' && 'px-3 py-1.5 text-sm',
          size === 'md' && 'px-4 py-2 text-base',
          size === 'lg' && 'px-6 py-3 text-lg',
          
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

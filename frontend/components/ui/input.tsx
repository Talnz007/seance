import * as React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-200 mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            // Base styles
            'w-full rounded-lg px-4 py-2 text-base',
            'bg-slate-900 text-slate-100',
            'border transition-all duration-200',
            'placeholder:text-slate-500',
            
            // Focus states
            'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-950',
            
            // Error states
            error
              ? 'border-red-500 focus:border-red-500'
              : 'border-purple-500/30 focus:border-purple-500',
            
            // Disabled state
            'disabled:opacity-50 disabled:cursor-not-allowed',
            
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

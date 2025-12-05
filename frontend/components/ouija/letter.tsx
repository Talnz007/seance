// Individual letter component for Ouija board

import { memo, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface LetterProps {
  value: string;
  isActive?: boolean;
  onClick?: (value: string) => void;
  className?: string;
}

export const Letter: React.FC<LetterProps> = memo(({
  value,
  isActive = false,
  onClick,
  className,
}) => {
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(value);
    }
  }, [onClick, value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick(value);
    }
  }, [onClick, value]);

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        'w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14',
        'rounded-full',
        'border-2 border-purple-500/30',
        'bg-slate-900/50',
        'text-slate-100 font-semibold text-sm md:text-base lg:text-lg',
        'transition-all duration-300',
        'cursor-pointer select-none',
        // Hover effects
        'hover:border-purple-400/50 hover:bg-slate-800/60 hover:scale-110',
        // Active state with glow
        isActive && [
          'border-purple-400',
          'bg-purple-900/40',
          'scale-110',
          'shadow-[0_0_20px_rgba(168,85,247,0.6)]',
          'text-purple-100',
        ],
        // Focus state for accessibility
        'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-950',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? 'button' : 'presentation'}
      aria-label={`Letter ${value}`}
      aria-pressed={isActive}
    >
      {value}
    </div>
  );
});

Letter.displayName = 'Letter';

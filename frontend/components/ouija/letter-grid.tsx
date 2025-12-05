// Letter grid layout for Ouija board

import { memo } from 'react';
import { Letter } from './letter';
import { cn } from '@/lib/utils';

interface LetterGridProps {
  activeLetter?: string | null;
  onLetterClick?: (letter: string) => void;
  className?: string;
}

// Define letter groups
const TOP_ARC = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
const MIDDLE_ARC = ['N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const BOTTOM_ROW = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export const LetterGrid = memo<LetterGridProps>(({
  activeLetter = null,
  onLetterClick,
  className,
}) => {
  return (
    <div
      className={cn(
        'relative w-full max-w-4xl mx-auto',
        'flex flex-col items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6',
        'p-2 sm:p-3 md:p-4 lg:p-6',
        className
      )}
      role="region"
      aria-label="Ouija board letter grid"
    >
      {/* YES - Left side */}
      <div className="absolute left-0 sm:left-2 md:left-4 top-1/3 -translate-y-1/2">
        <Letter
          value="YES"
          isActive={activeLetter === 'YES'}
          onClick={onLetterClick}
          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 text-xs sm:text-sm md:text-base text-emerald-400 border-emerald-500/30 hover:border-emerald-400/50"
        />
      </div>

      {/* NO - Right side */}
      <div className="absolute right-0 sm:right-2 md:right-4 top-1/3 -translate-y-1/2">
        <Letter
          value="NO"
          isActive={activeLetter === 'NO'}
          onClick={onLetterClick}
          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 text-xs sm:text-sm md:text-base text-red-400 border-red-500/30 hover:border-red-400/50"
        />
      </div>

      {/* Top arc: A-M */}
      <div className="flex justify-center items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 flex-wrap max-w-3xl px-12 sm:px-14 md:px-16 lg:px-20">
        {TOP_ARC.map((letter) => (
          <Letter
            key={letter}
            value={letter}
            isActive={activeLetter === letter}
            onClick={onLetterClick}
            className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 text-xs sm:text-sm md:text-base"
          />
        ))}
      </div>

      {/* Middle arc: N-Z */}
      <div className="flex justify-center items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 flex-wrap max-w-3xl px-12 sm:px-14 md:px-16 lg:px-20">
        {MIDDLE_ARC.map((letter) => (
          <Letter
            key={letter}
            value={letter}
            isActive={activeLetter === letter}
            onClick={onLetterClick}
            className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 text-xs sm:text-sm md:text-base"
          />
        ))}
      </div>

      {/* Bottom row: 0-9 */}
      <div className="flex justify-center items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 flex-wrap px-12 sm:px-14 md:px-16 lg:px-20">
        {BOTTOM_ROW.map((number) => (
          <Letter
            key={number}
            value={number}
            isActive={activeLetter === number}
            onClick={onLetterClick}
            className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 text-xs sm:text-sm md:text-base"
          />
        ))}
      </div>

      {/* GOODBYE - Center bottom */}
      <div className="mt-2 sm:mt-3 md:mt-4">
        <Letter
          value="GOODBYE"
          isActive={activeLetter === 'GOODBYE'}
          onClick={onLetterClick}
          className="w-20 h-10 sm:w-24 sm:h-12 md:w-28 md:h-14 text-xs sm:text-sm md:text-base rounded-full px-3 sm:px-4"
        />
      </div>
    </div>
  );
});

LetterGrid.displayName = 'LetterGrid';

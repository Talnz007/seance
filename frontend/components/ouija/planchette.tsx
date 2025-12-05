// Animated planchette pointer for Ouija board

'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PlanchetteProps {
  targetLetter?: string | null;
  isAnimating?: boolean;
  letterTimings?: number[];
  onAnimationComplete?: () => void;
  className?: string;
}

// Calculate position for each letter on the board
// This is a simplified version - in production, you'd calculate actual positions
// based on the LetterGrid layout
const getLetterPosition = (letter: string | null): { x: number; y: number } => {
  if (!letter) return { x: 0, y: 0 };

  // Define approximate positions for letters (relative to center)
  // These would need to be calculated dynamically based on actual letter positions
  const positions: Record<string, { x: number; y: number }> = {
    // Top arc: A-M
    'A': { x: -300, y: -100 },
    'B': { x: -250, y: -100 },
    'C': { x: -200, y: -100 },
    'D': { x: -150, y: -100 },
    'E': { x: -100, y: -100 },
    'F': { x: -50, y: -100 },
    'G': { x: 0, y: -100 },
    'H': { x: 50, y: -100 },
    'I': { x: 100, y: -100 },
    'J': { x: 150, y: -100 },
    'K': { x: 200, y: -100 },
    'L': { x: 250, y: -100 },
    'M': { x: 300, y: -100 },

    // Middle arc: N-Z
    'N': { x: -300, y: 0 },
    'O': { x: -250, y: 0 },
    'P': { x: -200, y: 0 },
    'Q': { x: -150, y: 0 },
    'R': { x: -100, y: 0 },
    'S': { x: -50, y: 0 },
    'T': { x: 0, y: 0 },
    'U': { x: 50, y: 0 },
    'V': { x: 100, y: 0 },
    'W': { x: 150, y: 0 },
    'X': { x: 200, y: 0 },
    'Y': { x: 250, y: 0 },
    'Z': { x: 300, y: 0 },

    // Bottom row: 0-9
    '0': { x: -225, y: 100 },
    '1': { x: -175, y: 100 },
    '2': { x: -125, y: 100 },
    '3': { x: -75, y: 100 },
    '4': { x: -25, y: 100 },
    '5': { x: 25, y: 100 },
    '6': { x: 75, y: 100 },
    '7': { x: 125, y: 100 },
    '8': { x: 175, y: 100 },
    '9': { x: 225, y: 100 },

    // Special positions
    'YES': { x: -400, y: -50 },
    'NO': { x: 400, y: -50 },
    'GOODBYE': { x: 0, y: 150 },
  };

  return positions[letter] || { x: 0, y: 0 };
};

export const Planchette: React.FC<PlanchetteProps> = memo(({
  targetLetter = null,
  isAnimating = false,
  letterTimings = [],
  onAnimationComplete,
  className,
}) => {
  const targetPosition = useMemo(() => getLetterPosition(targetLetter), [targetLetter]);

  return (
    <motion.div
      className={cn(
        'absolute top-1/2 left-1/2',
        'w-16 h-16 md:w-20 md:h-20',
        'pointer-events-none',
        'z-10',
        'will-change-transform',
        className
      )}
      initial={{ x: -32, y: -32, scale: 1, opacity: 0.8 }}
      animate={{
        x: targetPosition.x - 32,
        y: targetPosition.y - 32,
        scale: isAnimating ? 1.1 : 1,
        opacity: isAnimating ? 1 : 0.8,
      }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 20,
        duration: letterTimings[0] ? letterTimings[0] / 1000 : 0.5,
      }}
      onAnimationComplete={onAnimationComplete}
      role="presentation"
      aria-label="Planchette pointer"
    >
      {/* Planchette Image */}
      <div
        className={cn(
          'relative w-full h-full',
          'transition-shadow duration-300',
          isAnimating && 'drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]'
        )}
      >
        <img
          src="/images/planchette.png"
          alt="Planchette"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Glow effect when animating */}
      {isAnimating && (
        <motion.div
          className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  );
});

Planchette.displayName = 'Planchette';

// Main Ouija board container component

'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { LetterGrid } from './letter-grid';
import { Planchette } from './planchette';
import { MessageInput } from './message-input';
import { useSessionStore } from '@/stores/session-store';
import { cn } from '@/lib/utils';
import { soundManager } from '@/lib/audio/sound-manager';
import { webSpeechTTS } from '@/lib/audio/tts';

interface OuijaBoardProps {
  sessionId: string;
  onSendMessage: (message: string) => Promise<boolean>;
  className?: string;
}

export const OuijaBoard = memo<OuijaBoardProps>(({
  sessionId,
  onSendMessage,
  className,
}) => {
  const { messages, isRevealing } = useSessionStore();
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [revealIndex, setRevealIndex] = useState(0);
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [letterTimings, setLetterTimings] = useState<number[]>([]);

  // Get the latest spirit message
  const latestSpiritMessage = messages
    .filter((msg) => msg.type === 'spirit')
    .slice(-1)[0];

  // Initialize audio on first interaction
  useEffect(() => {
    const initAudio = () => {
      soundManager.startAmbient();
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };

    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);

    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
      soundManager.stopAmbient();
    };
  }, []);

  // Start letter-by-letter reveal animation when new spirit message arrives
  useEffect(() => {
    if (!latestSpiritMessage || !isRevealing) {
      if (isAnimating) {
        // Animation was running but stopped/cancelled
        setIsAnimating(false);
        setCurrentLetter(null);
        setRevealIndex(0);
        setCurrentMessage(null);
        soundManager.spiritDeparted();
      }
      return;
    }

    // Check if this is a new message
    if (currentMessage === latestSpiritMessage.message) {
      return;
    }

    // Start new animation
    setCurrentMessage(latestSpiritMessage.message);
    setLetterTimings(latestSpiritMessage.letter_timings || []);
    setRevealIndex(0);
    setIsAnimating(true);

    // Audio triggers
    soundManager.spiritArrives();
    // TTS disabled - Edge TTS not reliable on cloud hosting
    // webSpeechTTS.speak(latestSpiritMessage.message).catch(console.error);

  }, [latestSpiritMessage, isRevealing, currentMessage, isAnimating]);

  // Animate through letters
  useEffect(() => {
    if (!isAnimating || !currentMessage) {
      return;
    }

    // Check if we've revealed all letters
    if (revealIndex >= currentMessage.length) {
      // Animation complete
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setCurrentLetter(null);
        setRevealIndex(0);
        soundManager.spiritDeparted();
      }, 1000); // Hold on last letter for 1 second

      return () => clearTimeout(timer);
    }

    // Get current letter and timing
    const letter = currentMessage[revealIndex].toUpperCase();
    const timing = letterTimings[revealIndex] || 200; // Default 200ms

    // Set current letter
    setCurrentLetter(letter === ' ' ? null : letter);

    // Play sound effects
    if (letter !== ' ') {
      soundManager.planchetteMove();
      // Slight delay for the "click" of hitting the letter
      setTimeout(() => soundManager.play('letter-select'), timing * 0.8);
    }

    // Move to next letter after timing delay
    const timer = setTimeout(() => {
      setRevealIndex((prev) => prev + 1);
    }, timing);

    return () => clearTimeout(timer);
  }, [isAnimating, currentMessage, revealIndex, letterTimings]);

  const handleSendMessage = useCallback(
    async (message: string) => {
      const success = await onSendMessage(message);
      if (!success) {
        console.error('Failed to send message');
        // Error is already displayed in the header via connectionError
      }
    },
    [onSendMessage]
  );

  const handleLetterClick = useCallback((letter: string) => {
    // Optional: Allow manual letter selection for testing
    console.log('Letter clicked:', letter);
  }, []);

  return (
    <div
      className={cn(
        'relative w-full max-w-4xl mx-auto',
        'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950',
        'border border-purple-500/20 rounded-lg sm:rounded-xl md:rounded-2xl',
        'p-3 sm:p-4 md:p-6 lg:p-8',
        'shadow-2xl shadow-purple-500/10',
        className
      )}
      role="region"
      aria-label="Ouija board interface"
    >
      {/* Background Board Image */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <img
          src="/images/ouija-board.png"
          alt="Ouija Board"
          className="w-full h-full object-contain opacity-90"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 space-y-4 sm:space-y-6 md:space-y-8 h-full flex flex-col justify-between">
        {/* Letter grid overlay - invisible but functional for clicks if needed, 
            or we might need to map the image coordinates to letters. 
            For now, keeping the grid but making it invisible/overlay to match positions 
            might be tricky without calibration. 
            
            Actually, if the user provided a board image, the letters are ON the image.
            We shouldn't render the LetterGrid text anymore, but we still need the 
            Planchette to move to the right coordinates.
            
            Let's assume standard layout or just overlay the planchette on top.
            We will hide the LetterGrid visual but keep it for layout/click detection if needed,
            OR just rely on the Planchette moving.
            
            Wait, if the letters are on the image, my LetterGrid component which renders text
            will duplicate them. I should probably hide the LetterGrid visuals but keep the 
            coordinate system, OR just use the Planchette.
            
            Let's try to keep the LetterGrid but make it transparent so we can use its 
            layout for the planchette targets? No, the image letters won't match the CSS grid.
            
            The user said "use a ouija board png".
            I will render the image. I will render the Planchette.
            I will hide the LetterGrid's visible text but I need to know WHERE the letters are.
            
            Since I can't easily map the image coordinates without manual calibration,
            I will keep the LetterGrid for now but maybe reduce its opacity or blend it,
            OR just assume the user wants the visual board and I'll have to guess positions.
            
            Actually, the Planchette component uses `targetLetter` which likely relies on 
            `LetterGrid` or fixed positions. Let's check Planchette.
        */}

        <div className="relative min-h-[300px] sm:min-h-[350px] md:min-h-[400px] lg:min-h-[450px] flex items-center justify-center">
          {/* 
              We overlay the Planchette. 
              The LetterGrid is problematic if it doesn't align with the image.
              For this step, I will render the image and the Planchette.
              I'll keep the LetterGrid but make it opacity-0 so it doesn't clash visually,
              but the Planchette needs to know where to go.
              
              If Planchette calculates position based on DOM elements of letters, 
              we need LetterGrid to exist in the DOM.
          */}
          <div className="absolute inset-0">
            {/* This container holds the invisible grid for coordinate mapping */}
            <LetterGrid
              activeLetter={currentLetter}
              onLetterClick={handleLetterClick}
              className="opacity-0 w-full h-full"
            />
          </div>

          <Planchette
            targetLetter={currentLetter}
            isAnimating={isAnimating}
            letterTimings={letterTimings}
          />
        </div>

        {/* Message input */}
        <div className="pt-3 sm:pt-4 border-t border-purple-500/20">
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={isRevealing}
          />
        </div>

        {/* Status indicator with aria-live for screen readers */}
        <div
          className="text-center"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {isRevealing && (
            <p className="text-xs sm:text-sm text-purple-400 animate-pulse">
              The spirit is revealing its message...
            </p>
          )}
          {currentMessage && !isRevealing && (
            <p className="sr-only">
              Spirit message complete: {currentMessage}
            </p>
          )}
        </div>
      </div>

      {/* Ambient glow effect */}
      <div
        className={cn(
          'absolute inset-0 rounded-lg sm:rounded-xl md:rounded-2xl pointer-events-none',
          'transition-opacity duration-1000',
          isAnimating ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          boxShadow: '0 0 40px rgba(168, 85, 247, 0.3) inset',
        }}
      />
    </div>
  );
});

OuijaBoard.displayName = 'OuijaBoard';

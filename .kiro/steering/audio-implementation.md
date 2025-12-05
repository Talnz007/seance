---
inclusion: fileMatch
fileMatchPattern: "**/audio/**/*,**/tts/**/*,**/sound/**/*"
---

# Audio Implementation Guidelines

## Overview

Séance uses a multi-layered audio system combining Text-to-Speech (TTS), spatial stereo audio, and ambient sound effects to create an immersive supernatural experience.

**Key Components:**
1. ElevenLabs TTS for spirit voice
2. Web Audio API for stereo positioning
3. Howler.js for sound effects
4. Audio synchronization with letter-by-letter text reveal

## Text-to-Speech (TTS)

### ElevenLabs Integration

#### Backend TTS Service
```python
# app/services/tts_service.py

import httpx
from typing import Optional
import hashlib
import os
from pathlib import Path

class TTSService:
    """Service for generating Text-to-Speech audio using ElevenLabs."""
    
    def __init__(self):
        self.api_key = os.getenv("ELEVENLABS_API_KEY")
        self.voice_id = os.getenv("ELEVENLABS_VOICE_ID", "ghost-voice-preset")
        self.base_url = "https://api.elevenlabs.io/v1"
        self.cache_dir = Path("audio_cache")
        self.cache_dir.mkdir(exist_ok=True)
    
    async def generate_speech(
        self,
        text: str,
        cache: bool = True
    ) -> tuple[bytes, float]:
        """Generate TTS audio and return audio bytes + duration.
        
        Args:
            text: Text to convert to speech
            cache: Whether to cache the audio
            
        Returns:
            Tuple of (audio_bytes, duration_seconds)
        """
        # Check cache first
        if cache:
            cached_audio = self._get_from_cache(text)
            if cached_audio:
                return cached_audio
        
        # Call ElevenLabs API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/text-to-speech/{self.voice_id}",
                headers={
                    "xi-api-key": self.api_key,
                    "Content-Type": "application/json"
                },
                json={
                    "text": text,
                    "model_id": "eleven_monolingual_v1",
                    "voice_settings": {
                        "stability": 0.3,          # Lower = more variation (spooky)
                        "similarity_boost": 0.7,   # Voice consistency
                        "style": 0.5,              # Expressiveness
                        "use_speaker_boost": True
                    }
                },
                timeout=30.0
            )
            
            response.raise_for_status()
            audio_bytes = response.content
        
        # Get duration from audio
        duration = self._get_audio_duration(audio_bytes)
        
        # Cache if enabled
        if cache:
            self._save_to_cache(text, audio_bytes, duration)
        
        return audio_bytes, duration
    
    def _get_from_cache(self, text: str) -> Optional[tuple[bytes, float]]:
        """Retrieve cached audio if available."""
        cache_key = hashlib.md5(text.encode()).hexdigest()
        audio_path = self.cache_dir / f"{cache_key}.mp3"
        meta_path = self.cache_dir / f"{cache_key}.meta"
        
        if audio_path.exists() and meta_path.exists():
            audio_bytes = audio_path.read_bytes()
            duration = float(meta_path.read_text())
            return audio_bytes, duration
        
        return None
    
    def _save_to_cache(self, text: str, audio_bytes: bytes, duration: float):
        """Save audio to cache."""
        cache_key = hashlib.md5(text.encode()).hexdigest()
        audio_path = self.cache_dir / f"{cache_key}.mp3"
        meta_path = self.cache_dir / f"{cache_key}.meta"
        
        audio_path.write_bytes(audio_bytes)
        meta_path.write_text(str(duration))
    
    def _get_audio_duration(self, audio_bytes: bytes) -> float:
        """Extract duration from audio bytes using pydub."""
        from pydub import AudioSegment
        from io import BytesIO
        
        audio = AudioSegment.from_file(BytesIO(audio_bytes), format="mp3")
        return len(audio) / 1000.0  # Convert ms to seconds
```

#### Voice Configuration

**Voice Selection:**
- Use ElevenLabs "ghost" or "mysterious" preset
- Alternative: Create custom voice with deep, ethereal qualities

**Voice Settings:**
```json
{
  "stability": 0.3,           // 0.2-0.4 for spooky variation
  "similarity_boost": 0.7,    // 0.6-0.8 for consistency
  "style": 0.5,               // 0.4-0.6 for expressiveness
  "use_speaker_boost": true   // Enhance voice clarity
}
```

**Why these settings:**
- **Low stability (0.3)**: Creates unpredictable variations = spookier
- **High similarity (0.7)**: Maintains character consistency
- **Medium style (0.5)**: Balanced expressiveness without overacting

### Alternative: Web Speech API (Free Fallback)

```typescript
// lib/web-speech-tts.ts

export class WebSpeechTTS {
  private synth: SpeechSynthesis;
  
  constructor() {
    this.synth = window.speechSynthesis;
  }
  
  speak(text: string, options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure for spooky effect
      utterance.rate = options?.rate || 0.8;    // Slower = spookier
      utterance.pitch = options?.pitch || 0.7;  // Lower = more ominous
      utterance.volume = options?.volume || 0.8;
      
      // Try to find a good voice
      const voices = this.synth.getVoices();
      const preferredVoice = voices.find(v => 
        v.name.includes('Male') || v.name.includes('Deep')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);
      
      this.synth.speak(utterance);
    });
  }
  
  cancel() {
    this.synth.cancel();
  }
}
```

## Web Audio API

### Audio Engine Setup

```typescript
// lib/audio-engine.ts

export class AudioEngine {
  private context: AudioContext;
  private masterGain: GainNode;
  private analyser: AnalyserNode;
  
  constructor() {
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create audio graph
    this.masterGain = this.context.createGain();
    this.analyser = this.context.createAnalyser();
    
    // Connect nodes
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.context.destination);
    
    // Configure
    this.masterGain.gain.value = 0.7;  // Default volume
    this.analyser.fftSize = 2048;
  }
  
  async playTTS(
    audioData: ArrayBuffer,
    options?: {
      position?: StereoPosition;
      onProgress?: (progress: number) => void;
      onComplete?: () => void;
    }
  ): Promise<AudioBufferSourceNode> {
    // Decode audio data
    const audioBuffer = await this.context.decodeAudioData(audioData);
    
    // Create source
    const source = this.context.createBufferSource();
    source.buffer = audioBuffer;
    
    // Create panner for spatial audio
    const panner = this.context.createStereoPanner();
    
    // Set position (default: center)
    const position = options?.position || { x: 0 };
    panner.pan.value = position.x;
    
    // Connect audio graph
    source.connect(panner);
    panner.connect(this.masterGain);
    
    // Track progress
    if (options?.onProgress) {
      this.trackProgress(source, audioBuffer.duration, options.onProgress);
    }
    
    // Handle completion
    source.onended = () => {
      source.disconnect();
      panner.disconnect();
      options?.onComplete?.();
    };
    
    // Start playback
    source.start(0);
    
    return source;
  }
  
  private trackProgress(
    source: AudioBufferSourceNode,
    duration: number,
    callback: (progress: number) => void
  ) {
    const startTime = this.context.currentTime;
    
    const updateProgress = () => {
      const elapsed = this.context.currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      callback(progress);
      
      if (progress < 1) {
        requestAnimationFrame(updateProgress);
      }
    };
    
    requestAnimationFrame(updateProgress);
  }
  
  setVolume(volume: number) {
    this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
  }
  
  getVolume(): number {
    return this.masterGain.gain.value;
  }
  
  // Resume context (required after user interaction)
  async resume() {
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
  }
}
```

### Stereo Positioning

```typescript
// types/audio.ts

export interface StereoPosition {
  x: number;  // -1 (full left) to 1 (full right)
}

export const AUDIO_POSITIONS = {
  // Spirit positions (centered, slightly front)
  SPIRIT_CENTER: { x: 0 },
  SPIRIT_LEFT: { x: -0.3 },
  SPIRIT_RIGHT: { x: 0.3 },
  
  // User positions (spread around)
  USER_FAR_LEFT: { x: -0.9 },
  USER_LEFT: { x: -0.6 },
  USER_CENTER_LEFT: { x: -0.3 },
  USER_CENTER: { x: 0 },
  USER_CENTER_RIGHT: { x: 0.3 },
  USER_RIGHT: { x: 0.6 },
  USER_FAR_RIGHT: { x: 0.9 },
  
  // Ambient effects
  AMBIENT_LEFT: { x: -0.5 },
  AMBIENT_RIGHT: { x: 0.5 },
} as const;
```

```typescript
// lib/spatial-audio.ts

export class SpatialAudioManager {
  private audioEngine: AudioEngine;
  
  constructor(audioEngine: AudioEngine) {
    this.audioEngine = audioEngine;
  }
  
  getSpiritPosition(): StereoPosition {
    // Spirit always speaks from center
    return AUDIO_POSITIONS.SPIRIT_CENTER;
  }
  
  getUserPosition(userIndex: number, totalUsers: number): StereoPosition {
    // Distribute users around the board
    if (totalUsers === 1) return AUDIO_POSITIONS.USER_CENTER;
    
    const positions = [
      AUDIO_POSITIONS.USER_FAR_LEFT,
      AUDIO_POSITIONS.USER_LEFT,
      AUDIO_POSITIONS.USER_CENTER_LEFT,
      AUDIO_POSITIONS.USER_CENTER,
      AUDIO_POSITIONS.USER_CENTER_RIGHT,
      AUDIO_POSITIONS.USER_RIGHT,
      AUDIO_POSITIONS.USER_FAR_RIGHT,
    ];
    
    // Map user index to position
    const step = Math.max(1, Math.floor(positions.length / totalUsers));
    const positionIndex = Math.min(userIndex * step, positions.length - 1);
    
    return positions[positionIndex];
  }
  
  getAmbientPosition(side: 'left' | 'right'): StereoPosition {
    return side === 'left' 
      ? AUDIO_POSITIONS.AMBIENT_LEFT 
      : AUDIO_POSITIONS.AMBIENT_RIGHT;
  }
}
```

## Sound Effects

### Sound Library Organization

```
public/sounds/
├── ambient/
│   ├── drone.mp3              # Continuous low frequency (60s loop)
│   ├── wind-subtle.mp3        # Occasional wind (15s)
│   ├── distant-whisper.mp3    # Faint whispers (8s)
│   └── room-tone.mp3          # Background ambience (30s loop)
│
├── interactions/
│   ├── planchette-move.mp3    # Wood scraping sound (0.5s)
│   ├── letter-select.mp3      # Subtle click (0.2s)
│   ├── message-send.mp3       # Whoosh sound (0.8s)
│   └── typing.mp3             # Keyboard typing (0.3s)
│
├── spirit/
│   ├── arrival.mp3            # Spirit appears (2s)
│   ├── departure.mp3          # Spirit leaves (2s)
│   ├── thinking.mp3           # Processing/contemplating (1s loop)
│   └── emphasis.mp3           # Dramatic emphasis (1s)
│
└── candles/
    ├── flicker-1.mp3          # Candle flicker variation 1 (0.5s)
    ├── flicker-2.mp3          # Candle flicker variation 2 (0.5s)
    ├── flicker-3.mp3          # Candle flicker variation 3 (0.5s)
    └── crackle.mp3            # Candle crackle (0.8s)
```

### Sound Manager Implementation

```typescript
// lib/sound-manager.ts

import { Howl, Howler } from 'howler';

export class SoundManager {
  private sounds: Map<string, Howl> = new Map();
  private ambientLayers: Howl[] = [];
  private enabled: boolean = true;
  
  constructor() {
    this.loadSounds();
  }
  
  private loadSounds() {
    // Ambient layers (looped)
    this.sounds.set('ambient-drone', new Howl({
      src: ['/sounds/ambient/drone.mp3'],
      loop: true,
      volume: 0.2,
      preload: true
    }));
    
    this.sounds.set('ambient-wind', new Howl({
      src: ['/sounds/ambient/wind-subtle.mp3'],
      loop: true,
      volume: 0.15,
      preload: true
    }));
    
    // Spirit sounds
    this.sounds.set('spirit-arrival', new Howl({
      src: ['/sounds/spirit/arrival.mp3'],
      volume: 0.6,
      preload: true
    }));
    
    this.sounds.set('spirit-departure', new Howl({
      src: ['/sounds/spirit/departure.mp3'],
      volume: 0.6,
      preload: true
    }));
    
    this.sounds.set('spirit-thinking', new Howl({
      src: ['/sounds/spirit/thinking.mp3'],
      loop: true,
      volume: 0.4,
      preload: true
    }));
    
    // Interaction sounds
    this.sounds.set('planchette-move', new Howl({
      src: ['/sounds/interactions/planchette-move.mp3'],
      volume: 0.5,
      preload: true
    }));
    
    this.sounds.set('letter-select', new Howl({
      src: ['/sounds/interactions/letter-select.mp3'],
      volume: 0.3,
      preload: true
    }));
    
    this.sounds.set('message-send', new Howl({
      src: ['/sounds/interactions/message-send.mp3'],
      volume: 0.5,
      preload: true
    }));
    
    // Candle sounds (sprite sheet for variations)
    this.sounds.set('candles', new Howl({
      src: ['/sounds/candles/candles-sprite.mp3'],
      sprite: {
        flicker1: [0, 500],
        flicker2: [600, 500],
        flicker3: [1200, 500],
        crackle: [1800, 800]
      },
      volume: 0.25,
      preload: true
    }));
  }
  
  play(
    soundName: string,
    options?: {
      volume?: number;
      rate?: number;
      stereo?: number;  // -1 to 1
      sprite?: string;
    }
  ): number | undefined {
    if (!this.enabled) return;
    
    const sound = this.sounds.get(soundName);
    if (!sound) {
      console.warn(`Sound not found: ${soundName}`);
      return;
    }
    
    // Apply options
    if (options?.volume !== undefined) {
      sound.volume(options.volume);
    }
    if (options?.rate !== undefined) {
      sound.rate(options.rate);
    }
    if (options?.stereo !== undefined) {
      sound.stereo(options.stereo);
    }
    
    // Play (with sprite if specified)
    return sound.play(options?.sprite);
  }
  
  stop(soundName: string) {
    const sound = this.sounds.get(soundName);
    sound?.stop();
  }
  
  // Ambient control
  startAmbient() {
    this.play('ambient-drone');
    this.play('ambient-wind');
    
    // Randomly play whispers
    setInterval(() => {
      if (Math.random() < 0.2) {  // 20% chance every interval
        this.play('ambient-wind', {
          volume: 0.1 + Math.random() * 0.1,
          stereo: Math.random() * 2 - 1  // Random pan
        });
      }
    }, 15000);  // Every 15 seconds
  }
  
  stopAmbient() {
    this.stop('ambient-drone');
    this.stop('ambient-wind');
  }
  
  fadeOut(soundName: string, duration: number = 1000) {
    const sound = this.sounds.get(soundName);
    if (!sound) return;
    
    const currentVolume = sound.volume() as number;
    sound.fade(currentVolume, 0, duration);
    
    setTimeout(() => sound.stop(), duration);
  }
  
  // Candle effects
  flickerCandle() {
    const variants = ['flicker1', 'flicker2', 'flicker3'];
    const variant = variants[Math.floor(Math.random() * variants.length)];
    this.play('candles', { sprite: variant });
  }
  
  // Spirit-specific sounds
  spiritArrives() {
    this.play('spirit-arrival', { volume: 0.7 });
  }
  
  spiritDeparted() {
    this.play('spirit-departure', { volume: 0.7 });
  }
  
  spiritThinking(start: boolean) {
    if (start) {
      this.play('spirit-thinking');
    } else {
      this.fadeOut('spirit-thinking', 500);
    }
  }
  
  // Planchette movement
  planchetteMove() {
    this.play('planchette-move', {
      rate: 0.9 + Math.random() * 0.2,  // Slight variation
      volume: 0.4 + Math.random() * 0.2
    });
  }
  
  // Master controls
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.sounds.forEach(sound => sound.stop());
    }
  }
  
  setMasterVolume(volume: number) {
    Howler.volume(Math.max(0, Math.min(1, volume)));
  }
  
  getMasterVolume(): number {
    return Howler.volume();
  }
}
```

## Audio Synchronization with Text

### Letter-by-Letter Timing Calculation

```python
# Backend: Calculate timing for each letter

def calculate_letter_timings(text: str, audio_duration: float) -> list[int]:
    """Calculate timing for each letter to sync with TTS audio.
    
    Args:
        text: The text that was spoken
        audio_duration: Duration of the audio in seconds
        
    Returns:
        List of milliseconds to wait before revealing each letter
    """
    letters = list(text)
    total_letters = len([c for c in letters if c.strip()])  # Count non-whitespace
    
    if total_letters == 0:
        return [200] * len(letters)
    
    # Base timing: distribute audio duration across letters
    base_timing = (audio_duration * 1000) / total_letters
    
    timings = []
    for char in letters:
        if char == ' ':
            # Spaces are quick
            timings.append(int(base_timing * 0.5))
        elif char in '.!?':
            # Punctuation gets pause
            timings.append(int(base_timing * 2.0))
        elif char in ',;:':
            # Minor punctuation gets smaller pause
            timings.append(int(base_timing * 1.5))
        else:
            # Regular characters
            # Add slight randomness for organic feel
            variation = base_timing * (0.9 + (hash(char) % 20) / 100)
            timings.append(int(variation))
    
    return timings
```

### Frontend Synchronized Reveal

```typescript
// components/audio/synced-reveal.tsx

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface SyncedRevealProps {
  text: string;
  audioUrl: string;
  letterTimings: number[];
  onComplete: () => void;
}

export const SyncedReveal: React.FC<SyncedRevealProps> = ({
  text,
  audioUrl,
  letterTimings,
  onComplete
}) => {
  const [revealedText, setRevealedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    // Start audio
    audioRef.current?.play().catch(console.error);
    
    // Start letter reveal sequence
    revealNextLetter(0);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text]);
  
  const revealNextLetter = (index: number) => {
    if (index >= text.length) {
      onComplete();
      return;
    }
    
    // Reveal current letter
    setRevealedText(text.slice(0, index + 1));
    setCurrentIndex(index);
    
    // Schedule next letter
    const delay = letterTimings[index] || 200;
    timeoutRef.current = setTimeout(() => {
      revealNextLetter(index + 1);
    }, delay);
  };
  
  return (
    <div className="synced-reveal">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="auto"
      />
      
      <div className="revealed-text font-serif text-2xl text-purple-100">
        {revealedText.split('').map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={i === currentIndex - 1 ? 'text-purple-300' : ''}
          >
            {char}
          </motion.span>
        ))}
        {currentIndex < text.length && (
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="text-purple-400"
          >
            _
          </motion.span>
        )}
      </div>
    </div>
  );
};
```

### Planchette Movement Sync

```typescript
// components/ouija/planchette-controller.tsx

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface PlanchetteControllerProps {
  text: string;
  letterTimings: number[];
  onLetterReached: (letter: string, index: number) => void;
}

export const PlanchetteController: React.FC<PlanchetteControllerProps> = ({
  text,
  letterTimings,
  onLetterReached
}) => {
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    moveToNextLetter(0);
  }, [text]);
  
  const moveToNextLetter = (index: number) => {
    if (index >= text.length) return;
    
    const letter = text[index];
    const position = getLetterPosition(letter);
    
    // Move planchette
    setCurrentPosition(position);
    setCurrentIndex(index);
    onLetterReached(letter, index);
    
    // Schedule next movement
    const delay = letterTimings[index] || 200;
    setTimeout(() => moveToNextLetter(index + 1), delay);
  };
  
  const getLetterPosition = (letter: string): { x: number; y: number } => {
    // Letter grid coordinates (adjust based on your UI)
    const letterGrid: Record<string, { x: number; y: number }> = {
      'A': { x: 50, y: 100 },
      'B': { x: 100, y: 100 },
      'C': { x: 150, y: 100 },
      // ... (define all letters)
      ' ': { x: 400, y: 400 },  // Center for spaces
      'YES': { x: 200, y: 500 },
      'NO': { x: 600, y: 500 },
    };
    
    return letterGrid[letter.toUpperCase()] || { x: 400, y: 300 };
  };
  
  return (
    <motion.div
      className="planchette"
      animate={currentPosition}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 20,
        mass: 0.8
      }}
      style={{
        position: 'absolute',
        width: 60,
        height: 60,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className="w-full h-full rounded-full bg-purple-500/30 backdrop-blur-sm border-2 border-purple-400 shadow-lg shadow-purple-500/50">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-purple-300" />
        </div>
      </div>
    </motion.div>
  );
};
```

## Performance Optimization

### Audio Caching Strategy

```python
# Backend caching for common phrases

COMMON_PHRASES = [
    "YES",
    "NO",
    "BEWARE",
    "SOON",
    "NEVER",
    "PERHAPS",
    "I sense...",
    "The veil grows thin...",
    "I am the ghost in your machine",
]

async def pre_cache_common_phrases():
    """Pre-generate and cache TTS for common phrases."""
    tts_service = TTSService()
    
    for phrase in COMMON_PHRASES:
        await tts_service.generate_speech(phrase, cache=True)
        logger.info(f"Cached TTS for: {phrase}")
```

### Frontend Audio Preloading

```typescript
// Preload critical sounds

export const preloadAudio = async (sounds: string[]) => {
  const promises = sounds.map(url => 
    new Promise((resolve, reject) => {
      const audio = new Audio(url);
      audio.addEventListener('canplaythrough', resolve, { once: true });
      audio.addEventListener('error', reject, { once: true });
      audio.load();
    })
  );
  
  await Promise.all(promises);
};

// Usage in component
useEffect(() => {
  preloadAudio([
    '/sounds/spirit/arrival.mp3',
    '/sounds/spirit/thinking.mp3',
    '/sounds/planchette-move.mp3'
  ]);
}, []);
```

## Error Handling

### Graceful Degradation

```typescript
// lib/audio-fallback.ts

export class AudioFallbackManager {
  private audioEngine: AudioEngine;
  private soundManager: SoundManager;
  private ttsAvailable: boolean = true;
  private webAudioAvailable: boolean = true;
  
  constructor() {
    this.checkCapabilities();
    this.audioEngine = new AudioEngine();
    this.soundManager = new SoundManager();
  }
  
  private checkCapabilities() {
    // Check Web Audio API
    this.webAudioAvailable = !!(
      window.AudioContext || (window as any).webkitAudioContext
    );
    
    // Check if audio can autoplay
    const audio = new Audio();
    audio.play().then(() => {
      this.ttsAvailable = true;
    }).catch(() => {
      this.ttsAvailable = false;
      console.warn('Audio autoplay blocked. Will require user interaction.');
    });
  }
  
  async playWithFallback(audioUrl: string, text: string) {
    if (!this.webAudioAvailable) {
      // Fallback to HTML5 audio
      return this.playWithHTMLAudio(audioUrl);
    }
    
    try {
      await this.audioEngine.resume();
      // Use Web Audio API
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      await this.audioEngine.playTTS(arrayBuffer);
    } catch (error) {
      console.error('Web Audio failed, using fallback:', error);
      await this.playWithHTMLAudio(audioUrl);
    }
  }
  
  private playWithHTMLAudio(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      audio.onended = () => resolve();
      audio.onerror = reject;
      audio.play().catch(reject);
    });
  }
  
  requiresUserInteraction(): boolean {
    return !this.ttsAvailable;
  }
}
```

### Audio Context Resume Handler

```typescript
// components/audio/audio-permission-handler.tsx

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const AudioPermissionHandler: React.FC<{
  audioEngine: AudioEngine;
  onEnabled: () => void;
}> = ({ audioEngine, onEnabled }) => {
  const [needsPermission, setNeedsPermission] = useState(false);
  
  useEffect(() => {
    // Check if audio context is suspended
    if (audioEngine.context.state === 'suspended') {
      setNeedsPermission(true);
    }
  }, []);
  
  const handleEnableAudio = async () => {
    await audioEngine.resume();
    setNeedsPermission(false);
    onEnabled();
  };
  
  return (
    <AnimatePresence>
      {needsPermission && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-slate-900 border-2 border-purple-500 rounded-lg p-8 max-w-md text-center"
          >
            <div className="mb-6">
              <span className="text-6xl">🔊</span>
            </div>
            <h2 className="text-2xl font-bold text-purple-100 mb-4">
              Enable Audio
            </h2>
            <p className="text-slate-300 mb-6">
              Séance requires audio to summon the spirit. Click below to enable sound effects and voice.
            </p>
            <button
              onClick={handleEnableAudio}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
            >
              Enable Audio
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

## Audio Testing

### Backend Tests

```python
# tests/test_tts_service.py

import pytest
from app.services.tts_service import TTSService

@pytest.mark.asyncio
async def test_generate_speech():
    """Test TTS generation."""
    service = TTSService()
    
    text = "I am the ghost in your machine"
    audio_bytes, duration = await service.generate_speech(text)
    
    assert len(audio_bytes) > 0
    assert duration > 0
    assert audio_bytes[:3] == b'ID3'  # MP3 header

@pytest.mark.asyncio
async def test_caching():
    """Test TTS caching."""
    service = TTSService()
    
    text = "Test phrase"
    
    # First call - generates
    audio1, duration1 = await service.generate_speech(text, cache=True)
    
    # Second call - from cache
    audio2, duration2 = await service.generate_speech(text, cache=True)
    
    assert audio1 == audio2
    assert duration1 == duration2

def test_calculate_letter_timings():
    """Test letter timing calculation."""
    from app.services.tts_service import calculate_letter_timings
    
    text = "Hello, world!"
    duration = 2.0  # 2 seconds
    
    timings = calculate_letter_timings(text, duration)
    
    assert len(timings) == len(text)
    assert all(t > 0 for t in timings)
    assert timings[5] > timings[4]  # Comma gets longer pause
```

### Frontend Tests

```typescript
// __tests__/lib/audio-engine.test.ts

import { AudioEngine } from '@/lib/audio-engine';

describe('AudioEngine', () => {
  let engine: AudioEngine;
  
  beforeEach(() => {
    // Mock AudioContext
    global.AudioContext = jest.fn().mockImplementation(() => ({
      createGain: jest.fn().mockReturnValue({
        connect: jest.fn(),
        gain: { value: 1 }
      }),
      createAnalyser: jest.fn().mockReturnValue({
        connect: jest.fn(),
        fftSize: 2048
      }),
      destination: {},
      decodeAudioData: jest.fn().mockResolvedValue({}),
      currentTime: 0,
      state: 'running',
      resume: jest.fn().mockResolvedValue(undefined)
    }));
    
    engine = new AudioEngine();
  });
  
  it('initializes correctly', () => {
    expect(engine).toBeDefined();
    expect(engine.getVolume()).toBe(0.7);
  });
  
  it('sets volume within bounds', () => {
    engine.setVolume(0.5);
    expect(engine.getVolume()).toBe(0.5);
    
    engine.setVolume(1.5);
    expect(engine.getVolume()).toBe(1);
    
    engine.setVolume(-0.5);
    expect(engine.getVolume()).toBe(0);
  });
});
```

## Browser Compatibility

### Supported Browsers

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Web Audio API | ✅ 90+ | ✅ 88+ | ✅ 14+ | ✅ 90+ |
| Stereo Panner | ✅ 90+ | ✅ 88+ | ✅ 14+ | ✅ 90+ |
| Audio Worklet | ✅ 90+ | ✅ 88+ | ✅ 14.1+ | ✅ 90+ |
| Howler.js | ✅ All | ✅ All | ✅ All | ✅ All |

### Polyfills & Fallbacks

```typescript
// lib/audio-polyfills.ts

// StereoPannerNode polyfill for older browsers
if (!window.AudioContext.prototype.createStereoPanner) {
  window.AudioContext.prototype.createStereoPanner = function() {
    const panner = this.createPanner();
    panner.panningModel = 'equalpower';
    
    // Simulate stereo panning with 3D panner
    return {
      connect: (node: AudioNode) => panner.connect(node),
      disconnect: () => panner.disconnect(),
      pan: {
        value: 0,
        setValueAtTime: (value: number, time: number) => {
          panner.setPosition(value, 0, 1 - Math.abs(value));
        }
      }
    } as any;
  };
}
```

## Performance Benchmarks

### Target Performance

- **TTS Generation**: < 2 seconds for 30 words
- **Audio Playback Latency**: < 100ms
- **Sound Effect Trigger**: < 50ms
- **Memory Usage**: < 50MB for audio cache
- **CPU Usage**: < 5% during playback

### Optimization Checklist

- [ ] Cache common phrases
- [ ] Preload critical sound effects
- [ ] Use audio sprites for small sounds
- [ ] Lazy load ambient sounds
- [ ] Compress audio files (MP3 at 128kbps)
- [ ] Implement audio buffer pooling
- [ ] Debounce rapid sound triggers

## Mobile Considerations

### iOS Safari Quirks

```typescript
// Handle iOS audio restrictions

export class iOSAudioHandler {
  private unlocked = false;
  
  async unlock() {
    if (this.unlocked) return;
    
    // iOS requires user interaction to unlock audio
    const context = new AudioContext();
    const buffer = context.createBuffer(1, 1, 22050);
    const source = context.createBufferSource();
    
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);
    
    await context.resume();
    this.unlocked = true;
  }
  
  isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }
}

// Usage
const iosHandler = new iOSAudioHandler();

document.addEventListener('touchstart', async () => {
  if (iosHandler.isIOS()) {
    await iosHandler.unlock();
  }
}, { once: true });
```

### Android Considerations

```typescript
// Reduce quality on low-end devices

const isMobile = /Android|iPhone|iPad/.test(navigator.userAgent);
const isLowEnd = navigator.hardwareConcurrency <= 4;

const AUDIO_CONFIG = {
  sampleRate: isMobile && isLowEnd ? 22050 : 44100,
  maxSources: isMobile ? 8 : 16,
  enableEffects: !isLowEnd
};
```

## Accessibility

### Audio Controls

```typescript
// components/audio/audio-controls.tsx

export const AudioControls: React.FC = () => {
  const [volume, setVolume] = useState(0.7);
  const [enabled, setEnabled] = useState(true);
  const soundManager = useSoundManager();
  
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    soundManager.setMasterVolume(newVolume);
  };
  
  const toggleAudio = () => {
    const newState = !enabled;
    setEnabled(newState);
    soundManager.setEnabled(newState);
  };
  
  return (
    <div className="audio-controls flex items-center gap-4 p-4 bg-slate-900/80 rounded-lg">
      <button
        onClick={toggleAudio}
        aria-label={enabled ? 'Mute audio' : 'Unmute audio'}
        className="p-2 hover:bg-slate-800 rounded transition-colors"
      >
        {enabled ? '🔊' : '🔇'}
      </button>
      
      <label className="flex items-center gap-2 flex-1">
        <span className="text-sm text-slate-400">Volume</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          aria-label="Audio volume"
          className="flex-1"
        />
        <span className="text-sm text-slate-400 w-12">
          {Math.round(volume * 100)}%
        </span>
      </label>
    </div>
  );
};
```

### Visual Indicators for Deaf/Hard of Hearing

```typescript
// components/audio/audio-visualizer.tsx

export const AudioVisualizer: React.FC<{
  isPlaying: boolean;
  intensity: number;
}> = ({ isPlaying, intensity }) => {
  return (
    <motion.div
      className="audio-indicator"
      animate={{
        scale: isPlaying ? [1, 1.2, 1] : 1,
        opacity: isPlaying ? 1 : 0.3
      }}
      transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
    >
      <div 
        className="w-4 h-4 rounded-full bg-purple-500"
        style={{ 
          boxShadow: `0 0 ${10 + intensity * 20}px rgba(168, 85, 247, 0.6)` 
        }}
      />
    </motion.div>
  );
};
```

## Security Considerations

### Content Security Policy

```typescript
// next.config.js

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "media-src 'self' https://api.elevenlabs.io blob:",
      "connect-src 'self' https://api.elevenlabs.io wss://your-backend.com",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'"
    ].join('; ')
  }
];
```

### Rate Limiting TTS API

```python
# Backend rate limiting for TTS

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/api/tts/generate")
@limiter.limit("10/minute")
async def generate_tts(request: Request, text: str):
    """Generate TTS with rate limiting."""
    # Check cache first
    cached = tts_service.get_from_cache(text)
    if cached:
        return cached
    
    # Generate new
    audio_bytes, duration = await tts_service.generate_speech(text)
    return {
        "audio_url": f"/api/audio/{cache_key}",
        "duration": duration
    }
```

## Debugging Audio Issues

### Audio Debug Panel

```typescript
// components/debug/audio-debug.tsx

export const AudioDebugPanel: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState({
    contextState: '',
    volume: 0,
    soundsLoaded: 0,
    activeConnections: 0
  });
  
  useEffect(() => {
    const interval = setInterval(() => {
      const audioEngine = getAudioEngine();
      setDebugInfo({
        contextState: audioEngine.context.state,
        volume: audioEngine.getVolume(),
        soundsLoaded: soundManager.sounds.size,
        activeConnections: audioEngine.getActiveCount()
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-green-400 p-4 rounded font-mono text-xs">
      <div>Context: {debugInfo.contextState}</div>
      <div>Volume: {(debugInfo.volume * 100).toFixed(0)}%</div>
      <div>Sounds: {debugInfo.soundsLoaded}</div>
      <div>Active: {debugInfo.activeConnections}</div>
    </div>
  );
};
```

## Best Practices Summary

### Do's ✅

- **Preload critical audio** on session join
- **Cache TTS responses** for common phrases
- **Use audio sprites** for small sound effects
- **Implement graceful fallbacks** for unsupported browsers
- **Require user interaction** before playing audio (browser policy)
- **Provide volume controls** and mute options
- **Add visual indicators** for audio events (accessibility)
- **Compress audio files** (MP3 at 128kbps is fine)
- **Test on mobile devices** (especially iOS)

### Don'ts ❌

- **Don't autoplay** without user interaction
- **Don't use uncompressed audio** (WAV files)
- **Don't play too many sounds** simultaneously (max 8-10)
- **Don't forget error handling** (audio can fail)
- **Don't hardcode audio URLs** (use environment variables)
- **Don't skip caching** (TTS API calls are expensive)
- **Don't ignore mobile** (iOS has strict audio policies)
- **Don't forget cleanup** (disconnect audio nodes on unmount)

## Integration Checklist

Before deploying audio features:

- [ ] ElevenLabs API key configured
- [ ] All sound files uploaded to `/public/sounds/`
- [ ] Audio preloading implemented
- [ ] TTS caching working
- [ ] Stereo positioning tested
- [ ] Mobile audio unlocking working
- [ ] Volume controls accessible
- [ ] Error handling robust
- [ ] Performance benchmarks met
- [ ] Accessibility features implemented
- [ ] iOS Safari tested
- [ ] Android Chrome tested
- [ ] Rate limiting configured
- [ ] CSP headers set correctly

## Example: Complete Audio Flow

```typescript
// Example: Spirit responds to user question

async function handleSpiritResponse(question: string) {
  const soundManager = useSoundManager();
  const audioEngine = useAudioEngine();
  
  // 1. Show spirit is thinking
  soundManager.spiritThinking(true);
  
  // 2. Generate response from Kiro API
  const response = await fetch('/api/spirit/ask', {
    method: 'POST',
    body: JSON.stringify({ question })
  });
  
  const { text, audio_url, letter_timings, duration } = await response.json();
  
  // 3. Stop thinking sound
  soundManager.spiritThinking(false);
  
  // 4. Play arrival sound
  soundManager.spiritArrives();
  
  // 5. Fetch audio
  const audioResponse = await fetch(audio_url);
  const audioData = await audioResponse.arrayBuffer();
  
  // 6. Play TTS with letter-by-letter sync
  await audioEngine.playTTS(audioData, {
    position: AUDIO_POSITIONS.SPIRIT_CENTER,
    onProgress: (progress) => {
      // Update planchette position based on progress
      const letterIndex = Math.floor(progress * text.length);
      movePlanchette(text[letterIndex]);
      
      // Play planchette sound
      if (letterIndex > prevIndex) {
        soundManager.planchetteMove();
      }
    },
    onComplete: () => {
      // Spirit finishes speaking
      soundManager.play('spirit-emphasis');
    }
  });
}
```

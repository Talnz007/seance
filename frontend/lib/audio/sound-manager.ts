import { Howl, Howler } from 'howler';

export class SoundManager {
    private sounds: Map<string, Howl> = new Map();
    private enabled: boolean = true;

    constructor() {
        if (typeof window !== 'undefined') {
            this.loadSounds();
        }
    }

    private loadSounds() {
        const soundDefinitions = [
            { key: 'ambient-drone', src: '/sounds/ambient/drone.mp3', loop: true, volume: 0.2 },
            { key: 'ambient-wind', src: '/sounds/ambient/wind-subtle.mp3', loop: true, volume: 0.15 },
            { key: 'spirit-arrival', src: '/sounds/spirit/arrival.mp3', volume: 0.6 },
            { key: 'spirit-departure', src: '/sounds/spirit/departure.mp3', volume: 0.6 },
            { key: 'spirit-thinking', src: '/sounds/spirit/thinking.mp3', loop: true, volume: 0.4 },
            { key: 'planchette-move', src: '/sounds/interactions/planchette-move.mp3', volume: 0.5 },
            { key: 'letter-select', src: '/sounds/interactions/letter-select.mp3', volume: 0.3 },
            { key: 'message-send', src: '/sounds/interactions/message-send.mp3', volume: 0.5 },
        ];

        soundDefinitions.forEach(def => {
            this.sounds.set(def.key, new Howl({
                src: [def.src],
                loop: def.loop,
                volume: def.volume,
                preload: true,
                onloaderror: (id, err) => {
                    console.warn(`Failed to load sound ${def.key}:`, err);
                }
            }));
        });

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
            preload: true,
            onloaderror: (id, err) => {
                console.warn(`Failed to load sound candles:`, err);
            }
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
        // Note: In a real app, clear this interval on unmount
        if (typeof window !== 'undefined') {
            setInterval(() => {
                if (Math.random() < 0.2 && this.enabled) {  // 20% chance every interval
                    this.play('ambient-wind', {
                        volume: 0.1 + Math.random() * 0.1,
                        stereo: Math.random() * 2 - 1  // Random pan
                    });
                }
            }, 15000);  // Every 15 seconds
        }
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

export const soundManager = new SoundManager();

import { StereoPosition } from '@/types/audio';

export class AudioEngine {
    private context: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private analyser: AnalyserNode | null = null;
    private isInitialized: boolean = false;

    constructor() {
        // Lazy initialization to handle browser autoplay policies
    }

    init() {
        if (this.isInitialized) return;

        try {
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

            this.isInitialized = true;
        } catch (e) {
            console.error('Failed to initialize AudioEngine:', e);
        }
    }

    async playTTS(
        audioData: ArrayBuffer,
        options?: {
            position?: StereoPosition;
            onProgress?: (progress: number) => void;
            onComplete?: () => void;
        }
    ): Promise<AudioBufferSourceNode | null> {
        if (!this.isInitialized || !this.context || !this.masterGain) {
            this.init();
            if (!this.context || !this.masterGain) return null;
        }

        // Resume context if suspended (browser policy)
        if (this.context.state === 'suspended') {
            await this.context.resume();
        }

        try {
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
        } catch (e) {
            console.error('Error playing TTS:', e);
            options?.onComplete?.(); // Ensure callback is called even on error
            return null;
        }
    }

    private trackProgress(
        source: AudioBufferSourceNode,
        duration: number,
        callback: (progress: number) => void
    ) {
        if (!this.context) return;
        const startTime = this.context.currentTime;

        const updateProgress = () => {
            if (!this.context) return;
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
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
        }
    }

    getVolume(): number {
        return this.masterGain?.gain.value ?? 0;
    }

    // Resume context (required after user interaction)
    async resume() {
        if (this.context && this.context.state === 'suspended') {
            await this.context.resume();
        }
    }
}

// Singleton instance
export const audioEngine = new AudioEngine();

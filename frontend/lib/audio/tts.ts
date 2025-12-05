import { audioEngine } from './audio-engine';
import { API_URL } from '../constants';

export class ServerTTS {
    private isSpeaking: boolean = false;
    private speakTimeout: NodeJS.Timeout | null = null;

    async speak(text: string, voiceId?: string): Promise<void> {
        // Cancel any pending TTS timeout
        if (this.speakTimeout) {
            clearTimeout(this.speakTimeout);
            this.speakTimeout = null;
        }

        // Allow new TTS even if previous was stuck
        if (this.isSpeaking) {
            console.log('TTS: Cancelling previous speech');
            this.isSpeaking = false;
        }

        this.isSpeaking = true;
        console.log('TTS: Starting speech generation for:', text.substring(0, 50) + '...');

        try {
            const response = await fetch(`${API_URL}/api/tts/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    voice_id: voiceId || "en-US-EmmaMultilingualNeural" // Edge TTS Voice
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('TTS: Server error:', response.status, errorText);
                throw new Error(`TTS generation failed: ${response.status}`);
            }

            const audioBlob = await response.blob();
            console.log('TTS: Received audio blob, size:', audioBlob.size);

            if (audioBlob.size === 0) {
                throw new Error('TTS: Empty audio response');
            }

            const audioArrayBuffer = await audioBlob.arrayBuffer();

            await audioEngine.playTTS(audioArrayBuffer, {
                onComplete: () => {
                    console.log('TTS: Playback complete');
                    this.isSpeaking = false;
                }
            });

        } catch (error) {
            console.error('Server TTS Error:', error);
            this.isSpeaking = false;
            // Set timeout to reset speaking flag after 10s as safety net
            this.speakTimeout = setTimeout(() => {
                this.isSpeaking = false;
            }, 10000);
        }
    }

    cancel() {
        if (this.speakTimeout) {
            clearTimeout(this.speakTimeout);
        }
        this.isSpeaking = false;
    }
}

export const serverTTS = new ServerTTS();
export const webSpeechTTS = new ServerTTS();


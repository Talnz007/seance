import { audioEngine } from './audio-engine';
import { API_URL } from '../constants';

export class ServerTTS {
    private isSpeaking: boolean = false;

    async speak(text: string, voiceId?: string): Promise<void> {
        if (this.isSpeaking) return;
        this.isSpeaking = true;

        try {
            const response = await fetch(`${API_URL}/api/tts/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    voice_id: voiceId || "en-US-ChristopherNeural" // Edge TTS Voice
                }),
            });

            if (!response.ok) {
                throw new Error('TTS generation failed');
            }

            const audioBlob = await response.blob();
            const audioArrayBuffer = await audioBlob.arrayBuffer();

            await audioEngine.playTTS(audioArrayBuffer, {
                onComplete: () => {
                    this.isSpeaking = false;
                }
            });

        } catch (error) {
            console.error('Server TTS Error:', error);
            this.isSpeaking = false;
            // Fallback to Web Speech API if server fails?
            // For now, just log error.
        }
    }

    cancel() {
        // Implement cancellation logic if needed (e.g., stop audio engine)
        this.isSpeaking = false;
    }
}

export const serverTTS = new ServerTTS();
// Export as webSpeechTTS to maintain compatibility with existing code for now, 
// or update the import in OuijaBoard. Let's update the import.
export const webSpeechTTS = new ServerTTS(); // Alias for backward compatibility if needed, but better to rename.

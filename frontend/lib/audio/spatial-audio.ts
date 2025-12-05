import { AudioEngine } from './audio-engine';
import { AUDIO_POSITIONS, StereoPosition } from '@/types/audio';

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
        if (totalUsers <= 1) return AUDIO_POSITIONS.USER_CENTER;

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

export const spatialAudioManager = new SpatialAudioManager(new AudioEngine());

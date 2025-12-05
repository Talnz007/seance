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

export interface AudioOptions {
    volume?: number;
    rate?: number;
    stereo?: number;
    sprite?: string;
}

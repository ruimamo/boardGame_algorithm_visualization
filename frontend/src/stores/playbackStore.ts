import { create } from "zustand";

interface PlaybackState {
  isPlaying: boolean;
  speed: number;

  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setSpeed: (speed: number) => void;
}

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  isPlaying: false,
  speed: 1.0,

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set({ isPlaying: !get().isPlaying }),
  setSpeed: (speed) => set({ speed: Math.max(0.5, Math.min(5.0, speed)) }),
}));

import { create } from "zustand";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

interface ConnectionState {
  status: ConnectionStatus;
  retryCount: number;

  setStatus: (status: ConnectionStatus) => void;
  incrementRetry: () => void;
  resetRetry: () => void;
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  status: "disconnected",
  retryCount: 0,

  setStatus: (status) => set({ status }),
  incrementRetry: () => set({ retryCount: get().retryCount + 1 }),
  resetRetry: () => set({ retryCount: 0 }),
}));

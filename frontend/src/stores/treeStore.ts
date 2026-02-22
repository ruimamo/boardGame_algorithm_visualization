import { create } from "zustand";
import type { SearchEvent } from "../types/websocket";
import type { MoveDict } from "../types/game";

interface TreeState {
  events: SearchEvent[];
  currentStep: number;
  selectedNodeId: string | null;
  bestMove: MoveDict | null;

  setEvents: (events: SearchEvent[], bestMove: MoveDict | null) => void;
  stepForward: () => void;
  stepBackward: () => void;
  goToStep: (step: number) => void;
  selectNode: (nodeId: string | null) => void;
  clear: () => void;
}

export const useTreeStore = create<TreeState>((set, get) => ({
  events: [],
  currentStep: -1,
  selectedNodeId: null,
  bestMove: null,

  setEvents: (events, bestMove) => set({ events, bestMove, currentStep: -1, selectedNodeId: null }),
  stepForward: () => {
    const { currentStep, events } = get();
    if (currentStep < events.length - 1) {
      set({ currentStep: currentStep + 1 });
    }
  },
  stepBackward: () => {
    const { currentStep } = get();
    if (currentStep >= 0) {
      set({ currentStep: currentStep - 1 });
    }
  },
  goToStep: (step) => {
    const { events } = get();
    const clamped = Math.max(-1, Math.min(step, events.length - 1));
    set({ currentStep: clamped });
  },
  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
  clear: () => set({ events: [], currentStep: -1, selectedNodeId: null, bestMove: null }),
}));

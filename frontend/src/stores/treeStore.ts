import { create } from "zustand";
import type { SearchEvent } from "../types/websocket";
import type { MoveDict } from "../types/game";

interface TreeState {
  events: SearchEvent[];
  currentStep: number;
  selectedNodeId: string | null;
  bestMove: MoveDict | null;
  expandedNodeIds: Set<string>;

  setEvents: (events: SearchEvent[], bestMove: MoveDict | null) => void;
  stepForward: () => void;
  stepBackward: () => void;
  goToStep: (step: number) => void;
  selectNode: (nodeId: string | null) => void;
  toggleExpand: (nodeId: string) => void;
  clear: () => void;
}

export const useTreeStore = create<TreeState>((set, get) => ({
  events: [],
  currentStep: -1,
  selectedNodeId: null,
  bestMove: null,
  expandedNodeIds: new Set<string>(),

  setEvents: (events, bestMove) => set({ events, bestMove, currentStep: -1, selectedNodeId: null, expandedNodeIds: new Set<string>() }),
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
  toggleExpand: (nodeId) => {
    const { expandedNodeIds } = get();
    const next = new Set(expandedNodeIds);
    if (next.has(nodeId)) {
      next.delete(nodeId);
    } else {
      next.add(nodeId);
    }
    set({ expandedNodeIds: next });
  },
  clear: () => set({ events: [], currentStep: -1, selectedNodeId: null, bestMove: null, expandedNodeIds: new Set<string>() }),
}));

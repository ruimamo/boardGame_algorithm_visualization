import { create } from "zustand";
import type { GameBoardState, GameResult } from "../types/game";

interface GameState {
  gameName: string;
  algorithmName: string;
  currentState: GameBoardState | null;
  currentPlayer: number;
  playerSide: 1 | -1;
  gameResult: GameResult | null;

  setGame: (name: string) => void;
  setAlgorithm: (name: string) => void;
  setPlayerSide: (side: 1 | -1) => void;
  updateState: (state: GameBoardState, currentPlayer: number) => void;
  setGameResult: (result: GameResult | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  gameName: "tic_tac_toe",
  algorithmName: "minimax",
  currentState: null,
  currentPlayer: 1,
  playerSide: 1,
  gameResult: null,

  setGame: (name) => set({ gameName: name }),
  setAlgorithm: (name) => set({ algorithmName: name }),
  setPlayerSide: (side) => set({ playerSide: side }),
  updateState: (state, currentPlayer) => set({ currentState: state, currentPlayer }),
  setGameResult: (result) => set({ gameResult: result }),
  reset: () =>
    set({
      currentState: null,
      currentPlayer: 1,
      gameResult: null,
    }),
}));

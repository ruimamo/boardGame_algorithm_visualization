import { create } from "zustand";
import type { GameBoardState, GameResult } from "../types/game";

interface GameState {
  gameName: string;
  algorithmName: string;
  currentState: GameBoardState | null;
  currentPlayer: number;
  playerSide: 1 | -1;
  gameResult: GameResult | null;
  iterations: number;

  setGame: (name: string) => void;
  setAlgorithm: (name: string) => void;
  setPlayerSide: (side: 1 | -1) => void;
  setIterations: (n: number) => void;
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
  iterations: 50,

  setGame: (name) => set({ gameName: name, currentState: null, gameResult: null }),
  setAlgorithm: (name) => set({ algorithmName: name }),
  setPlayerSide: (side) => set({ playerSide: side }),
  setIterations: (n) => set({ iterations: n }),
  updateState: (state, currentPlayer) => set({ currentState: state, currentPlayer }),
  setGameResult: (result) => set({ gameResult: result }),
  reset: () =>
    set({
      currentState: null,
      currentPlayer: 1,
      gameResult: null,
    }),
}));

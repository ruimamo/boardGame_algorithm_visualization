import type { GameRenderer } from "../types/game";
import { ticTacToeRenderer } from "../plugins/ticTacToe";

const registry: Record<string, GameRenderer> = {
  tic_tac_toe: ticTacToeRenderer,
};

export function getGameRenderer(gameName: string): GameRenderer | undefined {
  return registry[gameName];
}

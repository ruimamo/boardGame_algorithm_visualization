import type { GameRenderer } from "../types/game";
import { ticTacToeRenderer } from "../plugins/ticTacToe";
import { kingsValleyRenderer } from "../plugins/kingsValley";

const registry: Record<string, GameRenderer> = {
  tic_tac_toe: ticTacToeRenderer,
  kings_valley: kingsValleyRenderer,
};

export function getGameRenderer(gameName: string): GameRenderer | undefined {
  return registry[gameName];
}

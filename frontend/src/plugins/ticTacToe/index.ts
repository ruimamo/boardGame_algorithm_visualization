import type { GameRenderer } from "../../types/game";
import { TicTacToeBoard } from "./Board";
import { TicTacToeMiniBoard } from "./MiniBoard";

export const ticTacToeRenderer: GameRenderer = {
  BoardComponent: TicTacToeBoard,
  MiniBoardComponent: TicTacToeMiniBoard,
};

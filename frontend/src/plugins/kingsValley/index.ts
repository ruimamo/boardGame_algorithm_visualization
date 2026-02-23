import type { GameRenderer } from "../../types/game";
import { KingsValleyBoard } from "./Board";
import { KingsValleyMiniBoard } from "./MiniBoard";

export const kingsValleyRenderer: GameRenderer = {
  BoardComponent: KingsValleyBoard,
  MiniBoardComponent: KingsValleyMiniBoard,
};

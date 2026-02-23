import type { GameBoardState, MoveDict } from "./game";

// --- クライアント → サーバー ---

export type GetInitialStateRequest = {
  type: "get_initial_state";
  game: string;
};

export type ApplyMoveRequest = {
  type: "apply_move";
  game: string;
  state: GameBoardState;
  move: MoveDict;
};

export type StartSearchRequest = {
  type: "start_search";
  game: string;
  algorithm: string;
  state: GameBoardState;
  iterations?: number;
};

export type ClientMessage =
  | GetInitialStateRequest
  | ApplyMoveRequest
  | StartSearchRequest;

// --- サーバー → クライアント ---

export type InitialStateResponse = {
  type: "initial_state";
  game: string;
  state: GameBoardState;
  current_player: number;
};

export type StateUpdatedResponse = {
  type: "state_updated";
  state: GameBoardState;
  current_player: number;
  is_terminal: boolean;
  result: { winner: number } | null;
  legal_moves: MoveDict[];
};

export type SearchResultResponse = {
  type: "search_result";
  events: SearchEvent[];
  best_move: MoveDict | null;
};

export type ErrorResponse = {
  type: "error";
  message: string;
};

export type ServerMessage =
  | InitialStateResponse
  | StateUpdatedResponse
  | SearchResultResponse
  | ErrorResponse;

// --- 探索イベント ---

export type NodeExpandedEvent = {
  type: "node_expanded";
  id: string;
  parent_id: string | null;
  move: MoveDict | null;
  state: GameBoardState;
};

export type NodeEvaluatedEvent = {
  type: "node_evaluated";
  id: string;
  value: number;
};

export type NodePrunedEvent = {
  type: "node_pruned";
  id: string;
  alpha: number;
  beta: number;
};

export type SearchCompleteEvent = {
  type: "search_complete";
  best_move: MoveDict | null;
  total_nodes: number;
};

export type NodeSelectedEvent = {
  type: "node_selected";
  id: string;
  ucb_value: number;
};

export type SimulationDoneEvent = {
  type: "simulation_done";
  id: string;
  result: number;
};

export type BackpropagatedEvent = {
  type: "backpropagated";
  id: string;
  visits: number;
  win_rate: number;
};

export type SearchEvent =
  | NodeExpandedEvent
  | NodeEvaluatedEvent
  | NodePrunedEvent
  | NodeSelectedEvent
  | SimulationDoneEvent
  | BackpropagatedEvent
  | SearchCompleteEvent;

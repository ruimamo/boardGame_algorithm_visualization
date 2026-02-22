import type { ServerMessage } from "../types/websocket";
import type { GameBoardState, MoveDict } from "../types/game";
import { useGameStore } from "../stores/gameStore";
import { useTreeStore } from "../stores/treeStore";
import { useConnectionStore } from "../stores/connectionStore";

const WS_URL = "ws://localhost:5173/ws";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

class WebSocketService {
  private ws: WebSocket | null = null;
  private retryTimeout: ReturnType<typeof setTimeout> | null = null;
  private intentionalClose = false;

  connect(): void {
    this.intentionalClose = false;
    useConnectionStore.getState().setStatus("connecting");

    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      useConnectionStore.getState().setStatus("connected");
      useConnectionStore.getState().resetRetry();
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const message: ServerMessage = JSON.parse(event.data as string);
        this.handleMessage(message);
      } catch (e) {
        console.error("[WebSocketService] Failed to parse message:", e);
      }
    };

    this.ws.onclose = () => {
      if (this.intentionalClose) return;
      const { retryCount, incrementRetry, setStatus } =
        useConnectionStore.getState();
      setStatus("disconnected");
      if (retryCount < MAX_RETRIES) {
        incrementRetry();
        this.retryTimeout = setTimeout(() => this.connect(), RETRY_DELAY_MS);
      } else {
        setStatus("error");
      }
    };

    this.ws.onerror = () => {
      console.error("[WebSocketService] WebSocket error");
    };
  }

  disconnect(): void {
    this.intentionalClose = true;
    if (this.retryTimeout !== null) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    useConnectionStore.getState().resetRetry();
    this.ws?.close();
    this.ws = null;
    useConnectionStore.getState().setStatus("disconnected");
  }

  getInitialState(game: string): void {
    this.send({ type: "get_initial_state", game });
  }

  applyMove(game: string, state: GameBoardState, move: MoveDict): void {
    this.send({ type: "apply_move", game, state, move });
  }

  startSearch(game: string, algorithm: string, state: GameBoardState): void {
    this.send({ type: "start_search", game, algorithm, state });
  }

  private send(data: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn("[WebSocketService] Cannot send: WebSocket is not open");
    }
  }

  private handleMessage(message: ServerMessage): void {
    switch (message.type) {
      case "initial_state": {
        useGameStore
          .getState()
          .updateState(message.state, message.current_player);
        break;
      }
      case "state_updated": {
        useGameStore
          .getState()
          .updateState(message.state, message.current_player);
        if (message.is_terminal && message.result !== null) {
          useGameStore
            .getState()
            .setGameResult({ winner: message.result.winner as 1 | -1 | 0 });
        }
        break;
      }
      case "search_result": {
        useTreeStore
          .getState()
          .setEvents(message.events, message.best_move);
        break;
      }
      case "error": {
        console.error("[WebSocketService] Server error:", message.message);
        break;
      }
    }
  }
}

export const wsService = new WebSocketService();

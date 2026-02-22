import { useGameStore } from "../stores/gameStore";
import { useTreeStore } from "../stores/treeStore";
import { getGameRenderer } from "../utils/gameRenderers";
import { wsService } from "../services/websocket";
import { TreeView } from "./visualization/TreeView";
import { NodeDetail } from "./visualization/NodeDetail";
import type { MoveDict } from "../types/game";

const PLAYER_LABEL: Record<number, string> = { 1: "X（先手）", [-1]: "O（後手）" };
const RESULT_LABEL: Record<number, string> = {
  1: "X の勝ち",
  [-1]: "O の勝ち",
  0: "引き分け",
};

export const MainLayout: React.FC = () => {
  const gameName = useGameStore((s) => s.gameName);
  const currentState = useGameStore((s) => s.currentState);
  const currentPlayer = useGameStore((s) => s.currentPlayer);
  const gameResult = useGameStore((s) => s.gameResult);
  const selectedNodeId = useTreeStore((s) => s.selectedNodeId);
  const events = useTreeStore((s) => s.events);
  const currentStep = useTreeStore((s) => s.currentStep);

  const renderer = getGameRenderer(gameName);

  // ノード選択中はそのノードの盤面をプレビュー
  const previewState = (() => {
    if (!selectedNodeId) return null;
    for (let i = currentStep; i >= 0; i--) {
      const ev = events[i];
      if (ev.type === "node_expanded" && ev.id === selectedNodeId) {
        return ev.state;
      }
    }
    return null;
  })();

  const displayState = previewState ?? currentState;
  const isInteractive = !selectedNodeId && !gameResult;

  const handleMove = (move: MoveDict) => {
    if (!displayState) return;
    wsService.applyMove(gameName, displayState, move);
  };

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      {/* 左ペイン: 盤面 */}
      <div
        style={{
          width: "40%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          borderRight: "1px solid #ddd",
          flexShrink: 0,
        }}
      >
        {displayState && renderer ? (
          <>
            <renderer.BoardComponent
              state={displayState}
              onMove={handleMove}
              isInteractive={isInteractive}
            />
            <div style={{ fontSize: 14, color: "#555" }}>
              {gameResult ? (
                <strong>{RESULT_LABEL[gameResult.winner]}</strong>
              ) : previewState ? (
                <span style={{ color: "#888" }}>プレビュー中（クリックで解除）</span>
              ) : (
                <span>手番: {PLAYER_LABEL[currentPlayer] ?? currentPlayer}</span>
              )}
            </div>
          </>
        ) : (
          <div style={{ color: "#aaa" }}>接続中...</div>
        )}
      </div>

      {/* 右ペイン: ツリー */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <TreeView />
          {selectedNodeId && (
            <div style={{ position: "absolute", top: 12, right: 12, zIndex: 10 }}>
              <NodeDetail />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

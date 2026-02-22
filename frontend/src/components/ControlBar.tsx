import { useGameStore } from "../stores/gameStore";
import { useTreeStore } from "../stores/treeStore";
import { usePlaybackStore } from "../stores/playbackStore";
import { wsService } from "../services/websocket";

export const ControlBar: React.FC = () => {
  const gameName = useGameStore((s) => s.gameName);
  const algorithmName = useGameStore((s) => s.algorithmName);
  const currentState = useGameStore((s) => s.currentState);
  const resetGame = useGameStore((s) => s.reset);

  const events = useTreeStore((s) => s.events);
  const currentStep = useTreeStore((s) => s.currentStep);
  const stepForward = useTreeStore((s) => s.stepForward);
  const stepBackward = useTreeStore((s) => s.stepBackward);
  const clearTree = useTreeStore((s) => s.clear);

  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const speed = usePlaybackStore((s) => s.speed);
  const togglePlay = usePlaybackStore((s) => s.togglePlay);
  const pause = usePlaybackStore((s) => s.pause);
  const setSpeed = usePlaybackStore((s) => s.setSpeed);

  const hasEvents = events.length > 0;
  const atEnd = currentStep >= events.length - 1;

  const handleStartSearch = () => {
    if (!currentState) return;
    clearTree();
    pause();
    wsService.startSearch(gameName, algorithmName, currentState);
  };

  const handleReset = () => {
    pause();
    clearTree();
    resetGame();
    wsService.getInitialState(gameName);
  };

  const btnStyle: React.CSSProperties = {
    padding: "4px 12px",
    fontSize: 13,
    cursor: "pointer",
    border: "1px solid #ccc",
    borderRadius: 4,
    background: "white",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        borderTop: "1px solid #ddd",
        background: "#fafafa",
        flexShrink: 0,
      }}
    >
      {/* 再生コントロール */}
      <button style={btnStyle} onClick={stepBackward} disabled={!hasEvents || currentStep < 0}>
        ⏮
      </button>
      <button
        style={{ ...btnStyle, minWidth: 36 }}
        onClick={() => { if (atEnd) pause(); else togglePlay(); }}
        disabled={!hasEvents}
      >
        {isPlaying ? "⏸" : "▶"}
      </button>
      <button style={btnStyle} onClick={stepForward} disabled={!hasEvents || atEnd}>
        ⏭
      </button>

      {/* ステップ表示 */}
      {hasEvents && (
        <span style={{ fontSize: 12, color: "#666", minWidth: 80 }}>
          {currentStep + 1} / {events.length}
        </span>
      )}

      {/* 速度スライダー */}
      <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
        速度
        <input
          type="range"
          min={0.5}
          max={5.0}
          step={0.5}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          style={{ width: 80 }}
        />
        {speed}x
      </label>

      <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
        <button
          style={{ ...btnStyle, background: "#1e88e5", color: "white", border: "none" }}
          onClick={handleStartSearch}
          disabled={!currentState}
        >
          AI を動かす
        </button>
        <button style={btnStyle} onClick={handleReset}>
          リセット
        </button>
      </div>
    </div>
  );
};

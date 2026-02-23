import { useGameStore } from "../stores/gameStore";
import { useConnectionStore } from "../stores/connectionStore";

const STATUS_COLOR: Record<string, string> = {
  connected: "#4caf50",
  connecting: "#ff9800",
  disconnected: "#9e9e9e",
  error: "#f44336",
};

export const Header: React.FC = () => {
  const gameName = useGameStore((s) => s.gameName);
  const algorithmName = useGameStore((s) => s.algorithmName);
  const setGame = useGameStore((s) => s.setGame);
  const setAlgorithm = useGameStore((s) => s.setAlgorithm);
  const status = useConnectionStore((s) => s.status);

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "8px 16px",
        background: "#1a1a2e",
        color: "white",
        flexShrink: 0,
      }}
    >
      <span style={{ fontWeight: "bold", fontSize: 15, marginRight: 8 }}>
        Board Game Algorithm Visualizer
      </span>

      <label style={{ fontSize: 13 }}>
        ゲーム:{" "}
        <select
          value={gameName}
          onChange={(e) => setGame(e.target.value)}
          style={{ marginLeft: 4 }}
        >
          <option value="tic_tac_toe">三目並べ</option>
          <option value="kings_valley">Kings Valley</option>
        </select>
      </label>

      <label style={{ fontSize: 13 }}>
        アルゴリズム:{" "}
        <select
          value={algorithmName}
          onChange={(e) => setAlgorithm(e.target.value)}
          style={{ marginLeft: 4 }}
        >
          <option value="minimax">Minimax</option>
          <option value="alpha_beta">Alpha-Beta</option>
        </select>
      </label>

      <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: STATUS_COLOR[status] ?? "#9e9e9e",
            display: "inline-block",
          }}
        />
        {status}
      </span>
    </header>
  );
};

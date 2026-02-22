import { useTreeStore } from "../../stores/treeStore";
import { useGameStore } from "../../stores/gameStore";
import { getGameRenderer } from "../../utils/gameRenderers";
import { getNodeData } from "../../utils/treeLayout";

export const NodeDetail: React.FC = () => {
  const events = useTreeStore((s) => s.events);
  const currentStep = useTreeStore((s) => s.currentStep);
  const selectedNodeId = useTreeStore((s) => s.selectedNodeId);
  const selectNode = useTreeStore((s) => s.selectNode);
  const gameName = useGameStore((s) => s.gameName);
  const renderer = getGameRenderer(gameName);

  if (!selectedNodeId) return null;

  const nodeData = getNodeData(events, currentStep, selectedNodeId);
  if (!nodeData) return null;

  const { state, value, isPruned, alpha, beta, move } = nodeData;

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 6,
        padding: 12,
        background: "white",
        minWidth: 160,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <strong style={{ fontSize: 13 }}>ノード詳細</strong>
        <button
          onClick={() => selectNode(null)}
          style={{ border: "none", background: "none", cursor: "pointer", fontSize: 14, color: "#888" }}
        >
          ✕
        </button>
      </div>

      {renderer && (
        <div style={{ marginBottom: 8 }}>
          <renderer.MiniBoardComponent state={state} size={120} />
        </div>
      )}

      <table style={{ fontSize: 12, width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {move !== null && (
            <tr>
              <td style={{ color: "#666", paddingRight: 8 }}>手</td>
              <td>position: {move.position}</td>
            </tr>
          )}
          <tr>
            <td style={{ color: "#666", paddingRight: 8 }}>評価値</td>
            <td>{value !== null ? (value > 0 ? `+${value}` : String(value)) : "—"}</td>
          </tr>
          <tr>
            <td style={{ color: "#666", paddingRight: 8 }}>枝刈り</td>
            <td>{isPruned ? "あり" : "なし"}</td>
          </tr>
          {isPruned && alpha !== null && beta !== null && (
            <tr>
              <td style={{ color: "#666", paddingRight: 8 }}>α / β</td>
              <td>{alpha} / {beta}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

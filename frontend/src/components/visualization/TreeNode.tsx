import { Handle, Position } from "@xyflow/react";
import type { Node, NodeProps } from "@xyflow/react";
import { useTreeStore } from "../../stores/treeStore";
import { useGameStore } from "../../stores/gameStore";
import { getGameRenderer } from "../../utils/gameRenderers";
import type { TreeNodeData } from "../../utils/treeLayout";

const MINI_SIZE = 90;

export type TicTacToeTreeNode = Node<TreeNodeData, "treeNode">;

export const TreeNode: React.FC<NodeProps<TicTacToeTreeNode>> = ({ data, id }) => {
  const selectedNodeId = useTreeStore((s) => s.selectedNodeId);
  const selectNode = useTreeStore((s) => s.selectNode);
  const gameName = useGameStore((s) => s.gameName);
  const renderer = getGameRenderer(gameName);

  const isSelected = selectedNodeId === id;
  const { isPruned, value } = data;

  const borderColor = isSelected ? "#f9a825" : isPruned ? "#bdbdbd" : "#1e88e5";
  const bg = isPruned ? "#f5f5f5" : "white";

  return (
    <div
      onClick={() => selectNode(isSelected ? null : id)}
      style={{
        border: `2px solid ${borderColor}`,
        borderRadius: 6,
        background: bg,
        padding: 4,
        cursor: "pointer",
        width: MINI_SIZE + 8,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ visibility: "hidden" }} />

      {renderer && (
        <renderer.MiniBoardComponent state={data.state} size={MINI_SIZE} />
      )}

      {value !== null && (
        <div
          style={{
            textAlign: "center",
            fontSize: 11,
            color: isPruned ? "#9e9e9e" : "#333",
            marginTop: 2,
          }}
        >
          {value > 0 ? `+${value}` : String(value)}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ visibility: "hidden" }} />
    </div>
  );
};

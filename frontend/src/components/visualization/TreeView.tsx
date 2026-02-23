import { useMemo } from "react";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTreeStore } from "../../stores/treeStore";
import { buildTreeFromEvents } from "../../utils/treeLayout";
import { TreeNode } from "./TreeNode";

const nodeTypes = { treeNode: TreeNode };

export const TreeView: React.FC = () => {
  const events = useTreeStore((s) => s.events);
  const currentStep = useTreeStore((s) => s.currentStep);
  const expandedNodeIds = useTreeStore((s) => s.expandedNodeIds);

  const { nodes, edges } = useMemo(
    () => buildTreeFromEvents(events, currentStep, expandedNodeIds),
    [events, currentStep, expandedNodeIds],
  );

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
};

import { useMemo, useEffect, useRef } from "react";
import { ReactFlow, Background, Controls, useReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTreeStore } from "../../stores/treeStore";
import { buildTreeFromEvents } from "../../utils/treeLayout";
import { TreeNode } from "./TreeNode";

const nodeTypes = { treeNode: TreeNode };

// expandedNodeIds が変わったとき（展開/折りたたみ）に自動で fitView を呼ぶ
const FitViewOnExpand: React.FC<{ expandedNodeIds: Set<string> }> = ({ expandedNodeIds }) => {
  const { fitView } = useReactFlow();
  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    fitView({ padding: 0.2, duration: 300 });
  }, [expandedNodeIds, fitView]);
  return null;
};

export const TreeView: React.FC = () => {
  const events = useTreeStore((s) => s.events);
  const currentStep = useTreeStore((s) => s.currentStep);
  const expandedNodeIds = useTreeStore((s) => s.expandedNodeIds);
  const selectedNodeId = useTreeStore((s) => s.selectedNodeId);
  const selectNode = useTreeStore((s) => s.selectNode);
  const toggleExpand = useTreeStore((s) => s.toggleExpand);

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
        onNodeClick={(_, node) => {
          selectNode(node.id === selectedNodeId ? null : node.id);
          toggleExpand(node.id);
        }}
      >
        <FitViewOnExpand expandedNodeIds={expandedNodeIds} />
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
};

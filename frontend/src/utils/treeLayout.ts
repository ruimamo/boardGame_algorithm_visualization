import { stratify, tree } from "d3-hierarchy";
import type { Node as ReactFlowNode, Edge as ReactFlowEdge } from "@xyflow/react";
import type { SearchEvent } from "../types/websocket";
import type { GameBoardState, MoveDict } from "../types/game";

export interface TreeNodeData extends Record<string, unknown> {
  id: string;
  parentId: string | null;
  move: MoveDict | null;
  state: GameBoardState;
  value: number | null;
  isPruned: boolean;
  alpha: number | null;
  beta: number | null;
  hasHiddenChildren: boolean;
}

function buildNodeMap(
  events: SearchEvent[],
  currentStep: number,
): Map<string, TreeNodeData> {
  const nodeMap = new Map<string, TreeNodeData>();

  for (let i = 0; i <= currentStep && i < events.length; i++) {
    const event = events[i];
    switch (event.type) {
      case "node_expanded":
        nodeMap.set(event.id, {
          id: event.id,
          parentId: event.parent_id,
          move: event.move,
          state: event.state,
          value: null,
          isPruned: false,
          alpha: null,
          beta: null,
          hasHiddenChildren: false,
        });
        break;
      case "node_evaluated": {
        const node = nodeMap.get(event.id);
        if (node) node.value = event.value;
        break;
      }
      case "node_pruned": {
        const node = nodeMap.get(event.id);
        if (node) {
          node.isPruned = true;
          node.alpha = event.alpha;
          node.beta = event.beta;
        }
        break;
      }
      default:
        break;
    }
  }

  return nodeMap;
}

export function buildTreeFromEvents(
  events: SearchEvent[],
  currentStep: number,
  expandedNodeIds: Set<string> = new Set(),
): { nodes: ReactFlowNode<TreeNodeData>[]; edges: ReactFlowEdge[] } {
  const nodeMap = buildNodeMap(events, currentStep);

  if (nodeMap.size === 0) {
    return { nodes: [], edges: [] };
  }

  const nodeArray = Array.from(nodeMap.values());

  // Step 1: 全ノードで hierarchy を構築して depth を確定する
  const fullRoot = stratify<TreeNodeData>()
    .id((d) => d.id)
    .parentId((d) => d.parentId)(nodeArray);

  // Step 2: 可視ノード ID を BFS で決定
  // 条件: depth <= 2 OR (親が可視 && 親.id ∈ expandedNodeIds)
  const visibleIds = new Set<string>();
  fullRoot.each((d) => {
    if (d.depth <= 2) {
      visibleIds.add(d.data.id);
    } else {
      const parentId = d.parent?.data.id;
      if (parentId && visibleIds.has(parentId) && expandedNodeIds.has(parentId)) {
        visibleIds.add(d.data.id);
      }
    }
  });

  // Step 3: 可視ノードに hasHiddenChildren を設定
  fullRoot.each((d) => {
    if (visibleIds.has(d.data.id) && d.children) {
      d.data.hasHiddenChildren = d.children.some((c) => !visibleIds.has(c.data.id));
    }
  });

  // Step 4: 可視ノードのみで hierarchy とレイアウトを再構築
  // → 非表示の子孫を無視した詰まったレイアウトになる
  const visibleArray = nodeArray.filter((n) => visibleIds.has(n.id));

  const visibleRoot = stratify<TreeNodeData>()
    .id((d) => d.id)
    .parentId((d) => d.parentId)(visibleArray);

  const treeLayout = tree<TreeNodeData>().nodeSize([120, 160])(visibleRoot);

  // Step 5: ReactFlow ノードとエッジを生成
  const nodes: ReactFlowNode<TreeNodeData>[] = [];
  const edges: ReactFlowEdge[] = [];

  treeLayout.each((d) => {
    nodes.push({
      id: d.data.id,
      position: { x: d.x, y: d.y },
      data: { ...d.data },
      type: "treeNode",
    });
    if (d.parent) {
      edges.push({
        id: `${d.parent.data.id}-${d.data.id}`,
        source: d.parent.data.id,
        target: d.data.id,
      });
    }
  });

  return { nodes, edges };
}

export function getNodeData(
  events: SearchEvent[],
  currentStep: number,
  nodeId: string,
): TreeNodeData | undefined {
  return buildNodeMap(events, currentStep).get(nodeId);
}

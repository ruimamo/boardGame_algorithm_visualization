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
): { nodes: ReactFlowNode<TreeNodeData>[]; edges: ReactFlowEdge[] } {
  const nodeMap = buildNodeMap(events, currentStep);

  if (nodeMap.size === 0) {
    return { nodes: [], edges: [] };
  }

  const nodeArray = Array.from(nodeMap.values());

  const root = stratify<TreeNodeData>()
    .id((d) => d.id)
    .parentId((d) => d.parentId)(nodeArray);

  const treeRoot = tree<TreeNodeData>().nodeSize([120, 160])(root);

  const nodes: ReactFlowNode<TreeNodeData>[] = [];
  const edges: ReactFlowEdge[] = [];

  treeRoot.each((d) => {
    nodes.push({
      id: d.data.id,
      position: { x: d.x, y: d.y },
      data: d.data,
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

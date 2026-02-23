import math
import random
from typing import Any

from algorithms.base import AlgorithmPlugin, EmitEvent
from games.base import GamePlugin, State, Move

_C = math.sqrt(2)  # UCB探索定数
_MAX_SIM_DEPTH = 200  # シミュレーションの最大深さ


class MCTSNode:
    def __init__(
        self,
        state: State,
        node_id: str,
        parent: "MCTSNode | None" = None,
        move: Move | None = None,
    ):
        self.node_id = node_id
        self.state = state
        self.parent = parent
        self.move = move
        self.children: list["MCTSNode"] = []
        self.visits: int = 0
        self.value_sum: float = 0.0
        self.untried_moves: list | None = None  # None = 未初期化

    @property
    def win_rate(self) -> float:
        return self.value_sum / self.visits if self.visits > 0 else 0.0

    def ucb(self, current_player: int) -> float:
        """親ノードでの手番プレイヤー視点の UCB スコア。"""
        if self.visits == 0:
            return float("inf")
        exploitation = current_player * self.win_rate
        exploration = _C * math.sqrt(math.log(self.parent.visits) / self.visits)  # type: ignore[union-attr]
        return exploitation + exploration


class MCTS(AlgorithmPlugin):
    """モンテカルロ木探索アルゴリズム"""

    name = "mcts"

    def search(
        self,
        game: GamePlugin,
        state: State,
        emit_event: EmitEvent,
        iterations: int = 50,
        **kwargs: Any,
    ) -> dict[str, Any]:
        self._counter = 0
        root = self._new_node(state)

        emit_event({
            "type": "node_expanded",
            "id": root.node_id,
            "parent_id": None,
            "move": None,
            "state": game.state_to_dict(state),
        })

        for _ in range(iterations):
            node = self._select(game, root, emit_event)
            node = self._expand(game, node, emit_event)
            result = self._simulate(game, node, emit_event)
            self._backpropagate(node, result, emit_event)

        best_move = None
        if root.children:
            best_child = max(root.children, key=lambda c: c.visits)
            best_move = best_child.move

        emit_event({
            "type": "search_complete",
            "best_move": game.move_to_dict(best_move) if best_move else None,
            "total_nodes": self._counter,
        })

        return {"best_move": best_move, "value": root.win_rate}

    # ------------------------------------------------------------------
    # 内部メソッド
    # ------------------------------------------------------------------

    def _new_node(
        self,
        state: State,
        parent: MCTSNode | None = None,
        move: Move | None = None,
    ) -> MCTSNode:
        node = MCTSNode(state, str(self._counter), parent, move)
        self._counter += 1
        return node

    def _select(
        self, game: GamePlugin, node: MCTSNode, emit_event: EmitEvent
    ) -> MCTSNode:
        """UCB に従って展開対象ノードを選択する。"""
        while not game.is_terminal(node.state):
            if node.untried_moves is None:
                node.untried_moves = game.get_legal_moves(node.state)

            if node.untried_moves:
                return node  # 未展開の手あり → 展開フェーズへ

            # 完全展開済み → UCB 最大の子へ移動
            current_player = game.get_current_player(node.state)
            best = max(node.children, key=lambda c: c.ucb(current_player))
            ucb_val = best.ucb(current_player)

            emit_event({
                "type": "node_selected",
                "id": best.node_id,
                "ucb_value": round(ucb_val, 4) if ucb_val != float("inf") else 999.0,
            })

            node = best

        return node

    def _expand(
        self, game: GamePlugin, node: MCTSNode, emit_event: EmitEvent
    ) -> MCTSNode:
        """未試行の手を 1 つ選んで子ノードを展開する。"""
        if game.is_terminal(node.state) or not node.untried_moves:
            return node

        move = node.untried_moves.pop(random.randrange(len(node.untried_moves)))
        new_state = game.apply_move(node.state, move)
        child = self._new_node(new_state, parent=node, move=move)
        node.children.append(child)

        emit_event({
            "type": "node_expanded",
            "id": child.node_id,
            "parent_id": node.node_id,
            "move": game.move_to_dict(move),
            "state": game.state_to_dict(new_state),
        })

        return child

    def _simulate(
        self, game: GamePlugin, node: MCTSNode, emit_event: EmitEvent
    ) -> float:
        """ランダムプレイアウトで終局まで進め、結果を返す。"""
        state = node.state
        depth = 0
        while not game.is_terminal(state) and depth < _MAX_SIM_DEPTH:
            moves = game.get_legal_moves(state)
            if not moves:
                break
            state = game.apply_move(state, random.choice(moves))
            depth += 1

        result = game.evaluate(state) or 0.0

        emit_event({
            "type": "simulation_done",
            "id": node.node_id,
            "result": result,
        })

        return result

    def _backpropagate(
        self, node: MCTSNode, result: float, emit_event: EmitEvent
    ) -> None:
        """結果をリーフからルートまで逆伝播する。"""
        current: MCTSNode | None = node
        while current is not None:
            current.visits += 1
            current.value_sum += result
            emit_event({
                "type": "backpropagated",
                "id": current.node_id,
                "visits": current.visits,
                "win_rate": round(current.win_rate, 4),
            })
            current = current.parent

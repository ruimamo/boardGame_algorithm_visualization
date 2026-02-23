from typing import Any

from algorithms.base import AlgorithmPlugin, EmitEvent
from games.base import GamePlugin, State, Move


class Minimax(AlgorithmPlugin):
    """Minimax探索アルゴリズム"""

    name = "minimax"

    def search(self, game: GamePlugin, state: State, emit_event: EmitEvent, max_depth: int | None = None, **kwargs: Any) -> dict[str, Any]:
        self._node_counter = 0
        best_move, value = self._minimax(game, state, emit_event, parent_id=None, depth=0, max_depth=max_depth)
        emit_event({
            "type": "search_complete",
            "best_move": game.move_to_dict(best_move) if best_move is not None else None,
            "total_nodes": self._node_counter,
        })
        return {"best_move": best_move, "value": value}

    def _minimax(
        self,
        game: GamePlugin,
        state: State,
        emit_event: EmitEvent,
        parent_id: str | None,
        depth: int = 0,
        max_depth: int | None = None,
        move: Move | None = None,
    ) -> tuple[Move | None, float]:
        node_id = str(self._node_counter)
        self._node_counter += 1

        emit_event({
            "type": "node_expanded",
            "id": node_id,
            "parent_id": parent_id,
            "move": game.move_to_dict(move) if move is not None else None,
            "state": game.state_to_dict(state),
        })

        if game.is_terminal(state) or (max_depth is not None and depth >= max_depth):
            value = game.evaluate(state) or 0.0
            emit_event({
                "type": "node_evaluated",
                "id": node_id,
                "value": value,
            })
            return None, value

        player = game.get_current_player(state)
        is_maximizing = player == 1

        best_move = None
        best_value = float("-inf") if is_maximizing else float("inf")

        for m in game.get_legal_moves(state):
            next_state = game.apply_move(state, m)
            _, value = self._minimax(game, next_state, emit_event, node_id, depth + 1, max_depth, m)

            if is_maximizing:
                if value > best_value:
                    best_value = value
                    best_move = m
            else:
                if value < best_value:
                    best_value = value
                    best_move = m

        emit_event({
            "type": "node_evaluated",
            "id": node_id,
            "value": best_value,
        })
        return best_move, best_value

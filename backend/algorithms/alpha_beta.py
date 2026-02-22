from typing import Any

from algorithms.base import AlgorithmPlugin, EmitEvent
from games.base import GamePlugin, State, Move


class AlphaBeta(AlgorithmPlugin):
    """Alpha-Beta枝刈り探索アルゴリズム"""

    name = "alpha_beta"

    def search(self, game: GamePlugin, state: State, emit_event: EmitEvent) -> dict[str, Any]:
        self._node_counter = 0
        best_move, value = self._alpha_beta(
            game, state, emit_event,
            alpha=float("-inf"), beta=float("inf"),
            parent_id=None,
        )
        emit_event({
            "type": "search_complete",
            "best_move": game.move_to_dict(best_move) if best_move is not None else None,
            "total_nodes": self._node_counter,
        })
        return {"best_move": best_move, "value": value}

    def _alpha_beta(
        self,
        game: GamePlugin,
        state: State,
        emit_event: EmitEvent,
        alpha: float,
        beta: float,
        parent_id: str | None,
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

        if game.is_terminal(state):
            value = game.evaluate(state)
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
            _, value = self._alpha_beta(
                game, next_state, emit_event,
                alpha, beta, node_id, m,
            )

            if is_maximizing:
                if value > best_value:
                    best_value = value
                    best_move = m
                alpha = max(alpha, value)
            else:
                if value < best_value:
                    best_value = value
                    best_move = m
                beta = min(beta, value)

            if beta <= alpha:
                emit_event({
                    "type": "node_pruned",
                    "id": node_id,
                    "alpha": alpha,
                    "beta": beta,
                })
                break

        emit_event({
            "type": "node_evaluated",
            "id": node_id,
            "value": best_value,
        })
        return best_move, best_value

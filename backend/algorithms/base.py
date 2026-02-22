from abc import ABC, abstractmethod
from typing import Any, Callable

from games.base import GamePlugin, State

EmitEvent = Callable[[dict[str, Any]], None]


class AlgorithmPlugin(ABC):
    """探索アルゴリズムの抽象基底クラス"""

    @property
    @abstractmethod
    def name(self) -> str:
        """アルゴリズム名を返す (例: "minimax")"""
        ...

    @abstractmethod
    def search(
        self,
        game: GamePlugin,
        state: State,
        emit_event: EmitEvent,
    ) -> dict[str, Any]:
        """
        探索を実行し、各ステップで emit_event を呼び出す。

        Args:
            game: ゲームプラグインインスタンス
            state: 現在の盤面状態
            emit_event: イベントを送出するコールバック関数

        Returns:
            {"best_move": Move, "value": float}
        """
        ...

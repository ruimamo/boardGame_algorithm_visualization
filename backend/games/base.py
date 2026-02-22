from abc import ABC, abstractmethod
from typing import Any

State = Any
Move = Any


class GamePlugin(ABC):
    """ゲームロジックの抽象基底クラス"""

    @property
    @abstractmethod
    def name(self) -> str:
        """ゲーム名を返す (例: "tic_tac_toe")"""
        ...

    @abstractmethod
    def get_initial_state(self) -> State:
        """初期盤面を返す"""
        ...

    @abstractmethod
    def get_current_player(self, state: State) -> int:
        """現在の手番プレイヤーを返す (1 or -1)"""
        ...

    @abstractmethod
    def get_legal_moves(self, state: State) -> list[Move]:
        """合法手のリストを返す"""
        ...

    @abstractmethod
    def apply_move(self, state: State, move: Move) -> State:
        """手を適用した新しい状態を返す（元の状態は変更しない）"""
        ...

    @abstractmethod
    def is_terminal(self, state: State) -> bool:
        """終局かどうかを判定する"""
        ...

    @abstractmethod
    def evaluate(self, state: State) -> float | None:
        """
        終局状態の評価値を返す。
        先手勝ち: +1, 後手勝ち: -1, 引き分け: 0
        非終局状態では None を返す。
        """
        ...

    @abstractmethod
    def state_to_dict(self, state: State) -> dict:
        """状態をJSON直列化可能な辞書に変換する"""
        ...

    @abstractmethod
    def move_to_dict(self, move: Move) -> dict:
        """手をJSON直列化可能な辞書に変換する"""
        ...

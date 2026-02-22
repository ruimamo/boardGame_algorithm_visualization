from games.base import GamePlugin

WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],  # 横
    [0, 3, 6], [1, 4, 7], [2, 5, 8],  # 縦
    [0, 4, 8], [2, 4, 6],              # 斜め
]


class TicTacToe(GamePlugin):
    """
    三目並べのゲームロジック。

    状態: list[int] — 長さ9, 0=空, 1=先手(X), -1=後手(O)
    手: int — 0〜8のインデックス
    """

    name = "tic_tac_toe"

    def get_initial_state(self) -> list[int]:
        return [0] * 9

    def get_current_player(self, state: list[int]) -> int:
        return 1 if state.count(1) == state.count(-1) else -1

    def get_legal_moves(self, state: list[int]) -> list[int]:
        return [i for i, v in enumerate(state) if v == 0]

    def apply_move(self, state: list[int], move: int) -> list[int]:
        new_state = state.copy()
        new_state[move] = self.get_current_player(state)
        return new_state

    def is_terminal(self, state: list[int]) -> bool:
        return self.evaluate(state) is not None

    def evaluate(self, state: list[int]) -> float | None:
        for line in WIN_LINES:
            s = sum(state[i] for i in line)
            if s == 3:
                return 1.0
            if s == -3:
                return -1.0
        if 0 not in state:
            return 0.0
        return None

    def state_to_dict(self, state: list[int]) -> dict:
        return {"board": state}

    def move_to_dict(self, move: int) -> dict:
        return {"position": move}

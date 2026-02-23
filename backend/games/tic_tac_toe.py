from games.base import GamePlugin

WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],  # 横
    [0, 3, 6], [1, 4, 7], [2, 5, 8],  # 縦
    [0, 4, 8], [2, 4, 6],              # 斜め
]


class TicTacToe(GamePlugin):
    """
    三目並べのゲームロジック。

    状態: {"board": list[int]} — 長さ9, 0=空, 1=先手(X), -1=後手(O)
    手:   {"position": int}    — 0〜8のインデックス
    """

    name = "tic_tac_toe"

    def get_initial_state(self) -> dict:
        return {"board": [0] * 9}

    def get_current_player(self, state: dict) -> int:
        board = state["board"]
        return 1 if board.count(1) == board.count(-1) else -1

    def get_legal_moves(self, state: dict) -> list[dict]:
        return [{"position": i} for i, v in enumerate(state["board"]) if v == 0]

    def apply_move(self, state: dict, move: dict) -> dict:
        board = state["board"].copy()
        board[move["position"]] = self.get_current_player(state)
        return {"board": board}

    def is_terminal(self, state: dict) -> bool:
        return self.evaluate(state) is not None

    def evaluate(self, state: dict) -> float | None:
        board = state["board"]
        for line in WIN_LINES:
            s = sum(board[i] for i in line)
            if s == 3:
                return 1.0
            if s == -3:
                return -1.0
        if 0 not in board:
            return 0.0
        return None

    def state_to_dict(self, state: dict) -> dict:
        return state

    def move_to_dict(self, move: dict) -> dict:
        return move

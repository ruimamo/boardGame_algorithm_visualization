from games.tic_tac_toe import TicTacToe
from algorithms.minimax import Minimax


game = TicTacToe()
algorithm = Minimax()


class TestMinimaxSearch:
    def test_initial_state_returns_result(self):
        events = []
        result = algorithm.search(game, game.get_initial_state(), events.append)
        assert result["best_move"] is not None
        assert isinstance(result["value"], float)

    def test_finds_winning_move(self):
        # X X .
        # O O .
        # . . .
        # 先手番: position 2 で勝ち
        state = [1, 1, 0, -1, -1, 0, 0, 0, 0]
        events = []
        result = algorithm.search(game, state, events.append)
        assert result["best_move"] == 2
        assert result["value"] == 1.0

    def test_blocks_opponent_win(self):
        # O O .
        # X . .
        # X . .
        # 先手番: position 2 でブロックしないと後手が勝つ
        state = [-1, -1, 0, 1, 0, 0, 1, 0, 0]
        events = []
        result = algorithm.search(game, state, events.append)
        assert result["best_move"] == 2


class TestMinimaxEvents:
    def test_emits_node_expanded(self):
        events = []
        algorithm.search(game, game.get_initial_state(), events.append)
        expanded = [e for e in events if e["type"] == "node_expanded"]
        assert len(expanded) > 0
        assert expanded[0]["id"] == "0"
        assert expanded[0]["parent_id"] is None

    def test_emits_node_evaluated(self):
        events = []
        algorithm.search(game, game.get_initial_state(), events.append)
        evaluated = [e for e in events if e["type"] == "node_evaluated"]
        assert len(evaluated) > 0

    def test_emits_search_complete(self):
        events = []
        algorithm.search(game, game.get_initial_state(), events.append)
        complete = [e for e in events if e["type"] == "search_complete"]
        assert len(complete) == 1
        assert "best_move" in complete[0]
        assert "total_nodes" in complete[0]
        assert complete[0]["total_nodes"] > 0

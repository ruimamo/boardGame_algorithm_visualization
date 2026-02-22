from games.tic_tac_toe import TicTacToe
from algorithms.minimax import Minimax
from algorithms.alpha_beta import AlphaBeta


game = TicTacToe()
minimax = Minimax()
alpha_beta = AlphaBeta()


class TestAlphaBetaSearch:
    def test_same_result_as_minimax(self):
        """Alpha-Beta は Minimax と同じ最善手・評価値を返す"""
        state = game.get_initial_state()
        mm_result = minimax.search(game, state, lambda e: None)
        ab_result = alpha_beta.search(game, state, lambda e: None)
        assert ab_result["best_move"] == mm_result["best_move"]
        assert ab_result["value"] == mm_result["value"]

    def test_finds_winning_move(self):
        state = [1, 1, 0, -1, -1, 0, 0, 0, 0]
        events = []
        result = alpha_beta.search(game, state, events.append)
        assert result["best_move"] == 2
        assert result["value"] == 1.0

    def test_blocks_opponent_win(self):
        state = [-1, -1, 0, 1, 0, 0, 1, 0, 0]
        events = []
        result = alpha_beta.search(game, state, events.append)
        assert result["best_move"] == 2


class TestAlphaBetaPruning:
    def test_fewer_nodes_than_minimax(self):
        """枝刈りにより Minimax より探索ノード数が少ない"""
        state = game.get_initial_state()
        mm_events = []
        ab_events = []
        minimax.search(game, state, mm_events.append)
        alpha_beta.search(game, state, ab_events.append)

        mm_nodes = [e for e in mm_events if e["type"] == "node_expanded"]
        ab_nodes = [e for e in ab_events if e["type"] == "node_expanded"]
        assert len(ab_nodes) < len(mm_nodes)

    def test_emits_node_pruned(self):
        """Alpha-Beta は node_pruned イベントを送出する"""
        events = []
        alpha_beta.search(game, game.get_initial_state(), events.append)
        pruned = [e for e in events if e["type"] == "node_pruned"]
        assert len(pruned) > 0
        assert "alpha" in pruned[0]
        assert "beta" in pruned[0]


class TestAlphaBetaEvents:
    def test_emits_search_complete(self):
        events = []
        alpha_beta.search(game, game.get_initial_state(), events.append)
        complete = [e for e in events if e["type"] == "search_complete"]
        assert len(complete) == 1
        assert complete[0]["total_nodes"] > 0

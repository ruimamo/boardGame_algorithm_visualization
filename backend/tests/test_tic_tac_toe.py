from games.tic_tac_toe import TicTacToe


game = TicTacToe()


class TestInitialState:
    def test_empty_board(self):
        state = game.get_initial_state()
        assert state == [0] * 9

    def test_first_player_is_x(self):
        state = game.get_initial_state()
        assert game.get_current_player(state) == 1


class TestLegalMoves:
    def test_all_moves_on_empty_board(self):
        state = game.get_initial_state()
        assert game.get_legal_moves(state) == list(range(9))

    def test_moves_decrease_after_play(self):
        state = game.apply_move(game.get_initial_state(), 4)
        moves = game.get_legal_moves(state)
        assert len(moves) == 8
        assert 4 not in moves


class TestApplyMove:
    def test_correct_board_after_move(self):
        state = game.get_initial_state()
        new_state = game.apply_move(state, 0)
        assert new_state[0] == 1

    def test_original_state_unchanged(self):
        state = game.get_initial_state()
        game.apply_move(state, 0)
        assert state == [0] * 9

    def test_alternating_players(self):
        s0 = game.get_initial_state()
        s1 = game.apply_move(s0, 0)  # 先手
        s2 = game.apply_move(s1, 1)  # 後手
        assert s1[0] == 1
        assert s2[1] == -1
        assert game.get_current_player(s2) == 1


class TestEvaluate:
    def test_horizontal_win(self):
        # X X X
        # O O .
        # . . .
        state = [1, 1, 1, -1, -1, 0, 0, 0, 0]
        assert game.evaluate(state) == 1.0

    def test_vertical_win(self):
        # X O .
        # X O .
        # X . .
        state = [1, -1, 0, 1, -1, 0, 1, 0, 0]
        assert game.evaluate(state) == 1.0

    def test_diagonal_win(self):
        # X O .
        # . X O
        # . . X
        state = [1, -1, 0, 0, 1, -1, 0, 0, 1]
        assert game.evaluate(state) == 1.0

    def test_o_wins(self):
        # O O O
        # X X .
        # X . .
        state = [-1, -1, -1, 1, 1, 0, 1, 0, 0]
        assert game.evaluate(state) == -1.0

    def test_draw(self):
        # X O X
        # X X O
        # O X O
        state = [1, -1, 1, 1, 1, -1, -1, 1, -1]
        assert game.evaluate(state) == 0.0

    def test_non_terminal_returns_none(self):
        state = game.get_initial_state()
        assert game.evaluate(state) is None


class TestIsTerminal:
    def test_initial_state_not_terminal(self):
        assert game.is_terminal(game.get_initial_state()) is False

    def test_win_is_terminal(self):
        state = [1, 1, 1, -1, -1, 0, 0, 0, 0]
        assert game.is_terminal(state) is True

    def test_draw_is_terminal(self):
        state = [1, -1, 1, 1, 1, -1, -1, 1, -1]
        assert game.is_terminal(state) is True

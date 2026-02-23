import sys
import copy
from games.base import GamePlugin

class KingsValleyBoard:
    def __init__(self):
        self.board = [[0 for _ in range(5)] for _ in range(5)]
        self.turn = 1
        self.denyKingMove = True
        # Improved direction mapping for CLI input
        self.directions = {
            "w": (-1, 0), "s": (1, 0), "a": (0, -1), "d": (0, 1),
            "q": (-1, -1), "e": (-1, 1), "z": (1, -1), "c": (1, 1),
            # Keep original keys for compatibility/clarity
            "up": (-1, 0), "down": (1, 0), "left": (0, -1), "right": (0, 1),
            "up-left": (-1, -1), "up-right": (-1, 1), "down-left": (1, -1), "down-right": (1, 1)
        }

    def printBoard(self):
        print("   0  1  2  3  4")
        print("  ---------------")
        for i, row in enumerate(self.board):
            print(f"{i}|", end="")
            for cell in row:
                symbol = " . "
                if cell == 1: symbol = " V " # My Vassal
                elif cell == 2: symbol = " K " # My King
                elif cell == -1: symbol = " v " # Enemy Vassal
                elif cell == -2: symbol = " k " # Enemy King
                print(symbol, end="")
            print("|")
        print("  ---------------")

    def printTurn(self):
        player = "Player 1 (Capital)" if self.turn == 1 else "Player 2 (Lower)"
        print(f"Turn: {player}")

    def initBoard(self):
        self.board = [[-1, -1, -2, -1, -1],
                      [0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0],
                      [1, 1, 2, 1, 1]]
        self.turn = 1
        self.denyKingMove = True

    def _get_slide_dest(self, x1, y1, direction):
        """Calculates the destination of a slide move, if valid."""
        if self.turn == 1:
            myVassal = 1
            myKing = 2
            enemyVassal = -1
            enemyKing = -2
        else:
            myVassal = -1
            myKing = -2
            enemyVassal = 1
            enemyKing = 2
            
        try:
            peace = self.board[x1][y1]
        except IndexError:
            return None

        if peace != myVassal and peace != myKing:
            return None
        if peace == myKing and self.denyKingMove:
            return None
        
        dx, dy = self.directions[direction]
        
        # Initial check for immediate bounds or collision
        if not (0 <= x1 + dx <= 4 and 0 <= y1 + dy <= 4):
            return None
        
        target_cell = self.board[x1 + dx][y1 + dy]
        if target_cell != 0: 
             return None

        x2 = x1
        y2 = y1
        
        # Slide logic
        while 0 <= x2 + dx <= 4 and 0 <= y2 + dy <= 4 and self.board[x2 + dx][y2 + dy] == 0:
            x2 += dx
            y2 += dy
            
        # Check if it's the exact same position (didn't move)
        if x2 == x1 and y2 == y1:
            return None

        if peace == myVassal and x2 == 2 and y2 == 2:
            return None
            
        return (x2, y2)

    def move(self, x1, y1, direction):
        dest = self._get_slide_dest(x1, y1, direction)
        if dest is None:
            return False
            
        x2, y2 = dest
        peace = self.board[x1][y1]
        
        self.board[x1][y1] = 0
        self.board[x2][y2] = peace
        
        if self.turn == -1 and self.denyKingMove == True: 
            self.denyKingMove = False
        self.turn = -self.turn
        return True

    def get_valid_moves(self):
        """Returns a list of valid moves for the current turn.
           Each move is a tuple: (row, col, direction_key)
        """
        moves = []
        rows = len(self.board)
        cols = len(self.board[0])
        
        target_pieces = [1, 2] if self.turn == 1 else [-1, -2]
        
        for r in range(rows):
            for c in range(cols):
                if self.board[r][c] in target_pieces:
                    for direction in self.directions:
                        if direction in ["up", "down", "left", "right", "up-left", "up-right", "down-left", "down-right"]:
                             if self._get_slide_dest(r, c, direction) is not None:
                                 moves.append((r, c, direction))
        return moves

    def judge(self):
        if self.board[2][2] == 2:
            return 1
        elif self.board[2][2] == -2:
            return -1
        else:
            return 0
            
    def copy(self):
        """Creates a deep copy of the board state."""
        new_board = KingsValleyBoard()
        new_board.board = copy.deepcopy(self.board)
        new_board.turn = self.turn
        new_board.denyKingMove = self.denyKingMove
        return new_board

def main():
    game = KingsValleyBoard()
    game.initBoard()
    
    print("Welcome to Kings Valley!")
    print("P2: 'v' (vassal), 'k' (king) | P1: 'V' (vassal), 'K' (king)")
    print("Directions: w(up), s(down), a(left), d(right), q(ul), e(ur), z(dl), c(dr)")
    # Directions helper map for display
    dir_map = {
        'w': 'up', 's': 'down', 'a': 'left', 'd': 'right',
        'q': 'up-left', 'e': 'up-right', 'z': 'down-left', 'c': 'down-right'
    }

    while True:
        game.printBoard()
        game.printTurn()
        
        winner = game.judge()
        if winner != 0:
            print(f"Game Over! Winner: {'Player 1' if winner == 1 else 'Player 2'}")
            break

        try:
            print("Enter move (row col direction): ", end="")
            user_input = input().strip().split()
            if not user_input: continue
            if user_input[0] == 'exit': break
            
            if len(user_input) != 3:
                print("Invalid format. Use: row col direction (e.g., '0 0 s')")
                continue
                
            r, c = int(user_input[0]), int(user_input[1])
            d_key = user_input[2]
            
            if d_key not in game.directions:
                 print(f"Invalid direction. Use keys: {list(dir_map.keys())}")
                 continue

            success = game.move(r, c, d_key)
            if not success:
                print("Invalid move! Try again.")
            
        except ValueError:
            print("Invalid input numbers.")
        except KeyboardInterrupt:
            print("\nExiting...")
            break

if __name__ == "__main__":
    main()


class KingsValleyPlugin(GamePlugin):
    """
    Kings Valley のゲームロジック。

    状態: {"board": list[list[int]], "turn": 1|-1, "denyKingMove": bool}
          board は 5x5 の 2次元リスト
          1=先手ヴァッサル, 2=先手キング, -1=後手ヴァッサル, -2=後手キング
    手:   {"from_row": int, "from_col": int, "direction": str}
          direction は "up"|"down"|"left"|"right"|"up-left"|"up-right"|"down-left"|"down-right"
    """

    name = "kings_valley"

    def _to_board(self, state: dict) -> "KingsValleyBoard":
        b = KingsValleyBoard()
        b.board = [row[:] for row in state["board"]]
        b.turn = state["turn"]
        b.denyKingMove = state["denyKingMove"]
        return b

    def get_initial_state(self) -> dict:
        b = KingsValleyBoard()
        b.initBoard()
        return {"board": [row[:] for row in b.board], "turn": b.turn, "denyKingMove": b.denyKingMove}

    def get_current_player(self, state: dict) -> int:
        return state["turn"]

    def get_legal_moves(self, state: dict) -> list[dict]:
        b = self._to_board(state)
        return [
            {"from_row": r, "from_col": c, "direction": d}
            for r, c, d in b.get_valid_moves()
            if d in ("up", "down", "left", "right", "up-left", "up-right", "down-left", "down-right")
        ]

    def apply_move(self, state: dict, move: dict) -> dict:
        b = self._to_board(state)
        b.move(move["from_row"], move["from_col"], move["direction"])
        return {"board": [row[:] for row in b.board], "turn": b.turn, "denyKingMove": b.denyKingMove}

    def is_terminal(self, state: dict) -> bool:
        board = state["board"]
        return board[2][2] in (2, -2)

    def evaluate(self, state: dict) -> float | None:
        board = state["board"]
        if board[2][2] == 2:
            return 1.0
        if board[2][2] == -2:
            return -1.0
        return None

    def state_to_dict(self, state: dict) -> dict:
        return state

    def move_to_dict(self, move: dict) -> dict:
        return move

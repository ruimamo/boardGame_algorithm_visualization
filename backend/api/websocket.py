from fastapi import WebSocket, WebSocketDisconnect

from games.base import GamePlugin
from algorithms.base import AlgorithmPlugin
from games.tic_tac_toe import TicTacToe
from games.kings_valley import KingsValleyPlugin
from algorithms.minimax import Minimax
from algorithms.alpha_beta import AlphaBeta

GAMES: dict[str, GamePlugin] = {}
ALGORITHMS: dict[str, AlgorithmPlugin] = {}


def register_plugins() -> None:
    for g in [TicTacToe(), KingsValleyPlugin()]:
        GAMES[g.name] = g
    for a in [Minimax(), AlphaBeta()]:
        ALGORITHMS[a.name] = a


async def websocket_endpoint(ws: WebSocket) -> None:
    await ws.accept()
    try:
        while True:
            data = await ws.receive_json()
            msg_type = data.get("type")

            if msg_type == "get_initial_state":
                await handle_get_initial_state(ws, data)
            elif msg_type == "apply_move":
                await handle_apply_move(ws, data)
            elif msg_type == "start_search":
                await handle_start_search(ws, data)
            else:
                await ws.send_json({"type": "error", "message": f"Unknown message type: {msg_type}"})
    except WebSocketDisconnect:
        pass


async def handle_get_initial_state(ws: WebSocket, data: dict) -> None:
    game_name = data.get("game")
    game = GAMES.get(game_name)
    if game is None:
        await ws.send_json({"type": "error", "message": f"Unknown game: {game_name}"})
        return

    state = game.get_initial_state()
    await ws.send_json({
        "type": "initial_state",
        "game": game_name,
        "state": game.state_to_dict(state),
        "current_player": game.get_current_player(state),
    })


async def handle_apply_move(ws: WebSocket, data: dict) -> None:
    game_name = data.get("game")
    game = GAMES.get(game_name)
    if game is None:
        await ws.send_json({"type": "error", "message": f"Unknown game: {game_name}"})
        return

    state = data["state"]
    move = data["move"]
    new_state = game.apply_move(state, move)

    result = None
    if game.is_terminal(new_state):
        value = game.evaluate(new_state)
        result = {"winner": int(value)}

    await ws.send_json({
        "type": "state_updated",
        "state": game.state_to_dict(new_state),
        "current_player": game.get_current_player(new_state),
        "is_terminal": game.is_terminal(new_state),
        "result": result,
        "legal_moves": [game.move_to_dict(m) for m in game.get_legal_moves(new_state)],
    })


async def handle_start_search(ws: WebSocket, data: dict) -> None:
    game_name = data.get("game")
    algorithm_name = data.get("algorithm")

    game = GAMES.get(game_name)
    if game is None:
        await ws.send_json({"type": "error", "message": f"Unknown game: {game_name}"})
        return

    algorithm = ALGORITHMS.get(algorithm_name)
    if algorithm is None:
        await ws.send_json({"type": "error", "message": f"Unknown algorithm: {algorithm_name}"})
        return

    state = data["state"]
    max_depth = 4 if game_name == "kings_valley" else None
    events: list[dict] = []
    result = algorithm.search(game, state, events.append, max_depth=max_depth)

    best_move = None
    if result["best_move"] is not None:
        best_move = game.move_to_dict(result["best_move"])

    await ws.send_json({
        "type": "search_result",
        "events": events,
        "best_move": best_move,
    })

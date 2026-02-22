from pydantic import BaseModel


# --- クライアント → サーバー ---

class GetInitialStateRequest(BaseModel):
    type: str = "get_initial_state"
    game: str


class ApplyMoveRequest(BaseModel):
    type: str = "apply_move"
    game: str
    state: dict
    move: dict


class StartSearchRequest(BaseModel):
    type: str = "start_search"
    game: str
    algorithm: str
    state: dict


# --- サーバー → クライアント ---

class InitialStateResponse(BaseModel):
    type: str = "initial_state"
    game: str
    state: dict
    current_player: int


class StateUpdatedResponse(BaseModel):
    type: str = "state_updated"
    state: dict
    current_player: int
    is_terminal: bool
    result: dict | None
    legal_moves: list[dict]


class SearchResultResponse(BaseModel):
    type: str = "search_result"
    events: list[dict]
    best_move: dict | None


class ErrorResponse(BaseModel):
    type: str = "error"
    message: str

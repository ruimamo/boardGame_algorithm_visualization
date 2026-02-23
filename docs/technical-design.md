# 技術設計書

## 1. ディレクトリ構成

```
boardGame_algorithm_visualization/
├── frontend/                    # React + TypeScript + Vite
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── public/
│   └── src/
│       ├── main.tsx             # エントリーポイント
│       ├── App.tsx
│       ├── components/
│       │   ├── Header.tsx                  # ゲーム・アルゴリズム選択
│       │   ├── MainLayout.tsx              # 2ペインレイアウト
│       │   ├── ControlBar.tsx              # 再生コントロール
│       │   ├── board/
│       │   │   └── TicTacToeBoard.tsx      # 三目並べ盤面 (SVG)
│       │   └── visualization/
│       │       ├── TreeView.tsx            # React Flow ツリー表示
│       │       ├── TreeNode.tsx            # カスタムノード
│       │       └── NodeDetail.tsx          # ノード詳細パネル
│       ├── stores/
│       │   ├── gameStore.ts               # 盤面・ゲーム状態
│       │   ├── treeStore.ts               # 探索ツリー・イベントログ
│       │   ├── playbackStore.ts           # 再生制御
│       │   └── connectionStore.ts         # WebSocket接続状態
│       ├── services/
│       │   └── websocket.ts               # WebSocketクライアント
│       ├── types/
│       │   ├── game.ts                    # ゲーム関連の型定義
│       │   ├── algorithm.ts               # アルゴリズム関連の型定義
│       │   └── websocket.ts               # WebSocketメッセージ型
│       ├── plugins/
│       │   ├── ticTacToe/
│       │   │   ├── index.ts               # GameRenderer登録
│       │   │   ├── Board.tsx              # 盤面コンポーネント
│       │   │   └── MiniBoard.tsx          # ツリーノード用ミニ盤面
│       │   └── kingsValley/
│       │       ├── index.ts               # GameRenderer登録
│       │       ├── Board.tsx              # 5×5盤面コンポーネント
│       │       └── MiniBoard.tsx          # ツリーノード用ミニ盤面
│       └── utils/
│           ├── gameRenderers.ts           # ゲーム名→GameRendererのレジストリ
│           └── treeLayout.ts              # d3-hierarchyレイアウト計算
│
├── backend/                     # Python + FastAPI
│   ├── pyproject.toml
│   ├── main.py                  # FastAPIアプリケーション起動
│   ├── api/
│   │   └── websocket.py         # WebSocketエンドポイント
│   ├── games/
│   │   ├── base.py              # GamePlugin ABC
│   │   ├── tic_tac_toe.py       # 三目並べ実装
│   │   └── kings_valley.py      # Kings Valley実装
│   ├── algorithms/
│   │   ├── base.py              # AlgorithmPlugin ABC
│   │   ├── minimax.py           # Minimax実装
│   │   └── alpha_beta.py        # Alpha-Beta実装
│   ├── schemas/
│   │   └── messages.py          # WebSocketメッセージ型 (Pydantic)
│   └── tests/
│       ├── test_tic_tac_toe.py
│       ├── test_minimax.py
│       └── test_alpha_beta.py
│
├── docs/
│   ├── PRD.md
│   └── technical-design.md      # 本ドキュメント
└── CLAUDE.md
```

## 2. バックエンド設計

### 2.1 GamePlugin インターフェース

```python
# backend/games/base.py
from abc import ABC, abstractmethod
from typing import Any

# 型エイリアス
State = Any  # ゲーム固有の状態型
Move = Any   # ゲーム固有の手の型

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
        """状態をJSON直列化可能な辞書に変換する（フロントエンドへの送信用）"""
        ...

    @abstractmethod
    def move_to_dict(self, move: Move) -> dict:
        """手をJSON直列化可能な辞書に変換する"""
        ...
```

#### 三目並べの実装

```python
# backend/games/tic_tac_toe.py
from games.base import GamePlugin

class TicTacToe(GamePlugin):
    """
    状態表現:
      board: list[int] — 長さ9の配列, 0=空, 1=先手(X), -1=後手(O)
      インデックスは左上から右下: [0,1,2,3,4,5,6,7,8]

    手の表現:
      int — 0〜8のインデックス
    """

    name = "tic_tac_toe"

    # 勝利ライン8パターン
    WIN_LINES = [
        [0,1,2],[3,4,5],[6,7,8],  # 横
        [0,3,6],[1,4,7],[2,5,8],  # 縦
        [0,4,8],[2,4,6],          # 斜め
    ]

    def get_initial_state(self) -> list[int]:
        return [0] * 9

    def get_current_player(self, state: list[int]) -> int:
        # 先手(1)の数 == 後手(-1)の数 なら先手の番
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
        for line in self.WIN_LINES:
            s = sum(state[i] for i in line)
            if s == 3:
                return 1.0   # 先手勝ち
            if s == -3:
                return -1.0  # 後手勝ち
        if 0 not in state:
            return 0.0  # 引き分け
        return None  # 非終局

    def state_to_dict(self, state: list[int]) -> dict:
        return {"board": state}

    def move_to_dict(self, move: int) -> dict:
        return {"position": move}
```

### 2.2 AlgorithmPlugin インターフェース

```python
# backend/algorithms/base.py
from abc import ABC, abstractmethod
from typing import Any, Callable
from games.base import GamePlugin, State

# イベント送出用コールバックの型
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
        max_depth: int | None = None,
    ) -> dict[str, Any]:
        """
        探索を実行し、各ステップで emit_event を呼び出す。

        Args:
            game: ゲームプラグインインスタンス
            state: 現在の盤面状態
            emit_event: イベントを送出するコールバック関数
            max_depth: 探索の最大深さ。None の場合は制限なし（三目並べ等の浅いゲーム向け）

        Returns:
            {"best_move": Move, "value": float}
        """
        ...
```

#### Minimax の実装方針

```python
# backend/algorithms/minimax.py
from algorithms.base import AlgorithmPlugin, EmitEvent
from games.base import GamePlugin, State

class Minimax(AlgorithmPlugin):
    name = "minimax"

    def search(self, game: GamePlugin, state: State, emit_event: EmitEvent, max_depth: int | None = None) -> dict:
        self._node_counter = 0
        best_move, value = self._minimax(game, state, emit_event, parent_id=None, depth=0, max_depth=max_depth)
        emit_event({
            "type": "search_complete",
            "best_move": game.move_to_dict(best_move) if best_move is not None else None,
            "total_nodes": self._node_counter,
        })
        return {"best_move": best_move, "value": value}

    def _minimax(
        self,
        game: GamePlugin,
        state: State,
        emit_event: EmitEvent,
        parent_id: str | None,
        depth: int = 0,
        max_depth: int | None = None,
        move=None,
    ) -> tuple:
        node_id = str(self._node_counter)
        self._node_counter += 1

        # ノード展開イベント
        emit_event({
            "type": "node_expanded",
            "id": node_id,
            "parent_id": parent_id,
            "move": game.move_to_dict(move) if move is not None else None,
            "state": game.state_to_dict(state),
        })

        # 終局判定 or 深さ制限
        if game.is_terminal(state) or (max_depth is not None and depth >= max_depth):
            value = game.evaluate(state) or 0.0
            emit_event({
                "type": "node_evaluated",
                "id": node_id,
                "value": value,
            })
            return None, value

        player = game.get_current_player(state)
        is_maximizing = player == 1

        best_move = None
        best_value = float("-inf") if is_maximizing else float("inf")

        for m in game.get_legal_moves(state):
            next_state = game.apply_move(state, m)
            _, value = self._minimax(game, next_state, emit_event, node_id, depth + 1, max_depth, m)

            if is_maximizing:
                if value > best_value:
                    best_value = value
                    best_move = m
            else:
                if value < best_value:
                    best_value = value
                    best_move = m

        # 評価値確定イベント
        emit_event({
            "type": "node_evaluated",
            "id": node_id,
            "value": best_value,
        })
        return best_move, best_value
```

#### Alpha-Beta の実装方針

Minimaxを継承し、alpha/betaパラメータを追加する。

```python
# backend/algorithms/alpha_beta.py
from algorithms.base import AlgorithmPlugin, EmitEvent
from games.base import GamePlugin, State

class AlphaBeta(AlgorithmPlugin):
    name = "alpha_beta"

    def search(self, game: GamePlugin, state: State, emit_event: EmitEvent, max_depth: int | None = None) -> dict:
        self._node_counter = 0
        best_move, value = self._alpha_beta(
            game, state, emit_event,
            alpha=float("-inf"), beta=float("inf"),
            parent_id=None, depth=0, max_depth=max_depth,
        )
        emit_event({
            "type": "search_complete",
            "best_move": game.move_to_dict(best_move) if best_move is not None else None,
            "total_nodes": self._node_counter,
        })
        return {"best_move": best_move, "value": value}

    def _alpha_beta(
        self,
        game: GamePlugin,
        state: State,
        emit_event: EmitEvent,
        alpha: float,
        beta: float,
        parent_id: str | None,
        depth: int = 0,
        max_depth: int | None = None,
        move=None,
    ) -> tuple:
        node_id = str(self._node_counter)
        self._node_counter += 1

        emit_event({
            "type": "node_expanded",
            "id": node_id,
            "parent_id": parent_id,
            "move": game.move_to_dict(move) if move is not None else None,
            "state": game.state_to_dict(state),
        })

        if game.is_terminal(state) or (max_depth is not None and depth >= max_depth):
            value = game.evaluate(state) or 0.0
            emit_event({
                "type": "node_evaluated",
                "id": node_id,
                "value": value,
            })
            return None, value

        player = game.get_current_player(state)
        is_maximizing = player == 1

        best_move = None
        best_value = float("-inf") if is_maximizing else float("inf")

        for m in game.get_legal_moves(state):
            next_state = game.apply_move(state, m)
            _, value = self._alpha_beta(
                game, next_state, emit_event,
                alpha, beta, node_id, depth + 1, max_depth, m,
            )

            if is_maximizing:
                if value > best_value:
                    best_value = value
                    best_move = m
                alpha = max(alpha, value)
            else:
                if value < best_value:
                    best_value = value
                    best_move = m
                beta = min(beta, value)

            if beta <= alpha:
                # 枝刈りイベント: 残りの兄弟ノードをスキップ
                emit_event({
                    "type": "node_pruned",
                    "id": node_id,
                    "alpha": alpha,
                    "beta": beta,
                })
                break

        emit_event({
            "type": "node_evaluated",
            "id": node_id,
            "value": best_value,
        })
        return best_move, best_value
```

### 2.3 FastAPI WebSocketエンドポイント

```python
# backend/api/websocket.py
from fastapi import WebSocket, WebSocketDisconnect

# ゲーム・アルゴリズムのレジストリ
GAMES: dict[str, GamePlugin] = {}
ALGORITHMS: dict[str, AlgorithmPlugin] = {}

def register_plugins():
    """起動時にプラグインを登録する"""
    from games.tic_tac_toe import TicTacToe
    from algorithms.minimax import Minimax
    from algorithms.alpha_beta import AlphaBeta

    for g in [TicTacToe(), KingsValleyPlugin()]:
        GAMES[g.name] = g
    for a in [Minimax(), AlphaBeta()]:
        ALGORITHMS[a.name] = a


async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            data = await ws.receive_json()
            msg_type = data.get("type")

            if msg_type == "start_search":
                await handle_start_search(ws, data)
            elif msg_type == "apply_move":
                await handle_apply_move(ws, data)
            elif msg_type == "get_initial_state":
                await handle_get_initial_state(ws, data)
            elif msg_type == "get_legal_moves":
                await handle_get_legal_moves(ws, data)
            else:
                await ws.send_json({"type": "error", "message": f"Unknown message type: {msg_type}"})

    except WebSocketDisconnect:
        pass
```

#### 探索の実行とイベント送出

```python
async def handle_start_search(ws: WebSocket, data: dict):
    game_name = data["game"]
    algorithm_name = data["algorithm"]
    state = data["state"]  # フロントエンドから送られた盤面状態

    game = GAMES[algorithm_name]  # → GAMES[game_name]
    algorithm = ALGORITHMS[algorithm_name]

    game = GAMES[game_name]

    # イベントをバッファに蓄積し、探索完了後に一括送信する方式
    events: list[dict] = []

    def emit_event(event: dict):
        events.append(event)

    max_depth = 4 if game_name == "kings_valley" else None
    result = algorithm.search(game, state, emit_event, max_depth=max_depth)

    # 全イベントをまとめて送信（フロントエンドで再生制御するため）
    await ws.send_json({
        "type": "search_result",
        "events": events,
        "best_move": result["best_move"],
    })
```

**設計判断 — 一括送信 vs ストリーミング:**

MVP ではイベントを一括送信する方式を採用する。理由:
- 三目並べの探索は高速（< 1秒）であり、ストリーミングの遅延メリットがない
- フロントエンドで再生制御（ステップ実行・巻き戻し）を行うため、全イベントを手元に持つ必要がある
- 実装がシンプルになる

Phase 2（オセロ等の重い探索）で必要になった場合に、ストリーミング送信へ拡張する。その際もフロントエンド側はイベント配列への追加として扱えるため、再生ロジックの変更は不要。

## 3. フロントエンド設計

### 3.1 コンポーネントツリー

```
App
├── Header
│   ├── GameSelector          # ゲーム選択ドロップダウン
│   ├── AlgorithmSelector     # アルゴリズム選択ドロップダウン
│   └── ConnectionStatus      # WebSocket接続状態インジケーター
├── MainLayout
│   ├── BoardPanel
│   │   ├── GameRenderer      # ゲーム別の盤面コンポーネントを動的描画
│   │   │   └── TicTacToeBoard (SVG)
│   │   └── GameStatus        # 手番・勝敗表示
│   └── VisualizationPanel
│       ├── TreeView           # React Flow ベースのツリー表示
│       │   └── TreeNode[]     # カスタムノードコンポーネント
│       │       └── MiniBoard  # ミニ盤面 (ゲーム別)
│       └── NodeDetail         # 選択ノードの詳細情報
└── ControlBar
    ├── PlayButton             # 再生/一時停止トグル
    ├── StepButtons            # ステップ前進・後退
    ├── SpeedSlider            # 再生速度 (0.5x〜5x)
    └── ResetButton            # リセット
```

### 3.2 状態管理 (Zustand)

#### gameStore — ゲーム状態

```typescript
// frontend/src/stores/gameStore.ts
interface GameState {
  // 状態
  gameName: string;              // "tic_tac_toe"
  algorithmName: string;         // "minimax" | "alpha_beta"
  currentState: GameBoardState | null;  // 現在の盤面
  playerSide: 1 | -1;           // ユーザーの手番 (1=先手, -1=後手)
  gameResult: GameResult | null; // 終局結果

  // アクション
  setGame: (name: string) => void;
  setAlgorithm: (name: string) => void;
  setPlayerSide: (side: 1 | -1) => void;
  updateState: (state: GameBoardState) => void;
  setGameResult: (result: GameResult | null) => void;
  reset: () => void;
}

type GameBoardState = {
  board: number[];  // 三目並べ: 長さ9, 0=空, 1=X, -1=O
};

type GameResult = {
  winner: 1 | -1 | 0;  // 1=先手勝ち, -1=後手勝ち, 0=引き分け
};
```

#### treeStore — 探索ツリー・イベントログ

```typescript
// frontend/src/stores/treeStore.ts
interface TreeState {
  // 状態
  events: SearchEvent[];       // 全イベントログ（バックエンドから受信）
  currentStep: number;         // 現在表示中のステップインデックス
  selectedNodeId: string | null; // 選択中のノードID
  bestMove: MoveDict | null;   // 探索結果の最善手

  // 算出値
  visibleNodes: () => TreeNodeData[];   // events[0..currentStep] から構築
  visibleEdges: () => TreeEdgeData[];

  // アクション
  setEvents: (events: SearchEvent[], bestMove: MoveDict | null) => void;
  stepForward: () => void;
  stepBackward: () => void;
  goToStep: (step: number) => void;
  selectNode: (nodeId: string | null) => void;
  clear: () => void;
}
```

#### playbackStore — 再生制御

```typescript
// frontend/src/stores/playbackStore.ts
interface PlaybackState {
  // 状態
  isPlaying: boolean;
  speed: number;               // 0.5〜5.0 (倍速)

  // アクション
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setSpeed: (speed: number) => void;
}
```

#### connectionStore — WebSocket接続状態

```typescript
// frontend/src/stores/connectionStore.ts
type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

interface ConnectionState {
  status: ConnectionStatus;
  retryCount: number;

  setStatus: (status: ConnectionStatus) => void;
  incrementRetry: () => void;
  resetRetry: () => void;
}
```

### 3.3 GameRenderer インターフェース

ゲームごとに盤面の描画ロジックが異なるため、プラグイン形式で登録する。

```typescript
// frontend/src/types/game.ts
interface GameRenderer {
  /** メイン盤面コンポーネント（BoardPanel内に描画） */
  BoardComponent: React.FC<BoardProps>;
  /** ツリーノード内のミニ盤面コンポーネント */
  MiniBoardComponent: React.FC<MiniBoardProps>;
}

interface BoardProps {
  state: GameBoardState;
  onMove: (move: MoveDict) => void;  // ユーザーの手を通知
  isInteractive: boolean;            // クリック操作を受け付けるか
  lastMove?: MoveDict | null;        // 直前の手（ハイライト用）
}

interface MiniBoardProps {
  state: GameBoardState;
  size: number;                      // 描画サイズ (px)
}
```

```typescript
// frontend/src/plugins/ticTacToe/index.ts
import { TicTacToeBoard } from "./Board";
import { TicTacToeMiniBoard } from "./MiniBoard";
import { GameRenderer } from "../../types/game";

export const ticTacToeRenderer: GameRenderer = {
  BoardComponent: TicTacToeBoard,
  MiniBoardComponent: TicTacToeMiniBoard,
};

// レジストリ (frontend/src/utils/gameRenderers.ts)
const gameRenderers: Record<string, GameRenderer> = {
  tic_tac_toe: ticTacToeRenderer,
  kings_valley: kingsValleyRenderer,
};
```

### 3.4 ツリー構築ロジック

イベントログからReact Flowのnodes/edgesを構築する関数。

```typescript
// frontend/src/utils/treeLayout.ts
import { hierarchy, tree } from "d3-hierarchy";

interface TreeNodeData {
  id: string;
  parentId: string | null;
  move: MoveDict | null;
  state: GameBoardState;
  value: number | null;       // node_evaluated で設定
  isPruned: boolean;          // node_pruned で設定
  alpha: number | null;
  beta: number | null;
}

/**
 * イベントログの先頭から currentStep までを処理し、
 * ツリーのノード・エッジ・レイアウト位置を返す。
 */
function buildTreeFromEvents(
  events: SearchEvent[],
  currentStep: number,
): { nodes: ReactFlowNode[]; edges: ReactFlowEdge[] } {

  const nodeMap = new Map<string, TreeNodeData>();

  // 1. イベントを順に処理してノードマップを構築
  for (let i = 0; i <= currentStep && i < events.length; i++) {
    const event = events[i];
    switch (event.type) {
      case "node_expanded":
        nodeMap.set(event.id, {
          id: event.id,
          parentId: event.parent_id,
          move: event.move,
          state: event.state,
          value: null,
          isPruned: false,
          alpha: null,
          beta: null,
        });
        break;
      case "node_evaluated":
        const evalNode = nodeMap.get(event.id);
        if (evalNode) evalNode.value = event.value;
        break;
      case "node_pruned":
        const prunedNode = nodeMap.get(event.id);
        if (prunedNode) {
          prunedNode.isPruned = true;
          prunedNode.alpha = event.alpha;
          prunedNode.beta = event.beta;
        }
        break;
    }
  }

  // 2. d3-hierarchy でレイアウト計算
  const root = buildHierarchy(nodeMap);
  const layout = tree<TreeNodeData>().nodeSize([120, 160]);
  layout(root);

  // 3. React Flow 用のノード・エッジに変換
  const nodes: ReactFlowNode[] = [];
  const edges: ReactFlowEdge[] = [];

  root.each((d) => {
    nodes.push({
      id: d.data.id,
      position: { x: d.x, y: d.y },
      data: d.data,
      type: "treeNode",  // カスタムノード
    });
    if (d.parent) {
      edges.push({
        id: `${d.parent.data.id}-${d.data.id}`,
        source: d.parent.data.id,
        target: d.data.id,
      });
    }
  });

  return { nodes, edges };
}
```

## 4. データフロー

### 4.1 全体像

```
ユーザー操作                    フロントエンド                        バックエンド
─────────                    ──────────                        ────────
盤面クリック ──→ gameStore更新
                send {type:"apply_move"} ──────────→ apply_move()
                ← {type:"state_updated", state} ←── 新しい盤面

AI手番開始     send {type:"start_search"} ─────────→ algorithm.search()
                ← {type:"search_result", events[]} ← イベント一括返却

                treeStore.setEvents(events)
                currentStep = 0

再生ボタン ────→ playbackStore.play()
                setInterval で currentStep++
                → buildTreeFromEvents(events, currentStep)
                → React Flow 再描画

ステップ前進 ──→ treeStore.stepForward()
                currentStep++
                → buildTreeFromEvents() → 再描画

ステップ後退 ──→ treeStore.stepBackward()
                currentStep--
                → buildTreeFromEvents() → 再描画

ノードクリック → treeStore.selectNode(id)
                → NodeDetail に詳細表示
                → BoardPanel に盤面プレビュー
```

### 4.2 イベントログ + 再生インデックスのパターン

```
events:       [e0, e1, e2, e3, e4, e5, e6, e7, ...]
                            ↑
                       currentStep = 3

表示範囲: events[0] 〜 events[3] のイベントのみ反映
```

- **ステップ前進**: `currentStep++` → `buildTreeFromEvents(events, currentStep)` で表示を更新
- **ステップ後退**: `currentStep--` → 同じ関数で再構築（ノードマップを先頭から再計算）
- **自動再生**: `setInterval` で `currentStep++` を繰り返す。速度はインターバル値で制御
  - 基本インターバル: 500ms（1x）
  - 0.5x → 1000ms, 2x → 250ms, 5x → 100ms
  - 計算式: `interval = 500 / speed`
- **リセット**: `currentStep = 0` + ツリー表示をクリア
- **完了**: `currentStep >= events.length - 1` で自動再生停止

### 4.3 ノードクリック時のプレビュー

ノードクリック時、そのノードが持つ `state` を盤面パネルにプレビュー表示する。この間は盤面への操作を無効にする（`isInteractive = false`）。

```
treeStore.selectNode(id)
  → nodeMap.get(id).state を取得
  → BoardPanel に state をプレビュー表示
  → isInteractive = false（操作不可を明示）

treeStore.selectNode(null) で解除
  → BoardPanel は gameStore.currentState に戻る
  → isInteractive = true
```

## 5. WebSocket通信プロトコル（詳細スキーマ）

### 5.1 クライアント → サーバー

#### `get_initial_state` — 初期盤面の取得

```json
{
  "type": "get_initial_state",
  "game": "tic_tac_toe"
}
```

#### `apply_move` — 手の適用

```json
{
  "type": "apply_move",
  "game": "tic_tac_toe",
  "state": { "board": [0,0,0, 0,1,0, 0,0,0] },
  "move": { "position": 0 }
}
```

#### `start_search` — 探索の開始

```json
{
  "type": "start_search",
  "game": "tic_tac_toe",
  "algorithm": "alpha_beta",
  "state": { "board": [1,0,0, 0,-1,0, 0,0,0] }
}
```

### 5.2 サーバー → クライアント

#### `initial_state` — 初期盤面の応答

```json
{
  "type": "initial_state",
  "game": "tic_tac_toe",
  "state": { "board": [0,0,0, 0,0,0, 0,0,0] },
  "current_player": 1
}
```

#### `state_updated` — 手の適用結果

```json
{
  "type": "state_updated",
  "state": { "board": [1,0,0, 0,-1,0, 0,0,0] },
  "current_player": 1,
  "is_terminal": false,
  "result": null,
  "legal_moves": [
    {"position": 1}, {"position": 2}, {"position": 3},
    {"position": 5}, {"position": 6}, {"position": 7}, {"position": 8}
  ]
}
```

#### `search_result` — 探索結果（イベント一括）

```json
{
  "type": "search_result",
  "events": [
    {
      "type": "node_expanded",
      "id": "0",
      "parent_id": null,
      "move": null,
      "state": { "board": [1,0,0, 0,-1,0, 0,0,0] }
    },
    {
      "type": "node_expanded",
      "id": "1",
      "parent_id": "0",
      "move": { "position": 1 },
      "state": { "board": [1,1,0, 0,-1,0, 0,0,0] }
    },
    {
      "type": "node_evaluated",
      "id": "1",
      "value": 0.0
    },
    {
      "type": "node_pruned",
      "id": "3",
      "alpha": -1.0,
      "beta": 0.0
    },
    {
      "type": "node_evaluated",
      "id": "0",
      "value": 0.0
    },
    {
      "type": "search_complete",
      "best_move": { "position": 4 },
      "total_nodes": 42
    }
  ],
  "best_move": { "position": 4 }
}
```

#### `error` — エラー

```json
{
  "type": "error",
  "message": "Unknown game: chess"
}
```

### 5.3 探索イベント型の詳細

| フィールド | `node_expanded` | `node_evaluated` | `node_pruned` | `search_complete` |
|---|---|---|---|---|
| `type` | `"node_expanded"` | `"node_evaluated"` | `"node_pruned"` | `"search_complete"` |
| `id` | string (ノードID) | string (ノードID) | string (ノードID) | — |
| `parent_id` | string \| null | — | — | — |
| `move` | MoveDict \| null | — | — | — |
| `state` | GameBoardState | — | — | — |
| `value` | — | number | — | — |
| `alpha` | — | — | number | — |
| `beta` | — | — | number | — |
| `best_move` | — | — | — | MoveDict |
| `total_nodes` | — | — | — | number |

### 5.4 Phase 2 拡張用イベント（参考）

Phase 2でMCTSを追加する際、以下のイベント型を追加する。既存のイベント処理コードへの影響は `switch` 文に `case` を追加するのみ。

```json
{ "type": "node_selected", "id": "5", "ucb_value": 1.414 }
{ "type": "simulation_done", "id": "5", "result": 1.0 }
{ "type": "backpropagated", "id": "5", "visits": 10, "win_rate": 0.6 }
```

## 6. セットアップ手順

### 6.1 前提条件

- Node.js >= 18
- Python >= 3.11
- npm または yarn

### 6.2 バックエンド

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install fastapi uvicorn websockets

# 開発サーバー起動
uvicorn main:app --reload --port 8000
```

### 6.3 フロントエンド

```bash
cd frontend
npm install

# 開発サーバー起動
npm run dev
# → http://localhost:5173
```

### 6.4 主要な依存パッケージ

**フロントエンド (`package.json`)**:
| パッケージ | 用途 |
|---|---|
| `react`, `react-dom` | UIフレームワーク |
| `@xyflow/react` | ツリー可視化 (React Flow v12) |
| `d3-hierarchy` | ツリーレイアウト計算 |
| `zustand` | 状態管理 |
| `vitest`, `@testing-library/react` | テスト |

**バックエンド (`pyproject.toml`)**:
| パッケージ | 用途 |
|---|---|
| `fastapi` | Webフレームワーク |
| `uvicorn[standard]` | ASGIサーバー |
| `websockets` | WebSocket通信 |
| `pydantic` | メッセージスキーマ定義 |
| `pytest` | テスト |

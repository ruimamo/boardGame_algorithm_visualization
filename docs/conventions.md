# コーディング規約・技術リファレンス

## プロジェクト構成

モノレポ構成。`frontend/`（React+TS+Vite）と `backend/`（Python+FastAPI）に分離。

```
frontend/src/
  components/    # UIコンポーネント
  stores/        # Zustand ストア
  services/      # WebSocketクライアント等
  types/         # TypeScript 型定義
  plugins/       # ゲーム別の描画コンポーネント
  utils/         # ツリーレイアウト計算等

backend/
  api/           # FastAPI エンドポイント
  games/         # GamePlugin 実装
  algorithms/    # AlgorithmPlugin 実装
  schemas/       # Pydantic メッセージ型
  tests/         # pytest テスト
```

## 技術スタック・ライブラリ選定

| 用途 | 使うもの | 使わないもの |
|---|---|---|
| UIフレームワーク | React（関数コンポーネント + hooks） | クラスコンポーネント |
| 状態管理 | Zustand | Redux, Context API（グローバル状態用途） |
| ツリー可視化 | @xyflow/react (React Flow v12) | 他の可視化ライブラリ |
| ツリーレイアウト | d3-hierarchy | 手動レイアウト計算 |
| 盤面描画 | SVG（直接記述） | Canvas, 外部描画ライブラリ |
| バックエンド | FastAPI + uvicorn | Django, Flask |
| 通信 | WebSocket | REST API（探索イベント用途） |
| テスト(FE) | Vitest + React Testing Library | Jest |
| テスト(BE) | pytest | unittest |

## アーキテクチャルール

### プラグイン設計

新しいゲームやアルゴリズムを追加する際は、必ず対応する抽象基底クラスを継承する。

- **ゲーム追加**: `backend/games/base.py` の `GamePlugin` ABC を継承し、`backend/games/` に配置
  - 必須メソッド: `get_initial_state()`, `get_current_player()`, `get_legal_moves()`, `apply_move()`, `is_terminal()`, `evaluate()`, `state_to_dict()`, `move_to_dict()`
  - フロント側は `frontend/src/plugins/<game_name>/` に `Board.tsx` と `MiniBoard.tsx` を作成し、`GameRenderer` として登録
- **アルゴリズム追加**: `backend/algorithms/base.py` の `AlgorithmPlugin` ABC を継承し、`backend/algorithms/` に配置
  - 必須メソッド: `search(game, state, emit_event)` — `emit_event` コールバックで探索イベントを送出

### 状態管理（Zustand ストア）

4つのストアに分離する。ストア間の依存を最小限にする。

| ストア | 責務 |
|---|---|
| `gameStore` | 現在の盤面、手番、ゲーム名、アルゴリズム名、勝敗結果 |
| `treeStore` | イベントログ配列、currentStep（再生インデックス）、選択ノード |
| `playbackStore` | 再生/一時停止状態、再生速度 |
| `connectionStore` | WebSocket接続状態、リトライ回数 |

### ツリー構築パターン

- バックエンドから受信した探索イベントは `treeStore.events` に全件保持する
- 表示は `events[0..currentStep]` の範囲のみを `buildTreeFromEvents()` で構築する
- ステップ前進/後退は `currentStep` の増減のみ。巻き戻しはイベントの再処理で実現する

### WebSocket通信

- MVP ではイベント一括送信方式（`search_result` に全イベントを含む）
- メッセージ型は `backend/schemas/messages.py`（Pydantic）と `frontend/src/types/websocket.ts` の両方で定義し、整合性を保つ

## コーディング規約

### フロントエンド (TypeScript)
- 関数コンポーネント + hooks のみ使用
- 型は `src/types/` に集約。コンポーネントファイル内でのインライン型定義は Props のみ許可
- ファイル名: コンポーネントは PascalCase（`TreeNode.tsx`）、それ以外は camelCase（`gameStore.ts`）

### バックエンド (Python)
- 命名規則: snake_case（PEP 8準拠）
- 型ヒント必須
- ゲーム状態は immutable に扱う（`apply_move` は新しい状態を返し、元を変更しない）

## 開発コマンド

```bash
# バックエンド
cd backend && uv run uvicorn main:app --reload --port 8000

# フロントエンド
cd frontend && npm run dev

# テスト
cd backend && uv run pytest
cd frontend && npm test
```

## パッケージ管理

- **バックエンド**: uv を使用する。pip / venv は使わない
- **フロントエンド**: npm を使用する

# MCTS フロントエンド可視化

status: done

## ゴール
バックエンドから送られる MCTS 固有のイベントをツリーに反映し、
訪問回数・勝率を表示する。ヘッダーにアルゴリズム選択肢とイテレーション数入力を追加する。

## 依存
- `20260223-mcts-backend`

## 完了条件
- [ ] ヘッダーのアルゴリズム選択に `mcts` が追加されている
- [ ] MCTS 選択時にイテレーション数入力欄が表示される（デフォルト 50）
- [ ] `start_search` メッセージに `iterations` が含まれる
- [ ] `node_selected`・`simulation_done`・`backpropagated` イベントが型定義されている
- [ ] ツリーノードに訪問回数と勝率が表示される（minimax の評価値と切り替え）
- [ ] `node_selected` 時にノードをハイライト（黄色など）できる

## 対象ファイル（実装順）

1. `frontend/src/types/websocket.ts` — 新イベント型の追加、`StartSearchRequest` に `iterations?` を追加
2. `frontend/src/services/websocket.ts` — `startSearch()` に `iterations` を渡せるよう拡張
3. `frontend/src/stores/gameStore.ts` — `iterations: number` 状態と `setIterations` アクションを追加
4. `frontend/src/utils/treeLayout.ts` — `TreeNodeData` に `visits`・`winRate` を追加、新イベント処理
5. `frontend/src/components/visualization/TreeNode.tsx` — MCTS ノードの表示（訪問回数・勝率）
6. `frontend/src/components/Header.tsx` — MCTS 選択肢追加、イテレーション数入力
7. `frontend/src/components/ControlBar.tsx` — `startSearch` 呼び出しに `iterations` を渡す

## 実装メモ

### 1. 新しいイベント型（types/websocket.ts）

```typescript
export type NodeSelectedEvent = {
  type: "node_selected";
  id: string;
  ucb_value: number;
};

export type SimulationDoneEvent = {
  type: "simulation_done";
  id: string;
  result: number;
};

export type BackpropagatedEvent = {
  type: "backpropagated";
  id: string;
  visits: number;
  win_rate: number;
};

// SearchEvent の union に追加
export type SearchEvent =
  | NodeExpandedEvent
  | NodeEvaluatedEvent
  | NodePrunedEvent
  | NodeSelectedEvent
  | SimulationDoneEvent
  | BackpropagatedEvent
  | SearchCompleteEvent;
```

`StartSearchRequest` に `iterations?: number` を追加。

### 2. TreeNodeData の拡張（treeLayout.ts）

```typescript
export interface TreeNodeData extends Record<string, unknown> {
  // 既存
  id: string;
  parentId: string | null;
  move: MoveDict | null;
  state: GameBoardState;
  value: number | null;       // minimax 用
  isPruned: boolean;
  alpha: number | null;
  beta: number | null;
  hasHiddenChildren: boolean;
  // MCTS 追加
  visits: number;
  winRate: number | null;     // value_sum / visits（player 1 視点）
  isSelected: boolean;        // node_selected でハイライト中
}
```

`buildNodeMap` に `node_selected`・`simulation_done`・`backpropagated` のケースを追加:
- `node_selected`: 当該ノードの `isSelected = true`、それ以外は `false` にリセット
- `backpropagated`: `visits` と `winRate` を更新

### 3. TreeNode の表示切り替え（TreeNode.tsx）

- `visits > 0`（MCTS ノード）の場合: `${visits}回 / ${(winRate * 100).toFixed(0)}%` を表示
- それ以外（minimax ノード）の場合: 既存の評価値表示
- `isSelected = true` のとき: ボーダーを黄色にハイライト（現在の selected とは別）

### 4. ヘッダー（Header.tsx）

```tsx
<option value="mcts">MCTS</option>
```

アルゴリズムが `"mcts"` のとき、イテレーション数の入力欄を表示:
```tsx
{algorithmName === "mcts" && (
  <label style={{ fontSize: 13 }}>
    イテレーション数:{" "}
    <input
      type="number"
      min={1} max={500} value={iterations}
      onChange={(e) => setIterations(Number(e.target.value))}
      style={{ width: 60, marginLeft: 4 }}
    />
  </label>
)}
```

### 5. gameStore の iterations 管理

```typescript
interface GameState {
  // 追加
  iterations: number;
  setIterations: (n: number) => void;
}
// デフォルト: 50
```

### 6. ControlBar の startSearch 呼び出し

```typescript
wsService.startSearch(gameName, algorithmName, currentState, iterations);
```

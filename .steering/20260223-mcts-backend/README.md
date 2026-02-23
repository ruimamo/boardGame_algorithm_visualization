# MCTS バックエンド実装

status: done

## ゴール
モンテカルロ木探索（MCTS）を `AlgorithmPlugin` として実装し、WebSocket 経由で可視化用イベントを送出する。

## 依存
- なし（既存の AlgorithmPlugin インターフェースに準拠）

## 完了条件
- [ ] `MCTSPlugin` が `AlgorithmPlugin` を継承し `name = "mcts"` を返す
- [ ] `search()` が指定回数のイテレーションを実行する
- [ ] 各イテレーションで選択・展開・シミュレーション・バックプロパゲーションの4フェーズを踏む
- [ ] 各フェーズで所定のイベントを emit する（下記イベント仕様参照）
- [ ] `websocket.py` に MCTS を登録し、`iterations` パラメータを受け取れる
- [ ] Kings Valley・三目並べ両方で動作する

## 対象ファイル
- `backend/algorithms/mcts.py` — 新規：MCTS 実装
- `backend/api/websocket.py` — `handle_start_search` に `iterations` パラメータを追加、MCTS を登録

## 実装メモ

### ノード構造

```python
class MCTSNode:
    node_id: str          # ユニークID（"0", "1", "2", ...）
    state: dict           # ゲーム状態
    parent: MCTSNode | None
    move: dict | None     # この状態に至った手
    children: list[MCTSNode]
    visits: int           # 訪問回数
    value_sum: float      # 評価値の累積（player 1 視点: +1=先手勝ち, -1=後手勝ち）
    untried_moves: list | None  # 未展開の手（None = 未初期化）
```

### UCB1 スコア

```python
import math
C = math.sqrt(2)  # 探索定数

def ucb_score(child, parent_visits):
    if child.visits == 0:
        return float('inf')
    exploitation = child.value_sum / child.visits
    exploration = C * math.sqrt(math.log(parent_visits) / child.visits)
    return exploitation + exploration
```

注意: 後手（player -1）が動かすノードでは exploitation の符号を反転して最小化する。
→ `exploitation = -(child.value_sum / child.visits)` として UCB を計算する。

### 1イテレーションの流れ

```
1. Selection（選択）
   root から UCB が最大の子を再帰的に辿る。
   完全展開済み（untried_moves が空）かつ非終局ノードを対象にする。
   辿ったノードごとに node_selected イベントを emit。

2. Expansion（展開）
   選択されたノードに未試行の手があれば 1 つ選んで子ノードを作成。
   node_expanded イベントを emit。
   終局ノードまたは子なしの場合はスキップ。

3. Simulation（シミュレーション）
   展開したノード（または終局ノード）からランダムプレイアウト。
   終局まで合法手をランダムに選んで進める。
   simulation_done イベントを emit（result = evaluate()）。

4. Backpropagation（バックプロパゲーション）
   シミュレーション結果をリーフから root まで伝播。
   visits += 1, value_sum += result。
   ノードごとに backpropagated イベントを emit。
```

### イベント仕様

既存の `node_expanded` に加えて以下を追加:

```python
# 選択フェーズ：UCB でノードを選択したとき
{ "type": "node_selected", "id": node_id, "ucb_value": float }

# シミュレーション完了
{ "type": "simulation_done", "id": node_id, "result": float }  # result は +1/-1/0

# バックプロパゲーション：各ノードの更新後
{ "type": "backpropagated", "id": node_id, "visits": int, "win_rate": float }
```

`win_rate` = `value_sum / visits`（player 1 視点の勝率）

### websocket.py の変更点

`handle_start_search` で `iterations` を受け取り MCTS に渡す。
デフォルト値は 50。minimax/alpha_beta には影響しない。

```python
iterations = data.get("iterations", 50)
result = algorithm.search(game, state, events.append, max_depth=max_depth, iterations=iterations)
```

`AlgorithmPlugin.search()` のシグネチャは変えず、`**kwargs` や MCTS 固有の引数として処理する。
→ minimax/alpha_beta の `search()` は `iterations` を受け取らないため、websocket.py 側で分岐するか、
　 MCTS の `search()` に `iterations` パラメータを追加し、websocket.py から `algorithm.search(..., iterations=iterations)` と呼ぶ。
　 基底クラス `AlgorithmPlugin.search()` のシグネチャには `**kwargs` を許容する形で拡張する。

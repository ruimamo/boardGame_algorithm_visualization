# AlgorithmPlugin ABC + Minimax / Alpha-Beta 実装

status: done

## ゴール
探索アルゴリズムの基盤を作る。AlgorithmPlugin 抽象基底クラスを定義し、Minimax と Alpha-Beta を実装する。探索中にイベントを emit_event コールバックで送出する仕組みを組み込む。

## 依存
- `20260222-backend-game-plugin`

## 完了条件
- [ ] `backend/algorithms/base.py` に AlgorithmPlugin ABC が定義されている
- [ ] `backend/algorithms/minimax.py` に Minimax が実装されている
- [ ] `backend/algorithms/alpha_beta.py` に Alpha-Beta が実装されている
- [ ] 以下のテストが全て通る:
  - Minimax が三目並べの初期状態から正しく探索できること
  - Alpha-Beta が Minimax と同じ最善手・評価値を返すこと
  - Alpha-Beta の探索ノード数が Minimax より少ないこと（枝刈り効果の確認）
  - emit_event で node_expanded, node_evaluated, search_complete イベントが送出されること
  - Alpha-Beta で node_pruned イベントが送出されること

## 対象ファイル
- `backend/algorithms/__init__.py` — パッケージ初期化
- `backend/algorithms/base.py` — AlgorithmPlugin ABC 定義
- `backend/algorithms/minimax.py` — Minimax 実装
- `backend/algorithms/alpha_beta.py` — Alpha-Beta 実装
- `backend/tests/test_minimax.py` — Minimax テスト
- `backend/tests/test_alpha_beta.py` — Alpha-Beta テスト

## 実装メモ
- インターフェース定義は `docs/technical-design.md` セクション 2.2 に準拠する
- `search(game, state, emit_event)` の `emit_event` は `Callable[[dict], None]` 型のコールバック
- イベント型は `docs/technical-design.md` セクション 5.3 に準拠:
  - `node_expanded`: `{ type, id, parent_id, move, state }`
  - `node_evaluated`: `{ type, id, value }`
  - `node_pruned`: `{ type, id, alpha, beta }`（Alpha-Beta のみ）
  - `search_complete`: `{ type, best_move, total_nodes }`
- ノード ID はカウンタベースの文字列 ("0", "1", "2", ...)
- テスト実行: `cd backend && uv run pytest tests/test_minimax.py tests/test_alpha_beta.py -v`

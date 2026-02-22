# フロントエンド状態管理（Zustand ストア）

status: done

## ゴール
フロントエンドの状態管理基盤を作る。4つの Zustand ストアと、WebSocket メッセージ・探索イベントの TypeScript 型定義を整備する。

## 依存
- `20260222-project-init`

## 完了条件
- [ ] WebSocket メッセージ型と探索イベント型が TypeScript で定義されている
- [ ] ゲーム関連の型（GameBoardState, MoveDict, GameResult）が定義されている
- [ ] gameStore が動作する（盤面更新、ゲーム名・アルゴリズム名の切り替え、リセット）
- [ ] treeStore が動作する（イベント設定、ステップ前進・後退、ノード選択）
- [ ] playbackStore が動作する（再生・一時停止、速度変更）
- [ ] connectionStore が動作する（接続状態管理、リトライカウント）

## 対象ファイル
- `frontend/src/types/game.ts` — ゲーム関連の型定義
- `frontend/src/types/websocket.ts` — WebSocket メッセージ・イベント型定義
- `frontend/src/stores/gameStore.ts` — ゲーム状態ストア
- `frontend/src/stores/treeStore.ts` — 探索ツリー・イベントログストア
- `frontend/src/stores/playbackStore.ts` — 再生制御ストア
- `frontend/src/stores/connectionStore.ts` — WebSocket 接続状態ストア

## 実装メモ
- 型定義は `docs/technical-design.md` セクション 3.2 および セクション 5 に準拠する
- 型は `backend/schemas/messages.py` の Pydantic モデルと整合させる
- ストア間の依存は最小限にする（`docs/conventions.md` のストア設計ルール参照）
- treeStore の `currentStep` はイベント配列のインデックス。`stepForward` は +1、`stepBackward` は -1
- playbackStore の速度は 0.5〜5.0 の範囲

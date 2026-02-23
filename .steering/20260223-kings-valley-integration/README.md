# Kings Valley 統合

status: done

## ゴール
既存の `KingsValleyBoard` クラスを `GamePlugin` に対応させ、フロントエンドのボードレンダラーを追加して、三目並べと同様に動作させる。

## 依存
- なし（三目並べの実装が参照実装）

## 完了条件
- [ ] バックエンドで Kings Valley が動作する（GamePlugin を継承）
- [ ] WebSocket ハンドラーがゲーム非依存になっている
- [ ] フロントエンドで 5×5 盤面が表示される
- [ ] ピースをクリックして選択 → 行き先をクリックして着手できる
- [ ] AI を動かすと探索木が表示される

## 対象ファイル（実装順）

1. `backend/games/tic_tac_toe.py` — state/move を dict 形式に統一（後続の変更に備える）
2. `backend/api/websocket.py` — state/move を dict のまま渡す汎用化 + KingsValleyPlugin 登録
3. `backend/games/kings_valley.py` — KingsValleyPlugin クラスを追加
4. `frontend/src/types/game.ts` — GameBoardState/MoveDict を Record<string,unknown> に汎用化
5. `frontend/src/plugins/ticTacToe/Board.tsx` — 型キャストを追加（破壊的変更への対応）
6. `frontend/src/plugins/ticTacToe/MiniBoard.tsx` — 同上
7. `frontend/src/plugins/kingsValley/Board.tsx` — 新規：5×5 盤面（ピース選択・着手）
8. `frontend/src/plugins/kingsValley/MiniBoard.tsx` — 新規：ミニ盤面（ツリーノード内）
9. `frontend/src/plugins/kingsValley/index.ts` — 新規：レンダラーエクスポート
10. `frontend/src/utils/gameRenderers.ts` — kings_valley を登録

## 実装メモ

### state の形式
- TicTacToe: `{"board": [int x9]}`
- KingsValley: `{"board": [[int x5] x5], "turn": 1|-1, "denyKingMove": bool}`

### move の形式
- TicTacToe: `{"position": 0-8}`
- KingsValley: `{"from_row": r, "from_col": c, "direction": "up"|"down"|"left"|"right"|"up-left"|"up-right"|"down-left"|"down-right"}`

### ピースの表示
- Player 1 Vassal (1): 赤 filled circle
- Player 1 King (2): 赤 circle + 「K」
- Player 2 Vassal (-1): 青 filled circle
- Player 2 King (-2): 青 circle + 「K」
- 中央マス (2,2): 薄い黄色の背景

### インタラクション（Board.tsx）
- ローカル state `selected: {row, col} | null`
- ピースクリック → 選択（同じピースで解除）
- 有効な行き先をハイライト（緑）
- 行き先クリック → `onMove({from_row, from_col, direction})`
- スライドロジックを TypeScript で実装してハイライトを計算

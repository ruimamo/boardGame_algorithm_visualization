# Kings Valley バグ修正

status: done

## ゴール
Kings Valley をゲームセレクターから選択・プレイできるようにする。
選択時の画面クラッシュと探索時の再帰エラーを修正する。

## 依存
- `20260223-kings-valley-integration`

## 完了条件
- [x] ヘッダーのゲームセレクターに Kings Valley が表示される
- [x] ゲーム切り替え時に画面がクラッシュしない
- [x] ゲーム切り替え時に新しいゲームの初期盤面が表示される
- [x] 「AI を動かす」で RecursionError が発生しない

## 対象ファイル

- `frontend/src/components/Header.tsx` — ゲーム選択 `<select>` に `kings_valley` の `<option>` を追加
- `frontend/src/stores/gameStore.ts` — `setGame` で `currentState`・`gameResult` を同時にクリア
- `frontend/src/App.tsx` — ゲーム名変更時に reset + `getInitialState` を呼ぶ
- `backend/algorithms/minimax.py` — `max_depth` パラメータを追加
- `backend/algorithms/alpha_beta.py` — `max_depth` パラメータを追加
- `backend/api/websocket.py` — Kings Valley に `max_depth=4` を指定

## バグの原因と修正メモ

### 1. ゲームセレクターに選択肢がなかった
`Header.tsx` の `<select>` に `<option value="tic_tac_toe">` しか存在しなかった。
→ `<option value="kings_valley">Kings Valley</option>` を追加。

### 2. ゲーム切り替え時の画面クラッシュ（React レンダーエラー）
**原因**: `setGame("kings_valley")` は `gameName` だけを更新し、`currentState` には三目並べの古い状態が残ったまま。
React はレンダーを先に実行してから useEffect を走らせるため、
「KingsValley レンダラー ＋ 三目並べの state」という組み合わせで `KingsValleyBoard` がクラッシュした。

**修正**:
- `gameStore.ts`: `setGame` で `gameName` と `currentState: null`・`gameResult: null` をアトミックに更新する。
  これにより次の render では `displayState` が `null` になり、「接続中...」が表示される。
- `App.tsx`: `prevGameName` ref を追加し、ゲーム名が変わったら `pause()` + `clearTree()` + `resetGame()` + `wsService.getInitialState(gameName)` を呼ぶ。

### 3. 探索時の RecursionError
**原因**: minimax・alpha-beta に深さ制限がなく、Kings Valley の探索木が Python の再帰上限（約1000）を超えた。

**修正**:
- `minimax.py` / `alpha_beta.py`: `search()` と内部再帰メソッドに `depth` / `max_depth` パラメータを追加。
  深さ上限到達時は `game.evaluate(state) or 0.0`（中立値）で打ち切り。
- `websocket.py`: `game_name == "kings_valley"` のとき `max_depth=4` を渡す。三目並べは `None`（制限なし）。

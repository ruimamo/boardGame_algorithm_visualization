# フロントエンド 盤面プラグイン（三目並べ）

status: done

## ゴール
三目並べの盤面コンポーネント（メイン盤面・ミニ盤面）と GameRenderer プラグインを実装する。

## 依存
- `20260222-frontend-stores`

## 完了条件
- [ ] `frontend/src/plugins/ticTacToe/Board.tsx` が実装されている（SVG 描画、クリックで手を打てる）
- [ ] `frontend/src/plugins/ticTacToe/MiniBoard.tsx` が実装されている（ツリーノード内の縮小盤面）
- [ ] `frontend/src/plugins/ticTacToe/index.ts` に `ticTacToeRenderer` がエクスポートされている
- [ ] `frontend/src/types/game.ts` に `GameRenderer` インターフェースが定義されている（未定義の場合のみ追記）
- [ ] `frontend/src/utils/gameRenderers.ts` にゲーム名→レンダラーのレジストリが定義されている

## 対象ファイル
- `frontend/src/plugins/ticTacToe/Board.tsx` — メイン盤面（SVG）
- `frontend/src/plugins/ticTacToe/MiniBoard.tsx` — ミニ盤面（SVG）
- `frontend/src/plugins/ticTacToe/index.ts` — GameRenderer 登録
- `frontend/src/utils/gameRenderers.ts` — ゲームレンダラーレジストリ

## 実装メモ
- インターフェースは `docs/technical-design.md` セクション 3.3 参照
- Board.tsx: 3×3 の SVG グリッド、各セルに X/O を描画、`isInteractive` が true のとき空セルのクリックで `onMove` を呼ぶ
- `lastMove` のセルはハイライト表示（薄い背景色）
- MiniBoard.tsx: `size` prop の px で正方形に収まる SVG。ノードラベルとして使うためテキストは小さく
- `GameBoardState = { board: number[] }` で 0=空、1=X、-1=O
- `MoveDict = { position: number }` で 0〜8 のインデックス

### Board.tsx のスケッチ
```tsx
// セルサイズ: 各セルを 80x80px、盤面全体 240x240
const CELL = 80;
const SIZE = CELL * 3;

// 各セルの中心座標
const cx = (col: number) => col * CELL + CELL / 2;
const cy = (row: number) => row * CELL + CELL / 2;
```

### MiniBoard.tsx のスケッチ
```tsx
// size prop に合わせてスケール
// 例: size=90 → 各セルを 30x30
```

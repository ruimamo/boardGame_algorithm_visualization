# フロントエンド UI レイアウト統合

status: todo

## ゴール
Header・MainLayout・ControlBar の UI コンポーネントを実装し、App.tsx に組み込んで MVP として動作する完全な画面を完成させる。

## 依存
- `20260223-frontend-websocket-client`
- `20260223-frontend-board-plugin`
- `20260223-frontend-tree-view`

## 完了条件
- [ ] `Header.tsx` が実装されている（ゲーム選択、アルゴリズム選択、接続状態表示）
- [ ] `MainLayout.tsx` が実装されている（左: 盤面パネル、右: ツリーパネルの 2 ペイン）
- [ ] `ControlBar.tsx` が実装されている（再生/一時停止、ステップ前進・後退、速度スライダー、リセット）
- [ ] `App.tsx` が更新されている（WebSocket 接続、初期状態取得、全コンポーネントの組み込み）
- [ ] 盤面でクリックして手を打てる
- [ ] 「AI を動かす」ボタン（または自動でAI番）で探索が開始され、ツリーが表示される
- [ ] ステップ実行でツリーが 1 ノードずつ成長する
- [ ] 再生ボタンで自動ステップが進む
- [ ] ゲーム・アルゴリズムをドロップダウンで切り替えられる

## 対象ファイル
- `frontend/src/components/Header.tsx` — ヘッダー（ゲーム・アルゴリズム選択、接続状態）
- `frontend/src/components/MainLayout.tsx` — 2 ペインレイアウト
- `frontend/src/components/ControlBar.tsx` — 再生コントロール
- `frontend/src/App.tsx` — ルートコンポーネント（統合）

## 実装メモ

### App.tsx の役割
- `useEffect` で `wsService.connect()` し、アンマウント時に `wsService.disconnect()`
- 初回接続時（connectionStore.status === "connected"）に `wsService.getInitialState(gameName)` を呼ぶ
- playbackStore.isPlaying に応じて `setInterval` で `treeStore.stepForward()` を繰り返す
  - インターバル = 500 / playbackStore.speed (ms)
  - `currentStep >= events.length - 1` で停止

### MainLayout.tsx
- CSS Grid / Flexbox で左右 2 ペイン（左 40% 盤面、右 60% ツリー）
- 左ペインに `GameRenderer.BoardComponent` を配置
- 左ペインに `GameStatus`（現在の手番、勝敗）を表示
- 右ペインに `TreeView` と `NodeDetail` を配置

### ControlBar.tsx
- ▶/⏸ ボタン: `playbackStore.togglePlay()`
- ⏭ ボタン: `treeStore.stepForward()`
- ⏮ ボタン: `treeStore.stepBackward()`
- 速度スライダー: 0.5〜5.0、`playbackStore.setSpeed(v)`
- リセットボタン: `treeStore.clear()` + `gameStore.reset()` + `wsService.getInitialState(gameName)`
- 「AI を動かす」ボタン: `wsService.startSearch(gameName, algorithmName, currentState)` を呼ぶ

### Header.tsx
- ゲーム選択: `<select>` → `gameStore.setGame(name)` + リセット
- アルゴリズム選択: `<select>` → `gameStore.setAlgorithm(name)`
- 接続状態: connectionStore.status に応じてドット表示（緑=connected, 赤=error, 黄=connecting）

### スタイル
- CSS Modules や inline styles で最低限のスタイリング（TailwindCSS 不使用）
- MVPなのでデザインよりも動作優先

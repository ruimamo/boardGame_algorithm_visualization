# フロントエンド 探索ツリー可視化

status: done

## ゴール
探索ツリーを React Flow で描画するコンポーネントと、d3-hierarchy を使ったレイアウト計算ユーティリティを実装する。

## 依存
- `20260222-frontend-stores`
- `20260223-frontend-board-plugin`

## 完了条件
- [ ] `frontend/src/utils/treeLayout.ts` が実装されている（イベントログ → React Flow nodes/edges 変換）
- [ ] `frontend/src/components/visualization/TreeNode.tsx` が実装されている（カスタムノードコンポーネント）
- [ ] `frontend/src/components/visualization/NodeDetail.tsx` が実装されている（選択ノードの詳細パネル）
- [ ] `frontend/src/components/visualization/TreeView.tsx` が実装されている（React Flow ラッパー）
- [ ] currentStep が変わるとツリーが更新される
- [ ] 枝刈りノード（isPruned=true）がグレーアウト表示される
- [ ] ノードクリックで treeStore.selectNode が呼ばれ NodeDetail に反映される

## 対象ファイル
- `frontend/src/utils/treeLayout.ts` — イベントログ→ React Flow 変換
- `frontend/src/components/visualization/TreeNode.tsx` — カスタムノード
- `frontend/src/components/visualization/NodeDetail.tsx` — ノード詳細パネル
- `frontend/src/components/visualization/TreeView.tsx` — React Flow ツリー

## 実装メモ
- 実装方針は `docs/technical-design.md` セクション 3.4 参照
- `treeLayout.ts` の `buildTreeFromEvents(events, currentStep)` → `{ nodes, edges }`
- d3-hierarchy の `stratify` でツリー構造を構築し、`tree().nodeSize([120, 160])` でレイアウト
- `search_complete` イベントは `switch` の `default` でスキップ（ノードに対応しないため）
- TreeNode: MiniBoard をノード内に表示（`MiniBoardComponent` は gameStore.gameName からレジストリで引く）
- TreeNode のスタイル:
  - 通常: 白背景、青ボーダー
  - 枝刈り: グレー背景、グレーボーダー
  - 選択中: 黄色ボーダー
- 評価値は TreeNode の下部に数値表示（null の間は非表示）
- NodeDetail: 選択ノードの state（MiniBoard で表示）、value、isPruned、alpha/beta を表示
- TreeView: `<ReactFlow>` に fitView、nodes/edges を渡す。ノードタイプに `treeNode: TreeNode` を登録
- treeStore の `visibleNodes()` / `visibleEdges()` は computed 相当。代わりに TreeView 内で `buildTreeFromEvents` を直接呼ぶ形でも可

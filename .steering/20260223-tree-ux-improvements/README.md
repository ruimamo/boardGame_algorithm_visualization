# 木のUX改善：最後へジャンプ＋深さ制限プログレッシブ表示

status: done

## ゴール
探索木の「最後へ」ボタンと、深さ2までの初期表示＋クリック展開機能を追加する。

## 依存
- なし

## 完了条件
- [x] 「最後へ」ボタンで最終ステップへ即ジャンプできる
- [x] 初期表示は深さ2まで（深さ3以降は折りたたまれている）
- [x] 深さ2のノードをクリック → 子ノードが展開される
- [x] 同じノードを再クリック → 子ノードが折りたたまれる
- [x] 折りたたまれた子を持つノードに展開インジケーター（▼/▲）が表示される

## 対象ファイル
- `frontend/src/stores/treeStore.ts` — `expandedNodeIds: Set<string>` と `toggleExpand()` を追加
- `frontend/src/utils/treeLayout.ts` — `hasHiddenChildren` フラグ、展開状態フィルタリング追加
- `frontend/src/components/visualization/TreeView.tsx` — `expandedNodeIds` を `buildTreeFromEvents` に渡す
- `frontend/src/components/visualization/TreeNode.tsx` — 展開インジケーター表示、`toggleExpand` 呼び出し
- `frontend/src/components/ControlBar.tsx` — 「最後へ」ボタンを追加

## 実装メモ
- 可視条件: `depth <= 2` または `(親が可視 && 親.id ∈ expandedNodeIds)`
- `toggleExpand` は `new Set(...)` で新しい参照を作りリレンダーをトリガー
- `clear()` 時に `expandedNodeIds` もリセット

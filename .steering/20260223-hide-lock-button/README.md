# ロックボタン非表示ホットフィックス

status: done

## ゴール
TreeView の ReactFlow Controls に表示されている鍵ボタンを非表示にする。
ノードが常に非ドラッグ固定のためロックボタンが機能しておらず、ユーザーに誤解を与えるため。

## 依存
- なし

## 完了条件
- [ ] 木の画面に鍵ボタンが表示されなくなる

## 対象ファイル
- `frontend/src/components/visualization/TreeView.tsx` — `<Controls />` に `showInteractive={false}` を追加する

## 実装メモ
ReactFlow の `nodesDraggable={false}` / `nodesConnectable={false}` / `elementsSelectable={false}` がハードコードされているため、
Controls の lock ボタンが内部状態を変えても props に上書きされて効果がない。
`showInteractive={false}` を渡すだけで鍵ボタンが非表示になる。

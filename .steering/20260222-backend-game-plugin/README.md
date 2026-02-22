# GamePlugin ABC + 三目並べ実装

status: done

## ゴール
バックエンドのゲームロジック基盤を作る。GamePlugin 抽象基底クラスを定義し、三目並べを最初の実装として完成させる。

## 依存
- `20260222-project-init`

## 完了条件
- [ ] `backend/games/base.py` に GamePlugin ABC が定義されている
- [ ] `backend/games/tic_tac_toe.py` に三目並べが実装されている
- [ ] 以下のテストが全て通る:
  - 初期状態が空の盤面であること
  - 先手は 1、後手は -1 であること
  - 合法手が正しく列挙されること
  - 手を打った後の盤面が正しいこと（元の盤面は変更されないこと）
  - 横・縦・斜めの勝利判定が正しいこと
  - 引き分け判定が正しいこと
  - 非終局状態で evaluate が None を返すこと

## 対象ファイル
- `backend/games/__init__.py` — パッケージ初期化
- `backend/games/base.py` — GamePlugin ABC 定義
- `backend/games/tic_tac_toe.py` — 三目並べ実装
- `backend/tests/test_tic_tac_toe.py` — テスト

## 実装メモ
- インターフェース定義は `docs/technical-design.md` セクション 2.1 に準拠する
- 状態は `list[int]`（長さ9、0=空、1=先手X、-1=後手O）で表現する
- `apply_move` は新しいリストを返し、元の状態を変更しない（immutable）
- テスト実行: `cd backend && uv run pytest tests/test_tic_tac_toe.py -v`

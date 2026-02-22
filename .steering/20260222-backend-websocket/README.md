# WebSocketエンドポイント実装

status: done

## ゴール
フロントエンドとバックエンドを繋ぐWebSocketエンドポイントを実装する。クライアントからのメッセージに応じて、ゲーム操作と探索実行を行い結果を返す。

## 依存
- `20260222-backend-game-plugin`
- `20260222-backend-algorithm-plugin`

## 完了条件
- [ ] `get_initial_state` メッセージで初期盤面が返ること
- [ ] `apply_move` メッセージで手が適用された盤面が返ること
- [ ] `start_search` メッセージで探索イベント一覧と最善手が返ること
- [ ] 不明なメッセージ型にはエラーが返ること
- [ ] ゲーム・アルゴリズムのプラグインレジストリが動作すること
- [ ] Pydantic でメッセージ型が定義されていること

## 対象ファイル
- `backend/schemas/__init__.py` — パッケージ初期化
- `backend/schemas/messages.py` — WebSocketメッセージ型（Pydantic）
- `backend/api/__init__.py` — パッケージ初期化
- `backend/api/websocket.py` — WebSocketエンドポイントのハンドラ
- `backend/main.py` — エンドポイント登録を websocket.py に委譲するよう変更

## 実装メモ
- 通信プロトコルは `docs/technical-design.md` セクション 5 に準拠する
- MVP ではイベント一括送信方式: 探索完了後に全イベントを `search_result` としてまとめて返す
- プラグインレジストリ: `GAMES` / `ALGORITHMS` 辞書にインスタンスを登録し、メッセージの `game` / `algorithm` フィールドで引き当てる
- `apply_move` のレスポンスには `state`, `current_player`, `is_terminal`, `result`, `legal_moves` を含める
- テストは作業5（フロントエンド側WebSocketクライアント）との統合時に行う。この作業ではサーバー起動して手動確認で可とする
- 手動確認: `uv run python -c "..."` で WebSocket 接続し、各メッセージ型を送受信する

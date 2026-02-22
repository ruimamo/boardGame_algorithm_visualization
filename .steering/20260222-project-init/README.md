# プロジェクト初期化

status: done

## ゴール
frontend（React+TS+Vite）と backend（Python+FastAPI）のプロジェクトスケルトンを作成し、開発サーバーが起動できる状態にする。

## 依存
- なし

## 完了条件
- [ ] `frontend/` が `npm run dev` で起動し、ブラウザに初期画面が表示される
- [ ] `backend/` が `uvicorn main:app --reload --port 8000` で起動し、WebSocket接続を受け付ける
- [ ] frontend から backend への WebSocket 疎通確認（ping/pong レベル）ができる
- [ ] 必要な依存パッケージがすべてインストール済み

## 対象ファイル

### フロントエンド
- `frontend/package.json` — 依存パッケージ定義（react, @xyflow/react, d3-hierarchy, zustand, vitest 等）
- `frontend/tsconfig.json` — TypeScript設定
- `frontend/vite.config.ts` — Vite設定（WebSocketプロキシ含む）
- `frontend/index.html` — エントリーHTML
- `frontend/src/main.tsx` — Reactエントリーポイント
- `frontend/src/App.tsx` — ルートコンポーネント（「Board Game Algorithm Visualizer」の仮タイトル表示）

### バックエンド
- `backend/pyproject.toml` — 依存パッケージ定義（fastapi, uvicorn, websockets, pydantic, pytest）
- `backend/main.py` — FastAPIアプリケーション（WebSocketエンドポイントの雛形）

## セットアップ手順

### バックエンド
```bash
cd backend
uv sync
```

### フロントエンド
```bash
cd frontend
npm install
```

## 疎通確認手順

バックエンドとフロントエンドの両方を起動した状態で、以下を実行する。

```bash
cd backend
uv run python -c "import asyncio, websockets, json; exec(\"async def test():\n    async with websockets.connect('ws://localhost:8000/ws') as ws:\n        await ws.send(json.dumps({'type': 'ping'}))\n        response = await ws.recv()\n        print('received:', response)\nasyncio.run(test())\")"
```

期待結果:
```
received: {"type":"echo","data":{"type":"ping"}}
```

## 実装メモ
- バックエンドのパッケージ管理には uv を使用する。pip / venv は使わない
- `uv sync` で仮想環境の作成と依存パッケージのインストールが一括で行われる
- 開発サーバー起動: `uv run uvicorn main:app --reload --port 8000`
- `backend/.venv/` は `.gitignore` に追加する
- `docs/conventions.md` の技術スタック表に従ってパッケージを選定する
- frontend の Vite 設定で、開発時に `/ws` へのWebSocketリクエストを `localhost:8000` にプロキシする
- backend の WebSocket エンドポイントは `/ws` パスに配置する。MVP では接続を受け付けて echo するだけでよい
- この段階ではディレクトリ構成（components/, stores/ 等）のフォルダだけ作る必要はない。最初のファイルが配置される作業で自然に作られる

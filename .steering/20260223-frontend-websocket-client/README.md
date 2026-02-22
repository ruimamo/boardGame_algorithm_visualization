# フロントエンド WebSocket クライアント

status: done

## ゴール
バックエンドとの通信を担う WebSocket クライアントサービスを実装する。接続・再接続・メッセージ送受信を担当し、受信データを各 Zustand ストアに反映する。

## 依存
- `20260222-frontend-stores`
- `20260222-backend-websocket`

## 完了条件
- [ ] `frontend/src/services/websocket.ts` が実装されている
- [ ] `get_initial_state` を送信し、`initial_state` を受信して gameStore を更新できる
- [ ] `apply_move` を送信し、`state_updated` を受信して gameStore を更新できる
- [ ] `start_search` を送信し、`search_result` を受信して treeStore に設定できる
- [ ] 接続確立・切断・エラーを connectionStore に反映できる
- [ ] 切断時に最大3回まで自動再接続を試みる（1秒間隔）
- [ ] バックエンドとの手動疎通確認ができる（フロントからメッセージ送受信）

## 対象ファイル
- `frontend/src/services/websocket.ts` — WebSocket クライアントクラス

## 実装メモ

### インターフェース設計
```typescript
// サービスの公開 API
class WebSocketService {
  connect(): void
  disconnect(): void
  getInitialState(game: string): void
  applyMove(game: string, state: GameBoardState, move: MoveDict): void
  startSearch(game: string, algorithm: string, state: GameBoardState): void
}

// シングルトンとしてエクスポート
export const wsService = new WebSocketService();
```

### 受信メッセージのハンドリング
- `initial_state` → `gameStore.updateState(state)` + `gameStore.setCurrentPlayer(current_player)`
- `state_updated` → `gameStore.updateState(state)` + `gameStore.setCurrentPlayer(current_player)` + 終局なら `gameStore.setGameResult(result)`
- `search_result` → `treeStore.setEvents(events, best_move)`
- `error` → console.error で記録

### 接続管理
- WebSocket URL: `ws://localhost:5173/ws`（Vite プロキシ経由）
- `connect()` で connectionStore.setStatus("connecting") → 接続成功で "connected" → 切断で "disconnected"
- 切断時: retryCount < 3 なら 1秒後に再接続。3回失敗で "error" に遷移
- `App.tsx` の `useEffect` から `wsService.connect()` を呼び出す（この作業では App.tsx は変更しない。接続確認はブラウザの開発者ツールで行う）

### 疎通確認方法
バックエンド（`uv run uvicorn main:app --reload --port 8000`）とフロントエンド（`npm run dev`）を起動した状態で、ブラウザの開発者ツール Console から:
```javascript
import('/src/services/websocket.ts').then(m => {
  m.wsService.connect();
  setTimeout(() => m.wsService.getInitialState('tic_tac_toe'), 500);
});
```
connectionStore の status が "connected" になり、gameStore に初期盤面が設定されることを確認する。

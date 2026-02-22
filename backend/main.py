from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI(title="Board Game Algorithm Visualizer")


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            data = await ws.receive_json()
            # MVP初期段階: 受信したメッセージをそのまま返す（疎通確認用）
            await ws.send_json({"type": "echo", "data": data})
    except WebSocketDisconnect:
        pass

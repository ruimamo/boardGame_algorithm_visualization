from fastapi import FastAPI

from api.websocket import register_plugins, websocket_endpoint

app = FastAPI(title="Board Game Algorithm Visualizer")

register_plugins()

app.websocket("/ws")(websocket_endpoint)

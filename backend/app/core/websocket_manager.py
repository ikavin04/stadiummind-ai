"""WebSocket connection manager for broadcasting live updates to dashboard clients."""
import json
from typing import Any
from fastapi import WebSocket
import logging

logger = logging.getLogger(__name__)


from fastapi.encoders import jsonable_encoder

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WS client connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WS client disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, data: dict[str, Any]):
        """Broadcast JSON data to all connected clients."""
        encoded_data = jsonable_encoder(data)
        message = json.dumps(encoded_data)
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.warning(f"Failed to send to WS client: {e}")
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect(conn)

    async def send_personal(self, websocket: WebSocket, data: dict[str, Any]):
        """Send a message to a single connection."""
        encoded_data = jsonable_encoder(data)
        await websocket.send_text(json.dumps(encoded_data))


# Singleton instance shared across routers
ws_manager = ConnectionManager()

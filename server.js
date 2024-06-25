const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");

const PORT = 8080;
const MAX_CONNECTIONS = 1000;

const server = new WebSocket.Server({ port: PORT });

const connectionPool = new Map();

server.on("connection", (ws) => {
  if (connectionPool.size >= MAX_CONNECTIONS) {
    ws.close(1000, "Server is full");
    return;
  }

  const id = uuidv4();
  connectionPool.set(id, ws);

  console.log(`Client connected: ${id}`);
  console.log(`Current connections: ${connectionPool.size}`);

  ws.on("message", (message) => {
    console.log(`Received from ${id}:`, message);
    ws.send(`Echo: ${message}`);
  });

  ws.on("close", () => {
    connectionPool.delete(id);
    console.log(`Client disconnected: ${id}`);
    console.log(`Current connections: ${connectionPool.size}`);
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error from ${id}:`, error);
  });
});

console.log(`WebSocket server is running on ws://localhost:${PORT}`);

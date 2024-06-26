const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs").promises;
const path = require("path");

// Configuration
const config = {
  PORT: 8080,
  MAX_CONNECTIONS: 1000,
  JOKES_FILE: path.join(__dirname, "data", "jokes.json"),
  JOKE_INTERVAL: 10000, // 10 seconds
};

const server = new WebSocket.Server({ port: config.PORT });
const connectionPool = new Map();

let jokes = [];

async function loadJokes() {
  try {
    const data = await fs.readFile(config.JOKES_FILE, "utf8");
    jokes = JSON.parse(data).jokes;
    console.log(`Loaded ${jokes.length} jokes`);
  } catch (error) {
    console.error("Failed to load jokes:", error);
    process.exit(1);
  }
}
function getRandomJoke() {
  const joke = jokes[Math.floor(Math.random() * jokes.length)];
  const [question, answer] = joke.split("?");
  return JSON.stringify({ question: question + "?", answer: answer });
}

function broadcastJoke() {
  const joke = getRandomJoke();
  connectionPool.forEach((ws, id) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(joke);
    }
  });
}

function startJokeBroadcast() {
  setInterval(broadcastJoke, config.JOKE_INTERVAL);
}

function handleNewConnection(ws) {
  if (connectionPool.size >= config.MAX_CONNECTIONS) {
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
}

async function startServer() {
  try {
    await loadJokes();
    server.on("connection", handleNewConnection);
    startJokeBroadcast();
    console.log(`WebSocket server is running on ws://localhost:${config.PORT}`);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

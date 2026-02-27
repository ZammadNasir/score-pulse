import { WebSocket, WebSocketServer } from "ws";

const matchSubscribers = new Map();

function subscribe(matchId, socket) {
  if (!matchSubscribers.has(matchId)) {
    matchSubscribers.set(matchId, new Set());
  }
  matchSubscribers.get(matchId).add(socket);
}

function unsubscribe(matchId, socket) {
  if (!matchSubscribers.has(matchId)) return;
  const subscribers = matchSubscribers.get(matchId);
  subscribers.delete(socket);
  if (subscribers.size === 0) {
    matchSubscribers.delete(matchId);
  }
}

function cleanupSubscriptions(socket) {
  for(const matchId of socket.subscription) {
    unsubscribe(matchId, socket);
  }
}

function broadcastToAll(wss, payload) {
  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) continue;

    client.send(JSON.stringify(payload));
  }
}

function broadcastToMatch(matchId, payload) {
  if (!matchSubscribers.has(matchId)) return;
  const subscribers = matchSubscribers.get(matchId);
  for (const socket of subscribers) {
    if (socket.readyState !== WebSocket.OPEN) continue;
    socket.send(JSON.stringify(payload));
  }
}

function handleMessage(socket, message) {
  let parsed;
  try {
    parsed = JSON.parse(message);
  } catch (error) {
    return sendJson(socket, { type: "error", message: "Invalid JSON" });
  }

  if (parsed.type === "subscribe" && parsed.matchId) {
    subscribe(parsed.matchId, socket);
    socket.subscription.add(parsed.matchId);
    sendJson(socket, { type: "subscribed", matchId: parsed.matchId });
  } else if (parsed.type === "unsubscribe" && parsed.matchId) {
    unsubscribe(parsed.matchId, socket);
    socket.subscription.delete(parsed.matchId);
    sendJson(socket, { type: "unsubscribed", matchId: parsed.matchId });
  } else {
    sendJson(socket, { type: "error", message: "Unknown message type" });
  }
}

function sendJson(socket, payload) {
  if (socket.readyState !== WebSocket.OPEN) return;

  socket.send(JSON.stringify(payload));
}


export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    maxPayload: 1024 * 1024,
  });

  wss.on("connection", (socket) => {
    socket.isAlive = true;
    socket.on("pong", () => (socket.isAlive = true));

    socket.subscription = new Set();

    socket.on("message", (message) => handleMessage(socket, message));
    socket.on("error", () => socket.terminate());
    socket.on("close", () => cleanupSubscriptions(socket));

    sendJson(socket, { type: "welcome" });

  });

  const interval = setInterval(() => {
    wss.clients.forEach((socket) => {
      if (!socket.isAlive) {
        socket.terminate();
        return;
      }
      socket.isAlive = false;
      socket.ping();
    });
  }, 30000);

  wss.on("close", () => clearInterval(interval));

  function broadcastMatchCreated(match) {
      broadcastToAll(wss, { type: "match_created", data: match });
  }

  function broadcastCommentary(matchId, commentary) {
    broadcastToMatch(matchId, { type: "commentary", data: commentary });
  }

  return { broadcastMatchCreated, broadcastCommentary };
}

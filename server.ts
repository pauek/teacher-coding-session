// bun --hot websocket.js

import { serve, file } from "bun";

const onWebsocketMessage = (ws, msg) => {
  ws.send(JSON.stringify({ date: Date.now() }));
};

const onWebsocketConnect = (req: Request, server) => {
  if (server.upgrade(req)) {
    return new Response("", { status: 101 });
  }
};

const onRequest = (req: Request, server) => {
  console.log("Request", req.url);
  if (req.url.endsWith("/ws")) {
    return onWebsocketConnect(req, server);
  } else if (req.url.endsWith("/js")) {
    return new Response(file("main.js"));
  }
  return new Response(file("index.html"));
};

serve({
  port: 3000,
  hostname: "localhost",

  fetch: onRequest,
  websocket: {
    message: onWebsocketMessage,
  },
  development: true,
});

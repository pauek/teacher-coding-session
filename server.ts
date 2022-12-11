// bun --hot server.js

import { serve, file, Server } from "bun";

let numClients = 0;

const onWebsocketOpen = (ws) => {
  numClients++;
  console.log("Clients", numClients);
  ws.subscribe("code");
};

const onWebsocketClose = (ws) => {
  numClients--;
  console.log("Clients", numClients);
};

const onWebsocketConnect = (req: Request, server) => {
  if (server.upgrade(req)) {
    return new Response("", { status: 101 });
  }
  return new Response("error", { status: 500 });
};

const onRequest = (req: Request, server: Server) => {
  if (req.url.endsWith("/ws")) {
    return onWebsocketConnect(req, server);
  } else if (req.url.endsWith("/js")) {
    return new Response(file("main.js"));
  }
  return new Response(file("index.html"));
};

const { HOST, PORT, CODE_DIR } = process.env;

const server = serve({
  port: PORT,
  hostname: HOST,
  fetch: onRequest,
  websocket: {
    open: onWebsocketOpen,
    close: onWebsocketClose,
  },
  development: true,
});

setInterval(() => {
  server.publish("code", JSON.stringify(Date.now()));
}, 1000);

console.log(`Watching "${CODE_DIR}"`);
console.log(`Listening on http://${HOST}:${PORT}/`);
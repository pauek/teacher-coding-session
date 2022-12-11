// bun --hot websocket.js

const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Websocket Demo</title>
  </head>
  <body>
    <div id="app">
      <h1>websocket demo</h1>
    </div>
    <script>
      const style = document.querySelector("style");
      const ws = new WebSocket("ws://localhost:3000/ws");
      ws.onmessage = ({ data }) => console.log("Message: ", JSON.parse(data));
      setInterval(() => ws.send("ping"), 5000);
    </script>
  </body>
</html>
`;

const onWebsocketMessage = (ws, msg) => {
  ws.send(JSON.stringify({ date: Date.now() }));
};

const onWebsocketConnect = (req, server) => {
  if (server.upgrade(req)) {
    return new Response("", { status: 101 });
  }
}

const onRequest = (req, server) => {
  if (req.url.endsWith("/ws")) {
    return onWebsocketConnect(req, server);
  }
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
};

export default {
  websocket: {
    message: onWebsocketMessage,
  },
  fetch: onRequest,
};

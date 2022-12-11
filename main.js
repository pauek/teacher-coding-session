const app = document.getElementById("app");

const ws = new WebSocket(`ws://${location.host}/ws`);

ws.onopen = function () {
  console.log("Websocket connected");
};

ws.onmessage = function ({ data }) {
  const epoch = JSON.parse(data);
  app.textContent = `${Date(epoch).toLocaleLowerCase()}`;
};

ws.onclose = function () {
  console.log("Websocket closed");
};


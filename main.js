const style = document.querySelector("style");
const ws = new WebSocket("ws://localhost:3000/ws");
ws.onmessage = ({ data }) => console.log("Message: ", JSON.parse(data));
setInterval(() => ws.send("ping"), 5000);

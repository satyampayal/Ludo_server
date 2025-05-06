import app from "./app.js";
import { config } from "dotenv";
import connectedToDB from "./Config/db.config.js";
import { v2 } from "cloudinary";
import http from "http";
import { WebSocketServer } from "ws";
//config dotenv
config();

//start web soket


// // Create HTTP server from Express app
const server = http.createServer(app);

// Create WebSocket server using that HTTP server
const wss = new WebSocketServer({ server });

let rooms = {};

wss.on("connection", (ws) => {
  console.log("🟢 New client connected");

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);
      handleMessage(ws, data);
    } catch (err) {
      console.error("❌ Invalid message:", msg);
    }
  });

  ws.on("close", () => {
    console.log("🔌 Client disconnected");
  });
});

function handleMessage(ws, data) {
  switch (data.type) {
    case "join":
      joinRoom(ws, data.roomId, data.playerName);
      break;
    case "move":
      broadcastMove(data.roomId, data.move);
      break;
    default:
      console.log("❓ Unknown message type", data.type);
  }
}

function joinRoom(ws, roomId, playerName) {
  if (!rooms[roomId]) {
    rooms[roomId] = [];
  }

  if (rooms[roomId].length >= 4) {
    ws.send(JSON.stringify({ type: "error", message: "Room full" }));
    return;
  }

  rooms[roomId].push({ ws, name: playerName });
  console.log(`${playerName} joined room ${roomId}`);

  rooms[roomId].forEach((client) => {
    client.ws.send(JSON.stringify({
      type: "playerJoined",
      playerName,
      players: rooms[roomId].map((p) => p.name),
    }));
  });

  if (rooms[roomId].length === 4) {
    rooms[roomId].forEach((client, index) => {
      client.ws.send(JSON.stringify({
        type: "start",
        yourTurn: index === 0,
      }));
    });
  }
}

function broadcastMove(roomId, move) {
  if (!rooms[roomId]) return;

  rooms[roomId].forEach((client) => {
    client.ws.send(JSON.stringify({ type: "move", move }));
  });
}





server.listen(3001, () => {
  console.log("🚀 Server listening on port 3000");
});

//end we socket
v2.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,

});
app.listen(process.env.PORT,(err)=>{
   if(err){
    console.log(err);
    return ;
   }
   else{
    console.log("server is running on port 3000");
     connectedToDB();
   }

})
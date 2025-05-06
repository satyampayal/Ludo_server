import { WebSocketServer } from "ws";
import http from "http";
import { Router } from "express";
import app from "./app.js";
const socketRouter=Router();
//config dotenv

//start web soket



const socket=(req,res)=>{
// Create HTTP server from Express app
const server = http.createServer(app);

// Create WebSocket server using that HTTP server
const wss = new WebSocketServer({ server });

let rooms = {};
console.log("Run The socket script")
wss.on("connection", (ws) => {
  console.log("🟢 New client connected");

  ws.on("message", (msg) => {
    try {
        console.log("ws.on Message is "+msg);
      const data = JSON.parse(msg);
      console.log(data);
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
    console.log("handleMessage data is "+data);
    data.type="join";
    data.roomId=1;
    data.playerName="sa";
  switch (data.type) {
    case "join":
      joinRoom(ws, data.roomId, data.playerName);
      break;
    case "move":
      broadcastMove(data.roomId, data.move);
      break;
    default:
      console.log("❓ Unknown message type", data);
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
  
    // ✅ Send confirmation to the joining player
    ws.send(JSON.stringify({
      type: "joined",
      roomId,
      playerName,
      players: rooms[roomId].map((p) => p.name),
      message: "Successfully joined room!"
    }));
  
    // 📢 Broadcast to all players (including the one who joined)
    rooms[roomId].forEach((client) => {
      client.ws.send(JSON.stringify({
        type: "playerJoined",
        playerName,
        players: rooms[roomId].map((p) => p.name),
      }));
    });
  
    // 🎮 Start game if room is full
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

}


socketRouter.get('/',socket);




export default socketRouter;


//end we socket
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
  switch (data.event) {
    case "join":
      joinRoom(ws, data.roomId, data.playerName);
      break;
    case "move":
      broadcastMove(data.roomId, data.move);
      break;
    default:
      console.log("❓ Unknown message type", data.event);
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
    roomId,
    playerName,
    players: 1,
    message: "Successfully joined room!",
    event:"player_joined"
  }));

  // 📢 Broadcast to all players (including the one who joined)
  // rooms[roomId].forEach((client) => {
  //   client.ws.send(JSON.stringify({
  //     type: "playerJoined",
  //     playerName,
  //     players: rooms[roomId].map((p) => p.name),
  //   }));
  // });

  // 🎮 Start game if room is full
  if (rooms[roomId].length === 4) {
    rooms[roomId].forEach((client, index) => {
      client.ws.send(JSON.stringify({
        event: "start",
        yourTurn: index === 0,
      }));
    });
  }
}


function broadcastMove(roomId, move) {
  if (!rooms[roomId]) return;

  rooms[roomId].forEach((client) => {
    client.ws.send(JSON.stringify({ type: "event", move }));
  });
}





// server.listen(3001, () => {
//   console.log("🚀 Server listening on port 3001");
// });

//end we socket
v2.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,

});
server.listen(process.env.PORT,(err)=>{
   if(err){
    console.log(err);
    return ;
   }
   else{
    console.log("server is running on port 3000");
     connectedToDB();
   }

})
const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://letschatus.netlify.app",
    methods: ["GET", "POST"],
  },
});

const connectedUsers = [];

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", ({ room, username }) => {
    socket.join(room);
    console.log(`User with ID: ${socket.id} joined room: ${room}`);
    console.log(`Username: ${username}`);

    connectedUsers.push({ id: socket.id, username });
    
    // Emit the updated user list to all clients in the room
    io.to(room).emit("user_list", connectedUsers);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
    // Remove the disconnected user from the connectedUsers list
    const index = connectedUsers.findIndex((user) => user.id === socket.id);
    if (index !== -1) {
      connectedUsers.splice(index, 1);
    }

    // Emit the updated user list to all clients in the room
    io.emit("user_list", connectedUsers);
  });
});


app.get("/",(req,res)=>{
  res.send("Hello World");
})
server.listen(3001, () => {
  console.log("SERVER RUNNING");
});

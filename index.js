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

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    const { username, room } = data;
    socket.join(room);
    console.log(`User with ID: ${socket.id} joined room: ${room}`);

    // Emit the user_list event with the updated list of users in the room
    io.to(room).emit("user_list", getUsersInRoom(room));

    // You can also emit a welcome message or perform other actions as needed
    io.to(room).emit("system_message", `Welcome, ${username}!`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// Helper function to get the list of users in a room
function getUsersInRoom(room) {
  const clients = io.sockets.adapter.rooms.get(room);
  const users = [];
  if (clients) {
    for (const clientId of clients) {
      const user = io.sockets.sockets.get(clientId);
      users.push({ id: user.id, username: user.username });
    }
  }
  return users;
}

app.get("/", (req, res) => {
  res.send("Hello World");
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});

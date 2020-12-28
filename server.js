const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express.app();

const io = socketio(server);
const server = http.createServer(app);

const { addUser, removeUser, getUser, getUsers } = require("./utils/User");

io.on("connect", (socket) => {
  socket.on("join", ({ username, room }, callback) => {
    const { err, user } = addUser({ id: socket.id, name: username, room });
  });

  if (err) return callback(err);

  socket.join(user.room);

  socket.emit("message", {
    user: "admin",
    text: `${user.name.toUpperCase()}, Welcome to ${user.room} room.`,
  });
  socket.broadcast.to(user.room).emit("message", {
    user: "admin",
    text: `${user.name.toUpperCase()} has joined!`,
  });

  io.to(user.room).emit("roomData", {
    room: user.room,
    users: getUsers(user.room),
  });

  callback();
});

socket.on("sendMessage", (message, callback) => {
  const user = getUser(socket.id);

  io.to(user.room).emit("message", {
    user: user.name,
    text: message,
  });

  callback();
});

socket.on("disconnect", () => {
  const userLeft = removeUser(socket.id);

  if (userLeft) {
    io.to(user.room).emit("message", {
      user: "admin",
      text: `${user.name.toUpperCase()} has left`,
    });
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsers(user.room),
    });
  }
});

server.listen(3000, () => {
  console.log("Listening on port 3000!");
});

const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const fs = require("fs");
const path = require('path');
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const dataPath = path.join(__dirname, "data", "messages.json");


if (!fs.existsSync(path.dirname(dataPath))) fs.mkdirSync(path.dirname(dataPath), { recursive: true });
if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify([]));

io.on("connection", (socket) => {
  // 1. При входе отправляем ВСЕ сообщения
  const messages = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  socket.emit("all_messages", messages);

  socket.on("add_message", (newMessage) => {
    // 2. Читаем, ДОБАВЛЯЕМ в массив и только потом пишем
    const currentMessages = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    currentMessages.push(newMessage); 
    
    fs.writeFileSync(dataPath, JSON.stringify(currentMessages, null, 2));
    
    // 3. Рассылаем новое сообщение ВСЕМ (включая отправителя)
    io.emit("message_display", newMessage);
  });

  socket.on("delete_message", (id) => {
    let currentMessages = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    const filtered = currentMessages.filter((m) => m.id !== id);
    
    fs.writeFileSync(dataPath, JSON.stringify(filtered, null, 2));
    io.emit("message_deleted_success", id);
  });

  // Исправлено: добавлена запятая
  socket.on("disconnect", () => console.log("User disconnected:", socket.id));
});

server.listen(3000, () => console.log("Server running on port 3000"));

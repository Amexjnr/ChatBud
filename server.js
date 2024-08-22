const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
    },
});


app.use(express.static(path.join(__dirname, 'public')));

const messages = [];

io.on('connection', (socket) => {
    console.log('A user connected');


    socket.emit('chatHistory', messages);

    socket.on('joinChat', (nickname) => {
        socket.nickname = nickname;
        socket.emit('chatMessage', { message: `Welcome to the chat, ${nickname}!`, nickname: 'System' });
        socket.broadcast.emit('chatMessage', { message: `${nickname} has joined the chat.`, nickname: 'System' });
    });

    socket.on('chatMessage', (data) => {
        const chatMessage = { message: data.message, nickname: data.nickname };
        messages.push(chatMessage);
        io.emit('chatMessage', chatMessage);
    });

    socket.on('disconnect', () => {
        if (socket.nickname) {
            io.emit('chatMessage', { message: `${socket.nickname} has left the chat.`, nickname: 'System' });
        }
        console.log('User disconnected');
    });
});


server.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});

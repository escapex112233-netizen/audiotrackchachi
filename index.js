const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
// Allow connections from your Android app
const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
    console.log('Device connected:', socket.id);

    // When the Parent opens the app, they join the "monitor" room
    socket.on('join-parent', () => {
        socket.join('parent-room');
        // Tell the child to start sending audio
        io.emit('start-mic');
    });

    // When the Child joins
    socket.on('join-child', () => {
        socket.join('child-room');
    });

    // Relay audio data from Child to Parent
    socket.on('audio-data', (data) => {
        socket.to('parent-room').emit('voice', data);
    });

    socket.on('disconnect', () => {
        console.log('Device disconnected');
    });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
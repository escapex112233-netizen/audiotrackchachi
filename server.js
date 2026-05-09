const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', function(ws) {
    console.log("⚡ New Device Connected");

    ws.on('message', function(message) {
        // Ek device se data lekar baki sabko broadcast karna
        wss.clients.forEach(function(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', function() {
        console.log("❌ Device Disconnected");
    });
});

app.get('/', function(req, res) {
    res.send("ULTRA HIGH DEFINITION RELAY ACTIVE");
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', function() {
    console.log("🚀 Server running on port " + PORT);
});

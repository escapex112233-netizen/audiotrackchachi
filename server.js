const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 8080;
const FILE_PATH = path.join(__dirname, 'audio.pcm');

// Middleware for raw binary data (Max 10MB per chunk)
app.use(express.raw({ type: '*/*', limit: '10mb' }));

// Server start hote hi purani file saaf kar do taaki 'live' start ho
if (fs.existsSync(FILE_PATH)) {
    fs.unlinkSync(FILE_PATH);
}

app.get('/', (req, res) => {
    res.status(200).send(`
        <body style="background:#000; color:#0ff; font-family:monospace; padding:50px; text-align:center;">
            <div style="border:2px solid #0ff; padding:30px; border-radius:15px; display:inline-block; background:#050505;">
                <h1>⚡ LIVE RELAY ENGINE ⚡</h1>
                <p style="color:#0f0;">[ STATUS: STREAMING ACTIVE ]</p>
                <button onclick="location.href='/live'" style="background:#0ff; color:#000; padding:15px 30px; border:none; font-weight:bold; cursor:pointer; border-radius:5px;">
                    LISTEN LIVE
                </button>
            </div>
        </body>
    `);
});

// --- UPLOAD (Child Phone) ---
app.post(['/upload', '/upload/'], (req, res) => {
    if (!req.body || req.body.length === 0) return res.status(400).send("No Data");

    // Live feel ke liye hum data ko append karte rahenge
    fs.appendFile(FILE_PATH, req.body, (err) => {
        if (err) return res.status(500).send("Error");
        res.status(200).send("ACK");
    });
});

// --- LIVE (Parent Phone) ---
app.get(['/live', '/live/'], (req, res) => {
    if (!fs.existsSync(FILE_PATH)) {
        return res.status(404).send("Wait for child to start recording...");
    }

    // Headers for infinite streaming
    res.writeHead(200, {
        'Content-Type': 'audio/wav',
        'Transfer-Encoding': 'chunked',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    });

    // Hum hamesha file ke end se stream karna shuru karenge taaki purani awaz na aaye
    const stats = fs.statSync(FILE_PATH);
    const startPos = stats.size > 1024 ? stats.size - 1024 : 0; // Last 1kb se start karo taaki buffering na ho

    const stream = fs.createReadStream(FILE_PATH, { start: startPos });
    
    stream.pipe(res);

    // Jab connection toot jaye toh stream band kar do
    req.on('close', () => {
        stream.destroy();
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log("===============================");
    console.log(`🚀 LIVE SERVER ON PORT: ${PORT}`);
    console.log("===============================");
});

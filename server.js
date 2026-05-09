const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 8080;
const FILE_PATH = path.join(__dirname, 'audio.pcm');

// Middleware for raw binary data
app.use(express.raw({ type: '*/*', limit: '50mb' }));

// Dashboard
app.get('/', (req, res) => {
    res.status(200).send(`
        <body style="background:#000; color:#0ff; font-family:monospace; padding:50px; text-align:center;">
            <div style="border:2px solid #0ff; padding:30px; border-radius:15px; display:inline-block; background:#050505; box-shadow: 0 0 20px #0ff;">
                <h1>⚡ TRACK SYSTEM ONLINE ⚡</h1>
                <p style="color:#0f0;">[ STATUS: RECEIVING DATA ]</p>
                <hr style="border:0.5px solid #222; margin:20px 0;">
                <button onclick="location.href='/live'" style="background:#0ff; color:#000; padding:15px 30px; border:none; font-weight:bold; cursor:pointer; border-radius:5px;">
                    LISTEN LIVE NOW
                </button>
            </div>
        </body>
    `);
});

// Upload Endpoint (Child App)
app.post(['/upload', '/upload/'], (req, res) => {
    if (!req.body || req.body.length === 0) return res.status(400).send("Empty Data");

    fs.appendFile(FILE_PATH, req.body, (err) => {
        if (err) return res.status(500).send("Write Error");
        res.status(200).send("ACK");
    });
});

// Live Stream Endpoint (Parent App)
app.get(['/live', '/live/'], (req, res) => {
    if (!fs.existsSync(FILE_PATH)) {
        return res.status(404).send("No live audio stream found. Please start Child capture first.");
    }

    res.writeHead(200, {
        'Content-Type': 'audio/wav',
        'Transfer-Encoding': 'chunked',
        'Connection': 'keep-alive'
    });

    const stream = fs.createReadStream(FILE_PATH);
    stream.pipe(res);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log("===============================");
    console.log(`🚀 SERVER RUNNING ON PORT: ${PORT}`);
    console.log("===============================");
});
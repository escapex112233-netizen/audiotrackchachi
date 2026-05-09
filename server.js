const dgram = require('dgram');
const server = dgram.createSocket('udp4');

const clients = new Set();

server.on('message', (msg, rinfo) => {
    // Naya client register karo
    const clientKey = `${rinfo.address}:${rinfo.port}`;
    clients.add(clientKey);

    // Message ko baaki sabko bhej do
    for (const client of clients) {
        const [addr, port] = client.split(':');
        if (client !== clientKey) {
            server.send(msg, port, addr);
        }
    }
});

server.on('listening', () => {
    const address = server.address();
    console.log(`UDP Server listening on ${address.address}:${address.port}`);
});

server.bind(process.env.PORT || 8080);

const express = require('express');
const { createServer } = require('node:http');
const cors = require('cors');
const { Server } = require('socket.io');
const app = express();
const server = createServer(app);

function initSocket(server) {
    const io = new Server(server, { cors: { origin: '*' } });
    io.on('connection', (socket) => {
        socket.on('event', (event) => {
            console.log(event);
            socket.broadcast.emit('event', event);
        });
        socket.on('error', (error) => {
            console.error('Socket.IO error:', error);
            socket.emit('error', { message: 'An error occurred' });
        });
    })
}

initSocket(server);

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log('Server Started at ' + PORT));

app.use('/', (req, res) => res.send('Calendar'));


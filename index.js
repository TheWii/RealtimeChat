console.log('> Script started.');

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const sockets = new Server(server);
const port = 3000;

const clients = {};
const manager = MessageManager(sockets);

app.use(express.static('public'));


// on client connection / disconnection
sockets.on('connection', (socket) => {
    clients[socket.id] = socket;
    socket.on('disconnect', () => {
        delete clients[socket.id];
        console.log(`Client disconnected from server (id: ${socket.id}).`);
    });
    socket.on('send-message', manager.sendMessage);
    socket.username = generateName();
    socket.emit('save-data', 'username', socket.username);
    console.log(`Client connected to server (id: ${socket.id}, username: ${socket.username}).`);
});

function generateName() {
    return 'Guest' + Math.floor(Math.random()*1000);
}

function MessageManager(sockets) {

    const messages = [];

    let currentId = 1;
    function nextId() {
        return currentId++;
    }

    function sendMessage(message, callback) {
        console.log(`Received message from ${message.senderId}.`);
        message.id = nextId();
        messages.push(message);
        if (messages.length > 100) messages.shift();
        callback({
            status: 'ok',
            messageId: message.id,
            sendAt: Date.now()
        });
        broadcastMessage(message);
    }
    
    function broadcastMessage(message) {
        console.log(`Broadcasting message:`);
        console.log(message);
        sockets.emit('broadcast-message', message);
    }
    
    return {
        messages,
        nextId,
        sendMessage,
        broadcastMessage,
    }
}

server.listen(port, () => {
    console.log(`Listening on port: ${port}.`);
})
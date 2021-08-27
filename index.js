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


function generateName() {
    return 'Guest' + Math.floor(Math.random()*1000);
}

function MessageManager(sockets) {

    const messages = [];

    let currentId = 1;
    function nextId() {
        return currentId++;
    }


    function clientSetup(client) {
        client.on('disconnect', () => disconnection(client));
        client.on('send-message', sendMessage);
    }
    
    sockets.on('connection', connection);
    function connection(client) {
        clients[client.id] = client;
        clientSetup(client);
        client.username = generateName();
        client.emit('save-data', 'username', client.username);
        notifyUserJoined(client)
        console.log(`Client connected to server (id: ${client.id}, username: ${client.username}).`);

    }

    function disconnection(client) {
        delete clients[client.id];
        notifyUserLeft(client);
        console.log(`Client disconnected from server (id: ${client.id}).`);
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
        console.log(`Broadcasting message by ${message.senderId}.`);
        //console.log(message);
        sockets.emit('broadcast-message', message);
    }

    function notifyUserJoined(user) {
        const notification = {
            userId: user.id,
            userName: user.username,
            joinedAt: Date.now(),
            usersAmount: Object.keys(clients).length
        };
        sockets.emit('user-joined', notification);
    }
    function notifyUserLeft(user) {
        const notification = {
            userId: user.id,
            userName: user.username,
            leftAt: Date.now(),
            usersAmount: Object.keys(clients).length
        };
        sockets.emit('user-left', notification);
    }
    
    return {
        messages,
        nextId,
        clientSetup,
        connection,
        disconnection,
        sendMessage,
        broadcastMessage,
        notifyUserJoined,
        notifyUserLeft
    }
}

server.listen(port, () => {
    console.log(`Listening on port: ${port}.`);
})
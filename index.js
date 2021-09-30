console.log('> Script started.');

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import Messenger from './messenger.js';
import Connection from './connection.js';

const app = express();
const server = createServer(app);
const sockets = new Server(server);
const port = 3000;


const messenger = Messenger();
const connection = Connection(sockets);

connection.subscribe('received-message', (data) =>
    messenger.appendMessage(data.message)
);
connection.subscribe('user-connection', (data) =>
    messenger.addUser(data.user)
);
connection.subscribe('user-disconnection', (data) =>
    messenger.removeUser(data.user)
);
connection.subscribe('user-name-request', (data) =>
    messenger.renameUser(data.user, data.name)
);

messenger.subscribe('added-user', connection.notifyUserJoined);
messenger.subscribe('removed-user', connection.notifyUserLeft);
messenger.subscribe('appended-message', connection.broadcastMessage);
messenger.subscribe('renamed-user', connection.sendUserName);



app.use(express.static('public'));


server.listen(port, () => {
    console.log(`Server -> Listening on port: ${port}.`);
})
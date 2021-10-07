console.log('> Script started.');

import express from 'express';
import exphbs from 'express-handlebars';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import hbsHelpers from './lib/handlebar-helpers.js';
import { requireCookie } from './lib/router-utils.js';
import validation from './validation/user.js';

import RoomRouter from './routes/rooms.js';
import UserRouter from './routes/user.js';

import Messenger from './services/messenger.js';
import Connection from './services/connection.js';

dotenv.config();

const app = express();
const server = createServer(app);
const sockets = new Server(server);
const port = 3000;

app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: hbsHelpers
}));
app.set('view engine', 'hbs');


const messenger = Messenger();
const connection = Connection(sockets);

messenger.addRoom('public', { name: 'Community Center' });
messenger.addRoom('private', {
    name: 'Secret Club',
    private: true,
    password: 'chocolate123'
});


connection.subscribe('received-message', (data) =>
    messenger.appendMessage(data.roomId, data.message)
);
connection.subscribe('user-connection', (data) => {
    messenger.renameUser(data.user, data.user.cookies.name);
    messenger.joinRoom(data.user.roomId, data.user);
});
connection.subscribe('user-disconnection', (data) =>
    messenger.leaveRoom(data.user.roomId, data.user)
);
connection.subscribe('user-name-request', (data) =>
    messenger.renameUser(data.user, data.name)
);

messenger.subscribe('user-joined', connection.userJoinedRoom);
messenger.subscribe('user-left', connection.userLeftRoom);
messenger.subscribe('appended-message', connection.broadcastMessage);
messenger.subscribe('renamed-user', connection.sendUserName);


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(multer().array());
app.use(express.static('public'));

app.use('/rooms', RoomRouter(messenger));
app.use('/user', UserRouter());


app.get('/', requireCookie('name', validation.username, (req, res) => {
    res.render('welcome');
}), (req, res) => {
    res.redirect('/rooms');
});


server.listen(port, () => {
    console.log(`Server -> Listening on port: ${port}.`);
})
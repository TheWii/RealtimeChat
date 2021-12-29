console.log('> Script started (Vue Implementation).');

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

//import cookieParser from 'cookie-parser';
//import multer from 'multer';

import Services from './services/index.js';
import ApiRouter from './routes/index.js';

dotenv.config();

const app = express();
const server = createServer(app);
const sockets = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: false
    },
    allowEIO3: true
});
const port = 3000;

const services = Services(sockets);

//app.use(cookieParser());
app.use(express.json());
//app.use(express.urlencoded({extended: true}));
//app.use(multer().array());

app.use('/deprecated', express.static('./deprecated'))

app.use('/api', ApiRouter(services));

app.use(express.static('../app/build'));

server.listen(port, () => {
    console.log(`Server -> Listening on localhost:${port}.`);
})
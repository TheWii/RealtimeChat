console.log('> Script started (Vue Implementation).');

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import historyApiFallback from 'connect-history-api-fallback';
import cookieParser from 'cookie-parser';
//import multer from 'multer';

import Services from './services/index.js';
import ApiRouter from './routes/index.js';

dotenv.config();

const app = express();
const server = createServer(app);
const sockets = new Server(server);
const port = 3000;

const services = Services(sockets);

app.use(cookieParser());
app.use(express.json());
//app.use(express.urlencoded({extended: true}));
//app.use(multer().array());

app.use('/api', ApiRouter(services));

app.use(historyApiFallback());
app.use(express.static('../app/build'));


server.listen(port, () => {
    console.log(`Server -> Listening on localhost:${port}.`);
})
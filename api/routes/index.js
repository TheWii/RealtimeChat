import express from 'express';

import RoomRouter from './rooms.js';
import UserRouter from './user.js';

export default ApiRouter;

export function ApiRouter(services) {
    const router = express.Router();

    router.use('/user', UserRouter(services));
    router.use('/rooms', RoomRouter(services));

    return router;
}
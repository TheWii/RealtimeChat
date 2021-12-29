import express from 'express';

import RoomRouter from './rooms.js';
import UserRouter from './user.js';

export default ApiRouter;

export function ApiRouter(services) {
    const router = express.Router();

    router.use('/user', UserRouter());
    router.use('/rooms', RoomRouter(services.messenger));

    return router;
}
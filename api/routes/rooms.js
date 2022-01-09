
import express from 'express';
import jwt from 'jsonwebtoken';

import { decode } from '../lib/token.js';

export default function RoomRouter(services) {
    const messenger = services.messenger;
    const router = express.Router();
    
    function authorize(req, res) {
        const id = req.params.id;
        // user has saved token
        const cookie = req.cookies['room'];
        if (cookie) {
            const savedToken = decode(cookie);
            if (savedToken && savedToken.id === id) return {
                status: 200, msg: 'Already authorized.',
                content: { token: cookie }
            };
            res.clearCookie('room');
        }
        // validate request
        const { status, msg } = messenger.canJoin({
            roomId: id,
            password: req.body.password
        });
        if (status !== 200) return { msg, status };
        const token = jwt.sign({ id }, process.env.TOKEN_SECRET);
        res.cookie('room', token, {
            secure: !process.env.DEV_ENV,
            maxAge: 3600000 * 12
        });
        return {
            status,
            msg,
            content: { token }
        }
    }

    router.get('/', (req, res) => {
        console.log('RoomRouter -> GET. Retrieving rooms.');
        const rooms = Object.values(messenger.rooms).map(
            room => ({
                id: room.id,
                name: room.name,
                isPrivate: room.isPrivate,
                limit: room.limit,
                users: room.userAmount
            })
        );
        res.json(rooms);
    });

    router.get('/:id', (req, res) => {
        const roomId = req.params.id;
        const room = messenger.rooms[roomId];
        if (!room) return res.status(404).send("Room with specified id doesn't exist.");
        console.log(`RoomRouter -> GET. Retrieving room #${roomId}.`);
        res.json({
            id: room.id,
            name: room.name,
            isPrivate: room.isPrivate,
            limit: room.limit,
            users: room.userAmount
        });
    });
    
    router.post('/:id/authorize', (req, res) => {
        const result = authorize(req, res);
        if (result.status === 200) res.status(200).json(result.content);
        else res.status(result.status).send(result.msg);
        console.log(`RoomRouter -> POST. Authorization: ${result.msg}`);
    });

    return router;
}
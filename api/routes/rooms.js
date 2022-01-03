
import express from 'express';
import jwt from 'jsonwebtoken';

import { requireCookie } from '../lib/router-utils.js';
import * as validation from '../validation/user.js';

export default RoomRouter;

export function RoomRouter(messenger) {
    const router = express.Router();

    // user must have a name to use this router.
    //router.use(requireCookie('name', (name) => !validation.username(name).error,
    //    (req, res) => res.redirect('/')
    //));


    function decodeToken(token) {
        if (!token) return null;
        try {
            return jwt.verify(token, process.env.TOKEN_SECRET);
        } catch (err) {
            return null;
        }
    }
    
    function generateRoomToken(req, res) {
        function response(options) {
            return {
                ok: false,
                ...options
            }
        }
        const id = req.params.id;
        const room = messenger.rooms[id];
        if (!room) return response({
            message: "Room with specified id doesn't exist."
        });
        if (room.private) {
            if (!req.body.password) return response({
                message: "Password is requireCookied.", room
            })
            if (room.password !== req.body.password) return response({
                message: "Password is incorrect.", room
            });
        }
        const token = jwt.sign({ id }, process.env.TOKEN_SECRET);
        res.cookie('room', token, {
            secure: !process.env.DEV_ENV,
            maxAge: 3600000 * 12
        });
        return response({
            ok: true,
            room,
            token
        });
    }


    router.get('/', (req, res) => {
        console.log('RoomRouter -> GET. Retrieving rooms.');
        const rooms = Object.entries(messenger.rooms)
            .map(kv => ({
                id: kv[0],
                name: kv[1].name,
                isPrivate: kv[1].isPrivate,
                users: Object.keys(kv[1].users).length,
                limit: kv[1].limit
            })
        );
        res.json(rooms);
    });

    router.get('/:id', (req, res) => {
        const id = req.params.id;
        const room = messenger.rooms[id];
        console.log(`MainRouter -> Room route #${id}.`);

        // room with such id doesn't exist
        if (!room) {
            console.log(`MainRouter -> No such room exists.`);
            return res.redirect('/rooms');
        }
        
        let token = req.cookies['room'];

        // attempt to generate token(fails if room is private)
        if (!token) {
            console.log(`MainRouter -> Attempting to generate room token.`);
            const response = generateRoomToken(req, res);
            if (response.ok) token = response.token;
            else console.log(`MainRouter -> Failed to generate token: ${response.message}`);
        }

        const decoded = decodeToken(token);
        
        // room token is invalid
        if (!decoded || decoded.id !== id) {
            console.log(`MainRouter -> User has no authorization to join room.`);
            return res.redirect(`/rooms/join/${id}`);
        }

        res.render('room', {
            id,
            ...room
        });
    });
    
    router.get('/join/:id', (req, res) => {
        const id = req.params.id;
        console.log(`MainRouter -> Join page of room #${id}.`);
        const room = messenger.rooms[id];
        if (!room) {
            console.log(`MainRouter -> No such room exists.`);
            return res.redirect('/rooms');
        }
        res.clearCookie('room');
        res.render('join', {
            id,
            ...room
        });
    });
    
    router.post('/join/:id', (req, res) => {
        const id = req.params.id;
        console.log(`MainRouter -> Joining room #${id}.`);

        const response = generateRoomToken(req, res);
        if (!response.ok) {
            console.log(`MainRouter -> ${response.message}`);
            return res.redirect('/rooms');
        }
         
        res.redirect(`/rooms/${id}`);
    });

    return router;
}
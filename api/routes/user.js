
import express from 'express';
import * as validation from '../validation/user.js';

import { generateId } from './middlewares/user.js';

export default UserRouter;

export function UserRouter(services) {
    const router = express.Router();

    router.post('/name', async (req, res) => {
        console.log(`[UserRouter] POST name -> Setting user name.`);
        const name = req.body.name;
        const { error, value } = validation.username(name);
        if (error) {
            const message = error.details[0].message;
            console.log(`[UserRouter] POST name -> Request rejected: ${message}`);
            return res.status(400).send(message);
        }
        res.cookie('name', value, {
            secure: !process.env.DEV_ENV
        });
        res.json({ name: value });
        const userId = req.cookies['user'];
        if (!userId) return;
        const user = await services.connection.getUser(userId);
        user.name = value;
    });

    router.get('/id', (req, res) => {
        console.log(`[UserRouter] GET id.`);
        let id = req.cookies['user'];
        if (!id) {
            id = generateId();
            res.cookie('user', id);
        }
        res.send(id);
    });


    router.get('/leave', (req, res) => {
        res.clearCookie('name');
        res.clearCookie('room');
        res.redirect('/');
    });

    return router;
}
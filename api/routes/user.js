
import express from 'express';

export default UserRouter;

export function UserRouter() {
    const router = express.Router();

    router.post('/name', (req, res) => {
        console.log(`UserRouter -> Set user name request.`);
        const name = req.body.name;
        if (!name) return res.status(400).send('Name field is empty.');
        if (name.length < 3) return res.status(400).send('Name must have at least 3 characters.');
        res.cookie('name', name, {
            secure: !process.env.DEV_ENV,
            httpOnly: true
        });
        res.redirect('/');
    });

    router.get('/leave', (req, res) => {
        res.clearCookie('name');
        res.clearCookie('room');
        res.redirect('/');
    });

    return router;
}
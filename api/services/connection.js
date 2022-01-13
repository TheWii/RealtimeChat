
import EventBus from '../lib/events.js';

import { parseCookies, setPropertyFromCookie } from './connection/middlewares.js';

import RoomHandler from './connection/room.js';

export default function Connection(io) {
    const bus = EventBus();
    const handlers = {
        room: RoomHandler(io, bus)
    };

    io.use(parseCookies);
    io.use(setPropertyFromCookie('user', 'userId'));

    io.on('connection', connection);
    function connection(user) {
        console.log(`Connection -> User connected (id: ${user.id}, name: ${user.name}).`);
        setupUser(user);
        bus.publish('user-connection', { user });
    }

    function setupUser(user) {
        for (let [name, handler] of Object.entries(handlers)) {
            const binded = handler.bind(user);
            for (let event in binded) {
                user.on(`${name}:${event}`, binded[event]);
            }
        }
        user.on('disconnect', disconnected.bind(null, user));
    }

    function disconnected(user) {
        console.log(`Connection -> User disconnected (id: ${user.id}).`);
        bus.publish('user:disconnected', { user });
    }

    async function getUser(id) {
        const sockets = await io.fetchSockets();
        return sockets.find(socket => socket.userId === id);
    }
    
    return {
        ...handlers,
        subscribe: bus.subscribe,
        unsubscribe: bus.unsubscribe,
        getUser
    }
}
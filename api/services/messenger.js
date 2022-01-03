
import EventBus from '../lib/events.js';
import * as validation from '../validation/user.js';

export default Messenger;

export function Messenger() {
    const rooms = {};

    const bus = EventBus();

    let currentId = 1;
    function nextId() {
        return currentId++;
    }

    function generateName() {
        return 'Guest' + Math.floor(Math.random()*1000);
    }


    function addRoom(id, options={}) {
        if (rooms[id]) return; // a room already uses this id
        rooms[id] = {
            name: 'Unnamed',
            isPrivate: false,
            password: null,
            limit: 10,
            users: {},
            messages: [],
            ...options
        };
        bus.publish('added-room', {
            id,
            room: rooms[id]
        });
    }

    function removeRoom(id) {
        if (!rooms[id]) return; // no room uses this id
        const room = rooms[id]; // save room before it's deleted
        delete rooms[id];
        bus.publish('removed-room', { id, room });
    }
    

    function joinRoom(roomId, user) {
        const room = rooms[roomId];
        if (!room) return;
        room.users[user.id] = user;
        console.log(`Messenger -> User joined room #${roomId}.`);
        if (!user.name) renameUser(user, generateName());
        bus.publish('user-joined', {
            roomId,
            user,
            userAmount: Object.keys(room.users).length
        });
    }
    
    function leaveRoom(roomId, user) {
        const room = rooms[roomId];
        if (!room) return;
        delete room.users[user.id];
        console.log(`Messenger -> User left room #${roomId}.`);
        bus.publish('user-left', {
            roomId,
            user,
            userAmount: Object.keys(room.users).length
        });
    }

    function getUser(id) {
        for (let room in rooms) {
            if (room[id]) return room[id];
        }
    }

    function appendMessage(roomId, message) {
        const room = rooms[roomId];
        if (!room) return;
        console.log(`Message -> Appending new message to #${roomId}.`)
        message.id = nextId();
        room.messages.push(message);
        if (room.messages.length > 100) room.messages.shift();
        bus.publish(`appended-message`, {
            roomId,
            message
        });
    }

    function renameUser(user, name) {
        if (validation.username(name).error) return;
        name = name.trim().slice(0, 19);
        const previousName = user.name;
        user.name = name;
        console.log(`Messenger -> Renamed user '${previousName}' to '${user.name}'.`);
        bus.publish('renamed-user', {
            user,
            previousName,
            newName: name
        });
    }
    
    return {
        rooms,
        subscribe: bus.subscribe,
        unsubscribe: bus.unsubscribe,
        addRoom,
        removeRoom,
        joinRoom,
        leaveRoom,
        getUser,
        renameUser,
        appendMessage
    }
}
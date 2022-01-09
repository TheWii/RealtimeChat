
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

    function addRoom(id, options={}) {
        if (rooms[id]) return; // a room already uses this id
        rooms[id] = {
            id,
            name: 'Unnamed',
            isPrivate: false,
            password: null,
            limit: 10,
            users: {},
            messages: [],
            get userAmount() {
                return Object.keys(this.users).length;
            },
            ...options
        };
        bus.publish('room:added', {
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

    /**
     * Check if the user `user` can join room of id `roomId`.
     * @param {{
     *  roomId: string,
     *  password?: string,
     *  user?: Socket,
     *  verifyPassword?: boolean
     * }} cmd An object containing the following properties:
     * @param {Object} cmd.password Required password to join
     *  the room in case the room is private.
     * @param {Object} cmd.user The Socket object that represents
     *  the user who desires to join the room. Although it's
     *  not required, it's preferable to get passed since in
     *  some cases the room might need to blacklist users.
     * @param {Object} cmd.verifyPassword Whether the password
     *  should
     */
    function canJoin(cmd) {
        const { roomId, password, verifyPassword=true } = cmd;
        const room = rooms[roomId];
        if (!room) return {
            status: 404, msg: "Room with specified id doesn't exist."
        }
        if (room.isPrivate && verifyPassword) {
            if (!password) return {
                status: 401, msg: "Password is required."
            }
            if (room.password !== password) return {
                status: 401, msg: "Password is incorrect."
            }
        }
        if (room.userAmount >= room.limit) return {
            status: 400, msg: "Room is full."
        }
        return {
            status: 200,
            msg: "Allowed to join room.",
        };
    }

    /**
     * @param {{
     *  roomId: string,
     *  user: Socket,
     *  password?: string
     * }} cmd
     */
    function joinRoom(cmd) {
        const { roomId, user } = cmd;
        const { status, msg } = canJoin({...cmd, verifyPassword: false});
        //console.log(`Messenger -> ${status}: ${msg}`);
        if (status !== 200) return;
        const room = rooms[roomId];
        room.users[user.id] = user;
        user.roomId = room.id;
        console.log(`Messenger -> User joined room #${roomId}.`);
        bus.publish('room:joined', { room, user });
    }

    /**
     * @param {{
     *  user: Socket
     * }} cmd 
     * @returns 
     */
    function leaveRoom(cmd) {
        const { user } = cmd;
        if (!user.roomId) return;
        const room = rooms[user.roomId];
        if (!room) return;
        delete room.users[user.id];
        delete user.roomId;
        console.log(`Messenger -> User left room #${room.id}.`);
        bus.publish('room:left', { room, user });
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
        canJoin,
        joinRoom,
        leaveRoom
    }
}
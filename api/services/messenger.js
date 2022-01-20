
import EventBus from '../lib/events.js';
import * as validation from '../validation/user.js';

export default Messenger;

export function Messenger(configs={}) {
    const cfg = {
        maxMessages: 100,
        ...configs
    }
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
            typing: [],
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
        const { user, user: { roomId } } = cmd;
        if (!roomId) return;
        const room = rooms[roomId];
        if (!room) return;
        delete room.users[user.id];
        delete user.roomId;
        console.log(`Messenger -> User left room #${room.id}.`);
        bus.publish('room:left', { room, user });
    }

    /**
     * @param {{
     *   roomId: string,
     *   user: Socket,
     *   message: Message
     * }} data 
     * @returns 
     */
    function receivedUserMessage(data) {
        const { roomId, user, text, createdMessage } = data;
        const message = createMessage({
            type: 'user',
            user,
            text
        });
        appendMessage({ roomId, message });
        createdMessage(message);
    }

    function createMessage(data) {
        const { type, user={}, text } = data;
        return {
            type,
            senderId: user.userId,
            senderName: user.name,
            text,
            id: nextId(),
            time: Date.now(),
        };
    }
    
    function appendMessage(data) {
        const { roomId, message } = data;
        const room = rooms[roomId];
        if (!room) return;
        room.messages.push(message);
        if (room.messages.length > cfg.maxMessages) room.messages.shift();
        bus.publish(`room:appended_message`, { roomId, message });
    } 
    
    return {
        rooms,
        subscribe: bus.subscribe,
        unsubscribe: bus.unsubscribe,
        addRoom,
        removeRoom,
        canJoin,
        joinRoom,
        leaveRoom,
        createMessage,
        appendMessage,
        receivedUserMessage
    }
}
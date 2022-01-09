
import EventBus from '../lib/events.js';
import cookie from 'cookie';

import RoomHandler from './connection/room.js';

export default function Connection(io) {
    const bus = EventBus();
    const handlers = {
        room: RoomHandler(io, bus)
    };

    // parse cookies middleware
    //io.use(function(socket, next) {
    //    socket.cookies = {};
    //    const headers = socket.handshake.headers;
    //    if ('cookie' in headers) {
    //        socket.cookies = cookie.parse(headers.cookie);
    //    }
    //    next();
    //});

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
                console.log(`Registering a listener on event #${name}:${event}.`);
                user.on(`${name}:${event}`, binded[event]);
            }
        }
        user.on('disconnect', disconnected.bind(null, user));
        //user.on('send-message', receivedMessage.bind(null, user));
        //user.on('started-typing', userStartedTyping.bind(null, user));
        //user.on('stopped-typing', userStoppedTyping.bind(null, user));
        //user.on('change-name',
        //    (request) => bus.publish('user-name-request', { user, ...request })
        //);
    }

    function disconnected(user) {
        console.log(`Connection -> User disconnected (id: ${user.id}).`);
        bus.publish('user:disconnected', { user });
    }
    /*  


    function receivedMessage(user, message, callback) {
        const roomId = user.roomId;
        message.senderId = user.id;
        message.senderName = user.name;
        console.log(`Connection -> Received message by ${message.senderId} in #${roomId}.`);
        bus.publish('received-message', {
            roomId,
            user,
            message
        });
        callback({
            messageId: message.id,
            time: Date.now()
        });
    }
    

    function userJoinedRoom(data) {
        data.user.join(`room:${data.roomId}`);
        sendToRoom(data.roomId, 'user-joined', {
            userId: data.user.id,
            userName: data.user.name,
            userAmount: data.userAmount,
            time: data.time
        });
    }
    function userLeftRoom(data) {
        data.user.leave(`room:${data.roomId}`);
        sendToRoom(data.roomId, 'user-left', {
            userId: data.user.id,
            userName: data.user.name,
            userAmount: data.userAmount,
            time: data.time
        });
    }

    function userStartedTyping(user) {
        console.log(`Connection -> An user started typing...`);
        const roomId = user.roomId;
        sendToRoom(roomId, 'user-started-typing', {
            id: user.id,
            name: user.name
        });
    }
    function userStoppedTyping(user) {
        console.log(`Connection -> An user stopped typing...`);
        const roomId = user.roomId;
        sendToRoom(roomId, 'user-stopped-typing', {
            id: user.id,
            name: user.name
        });
    }

    function broadcastMessage(data) {
        console.log(`Connection -> Broadcasting message by ${data.message.senderId}.`);
        sendToRoom(data.roomId, 'broadcast-message', data.message);
    }
    
    function sendUserName(data) {
        console.log(`Connection -> Sending updated name to user.`);
        sendData(data.user, 'name', data.newName);
    };
    

    function sendData(user, key, value) {
        user.emit('save-data', key, value);
    }

    function sendToRoom(roomId, event, ...args) {
        io.in(`room:${roomId}`).emit(event, ...args);
    }
    */
    
    return {
        ...handlers,
        subscribe: bus.subscribe,
        unsubscribe: bus.unsubscribe
    }
}
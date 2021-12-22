
import EventBus from '../lib/events.js';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';

export default Connection;

export function Connection(io) {
    const bus = EventBus();

    // parse cookies middleware
    io.use(function(socket, next) {
        const cookies = cookie.parse(socket.handshake.headers.cookie);
        socket.cookies = cookies;
        next();
    });

    // decode room token middleware
    io.use(function(socket, next) {
        const token = jwt.verify(socket.cookies['room'], process.env.TOKEN_SECRET);
        socket.roomId = token.id;
        next();
    });


    io.on('connection', connection);
    function connection(user) {
        console.log(`Connection -> User connected (id: ${user.id}, name: ${user.name}).`);
        setupUser(user);
        bus.publish('user-connection', { user });
    }

    function setupUser(user) {
        user.on('disconnect',
            () => disconnection(user)
        );
        user.on('send-message',
            (message, callback) => receivedMessage(user, message, callback)
        );
        user.on('change-name',
            (request) => bus.publish('user-name-request', { user, ...request })
        );
        user.on('started-typing', () => userStartedTyping(user));
        user.on('stopped-typing', () => userStoppedTyping(user));
    }

    function disconnection(user) {
        console.log(`Connection -> User disconnected (id: ${user.id}).`);
        bus.publish('user-disconnection', { user });
    }    


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
    
    return {
        subscribe: bus.subscribe,
        unsubscribe: bus.unsubscribe,
        userJoinedRoom,
        userLeftRoom,
        receivedMessage,
        broadcastMessage,
        sendUserName
    }
}
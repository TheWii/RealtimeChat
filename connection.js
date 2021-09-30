
import EventBus from './lib/events.js';

export default Connection;

export function Connection(sockets) {
    const bus = EventBus();

    sockets.on('connection', connection);
    function connection(user) {
        console.log(`Connection -> User connected (id: ${user.id}).`);
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
    }

    function disconnection(user) {
        console.log(`Server -> User disconnected (id: ${user.id}).`);
        bus.publish('user-disconnection', { user });
    }    


    function receivedMessage(user, message, callback) {
        message.senderId = user.id;
        message.senderName = user.name;
        console.log(`Connection -> Received message by ${message.senderId}.`);
        bus.publish('received-message', {
            user,
            message
        });
        callback({
            messageId: message.id,
            time: Date.now()
        });
    }
    

    function notifyUserJoined(data) {
        const user = data.user;
        console.log(`Connection -> Broadcasting user joined.`);
        sockets.emit('user-joined', {
            userId: user.id,
            userName: user.name,
            userAmount: data.userAmount,
            time: data.time
        });
    }
    
    function notifyUserLeft(data) {
        const user = data.user;
        console.log(`Connection -> Broadcasting user left.`);
        sockets.emit('user-left', {
            userId: user.id,
            userName: user.name,
            userAmount: data.userAmount,
            time: data.time
        });
    }

    function broadcastMessage(data) {
        const message = data.message;
        console.log(`Connection -> Broadcasting message by ${message.senderId}.`);
        sockets.emit('broadcast-message', message);
    }
    
    function sendUserName(data) {
        console.log(`Connection -> Sending updated name to user.`);
        data.user.emit('save-data', 'name', data.newName);
    };
    
    return {
        subscribe: bus.subscribe,
        unsubscribe: bus.unsubscribe,
        notifyUserJoined,
        notifyUserLeft,
        receivedMessage,
        broadcastMessage,
        sendUserName
    }
}
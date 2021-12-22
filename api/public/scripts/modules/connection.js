
import EventBus from '../lib/events.js';

export default Connection;

export function Connection(user) {
    const bus = EventBus();

    user.on('connect', () => {
        console.log(`Connection -> Connected to server. (id: ${user.id}, name: ${user.name}).`);
    });
    
    user.on('user-joined', userJoined);
    user.on('user-left', userLeft);
    user.on('save-data', saveData);
    user.on('user-started-typing', userStartedTyping);
    user.on('user-stopped-typing', userStoppedTyping);
    user.on('broadcast-message', receivedMessage);

    function receivedMessage(message) {
        console.log(`Connection -> Received broadcast message.`);
        if (message.senderId === user.id) return;
        bus.publish('received-message', message);
    }

    function saveData(key, value) {
        console.log(`Connection -> Received data update: key=${key}, value=${value}`);
        user[key] = value;
        bus.publish('updated-data', key, value);
    }
    
    function userJoined(data) {
        console.log(`Connection -> User joined room.`);
        data.text = `${data.userName} joined the chat`;
        bus.publish('user-joined', data);
    }
    
    function userLeft(data) {
        console.log(`Connection -> User left room.`);
        data.text = `${data.userName} left the chat`;
        bus.publish('user-left', data);
    }
    
    function sendMessage(message) {
        console.log(`Connection -> Sending message to server.`);
        message.sentAt = Date.now();
        user.emit('send-message', message, (response) =>
            messageResponse(message, response)
        );
    }

    function startedTyping() {
        user.emit('started-typing');
    }

    function stoppedTyping() {
        user.emit('stopped-typing');
    }

    function userStartedTyping(data) {
        console.log(`Connection -> An user started typing...`);
        bus.publish('user-started-typing', data);
    }
    function userStoppedTyping(data) {
        console.log(`Connection -> An user stopped typing...`);
        bus.publish('user-stopped-typing', data);
    }

    function messageResponse(message, response) {
        console.log(`Connection -> Got message response after ${response.time - message.sentAt}ms`);
        bus.publish('message-response', message, response);
    }

    return {
        sendMessage,
        startedTyping,
        stoppedTyping,
        subscribe: bus.subscribe,
        unsubscribe: bus.unsubscribe
    }
}
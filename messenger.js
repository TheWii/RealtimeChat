
import EventBus from './lib/events.js';

export default Messenger;

export function Messenger() {
    const users = {};
    const messages = [];

    const bus = EventBus();

    let currentId = 1;
    function nextId() {
        return currentId++;
    }

    function generateName() {
        return 'Guest' + Math.floor(Math.random()*1000);
    }
    
    function addUser(user) {
        users[user.id] = user;
        if (!user.name) renameUser(user, generateName());
        bus.publish('added-user', {
            user,
            userAmount: Object.keys(users).length
        });
    }
    
    function removeUser(user) {
        delete users[user.id];
        bus.publish('removed-user', {
            user,
            userAmount: Object.keys(users).length
        });
    }

    function getUser(id) {
        return users[id];
    }

    function appendMessage(message) {
        message.id = nextId();
        console.log(`Message -> Appending new message.`)
        messages.push(message);
        if (messages.length > 100) messages.shift();
        bus.publish(`appended-message`, {
            message
        });
    }

    function renameUser(user, name) {
        name = name.trim();
        if (!name.length) return;
        if (name.length > 20) name = name.slice(0, 19);
        const previousName = user.name;
        user.name = name;
        console.log(`Message -> Renamed user '${previousName}' to '${user.name}'.`);
        bus.publish('renamed-user', {
            user,
            previousName,
            newName: name
        });
    }
    
    return {
        users,
        messages,
        subscribe: bus.subscribe,
        unsubscribe: bus.unsubscribe,
        addUser,
        removeUser,
        getUser,
        renameUser,
        appendMessage
    }
}
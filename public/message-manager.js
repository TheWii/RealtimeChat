import { dates } from './helper.js';

export function MessageManager(user) {
    const inpMsg = document.querySelector('.send-message input');
    const ulMessages = document.querySelector('ul.messages');
    const spanUsers = document.querySelector('.users .value');

    const messages = [];
    const topics = {};
    function subscribe(topic, callback) {
        const subscribers = topics[topic] || [];
        if (!subscribers.includes(callback))
            subscribers.push(callback);
        topics[topic] = subscribers;
    }
    function unsubscribe(topic, callback) {
        const subscribers = topics[topic] || [];
        if (subscribers.includes(callback)) {
            const i = subscribers.indexOf(callback);
            subscribers.splice(i, 1);
        }
        topics[topic] = subscribers;
    }
    function publish(topic, data) {
        data.time = Date.now();
        console.log(`MessageManager -> Notifying topic "${topic}"`);
        const subscribers = topics[topic];
        if (!subscribers) return;
        for (const callback of subscribers) {
            callback(data);
        }
    }


    function send() {
        const text = inpMsg.value;
        if (!text) return;
        inpMsg.value = '';
        const senderId = user.id;
        const senderName = user.name;
        const message = {
            text,
            senderId,
            senderName
        };
        publish('send-message', {
            message
        });
        appendMessage(message);
        message.element.classList.add('pending');
        message.pending = true;
        ulMessages.scrollTop = ulMessages.scrollHeight;
    }

    function broadcastMessage(message) {
        console.log(`Received broadcast message.`);
        if (message.senderId === user.id) return;
        appendMessage(message);
    }

    function appendNotification(notif) {
        spanUsers.innerHTML = notif.userAmount;
        notif.type = "server";
        notif.element = createNotification(notif);
        appendToChat(notif);
    }

    function appendToChat(message) {
        const ul = ulMessages;
        const scrollPos = ul.scrollHeight - ul.offsetHeight;
        const autoScroll = Math.abs(ul.scrollTop - scrollPos) < 1;
        ul.appendChild(message.element);
        if (autoScroll) ul.scrollTop = ul.scrollHeight;
        messages.push(message);
        if (messages.length > 100) messages.shift();
    }

    function appendMessage(message) {
        message.element = createMessageElement(message);
        appendToChat(message);
    }

    function createMessageElement(message) {
        const element = document.createElement('li');
        element.classList.add('message');
        if (message.senderId === user.id) element.classList.add('mine');
        
        const inner = document.createElement('div');
        inner.classList.add('inner');
        element.appendChild(inner);

        const sender = document.createElement('span');
        sender.classList.add('sender');
        sender.appendChild(document.createTextNode(message.senderName));
        if (messages.length) {
            const lastMessage = messages[messages.length-1];
            if (lastMessage.senderId === message.senderId) {
                sender.style.display = 'none';
            }
        }

        inner.appendChild(sender);

        const body = document.createElement('div');
        body.classList.add('body');
        inner.appendChild(body);

        const text = document.createElement('span');
        text.classList.add('text');
        text.appendChild(document.createTextNode(message.text));
        body.appendChild(text);

        const time = dates.format(message.sentAt, '{H}:{MIN}');
        const timeLabel = document.createElement('span');
        timeLabel.classList.add('time');
        timeLabel.appendChild(document.createTextNode(time));
        body.appendChild(timeLabel);

        return element;
    }

    function createNotification(notif) {
        const element = document.createElement('li');
        element.classList.add('message', 'server');
        //if (notif.senderId === user.id) element.classList.add('mine');
        
        const inner = document.createElement('div');
        inner.classList.add('inner');
        element.appendChild(inner);

        const text = document.createElement('span');
        text.classList.add('text');
        text.appendChild(document.createTextNode(notif.text));
        inner.appendChild(text);

        return element;
    }

    return {
        messages,
        send,
        broadcastMessage,
        appendMessage,
        appendNotification,
        subscribe,
        unsubscribe
    }
}
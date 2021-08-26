console.log('> Script started.');

const socket = io();
const form = document.querySelector('.send-message');
const inpMsg = form.querySelector('input');
const ulMessages = document.querySelector('ul.messages');

const manager = messageManager(socket);

form.addEventListener('submit', (e) => {
    e.preventDefault();
    manager.send();
});


function messageManager(socket) {

    const messages = [];

    function send() {
        const text = inpMsg.value;
        if (!text) return;
        inpMsg.value = '';
        const senderId = socket.id;
        const senderName = socket.username;
        const message = {
            text,
            senderId,
            senderName
        };
        sendMessage(message);
        appendMessage(message);
    }

    function sendMessage(message) {
        console.log(`Sending message to server.`);
        message.sentAt = Date.now();
        socket.emit('send-message', message, (response) => {
            console.log(`Send message response after ${response.sendAt - message.sentAt}ms`);
            message.id = response.messageId;
            message.element.classList.remove('pending');
            message.pending = false;
        });
    }

    socket.on('broadcast-message', broadcastMessage);
    function broadcastMessage(message) {
        console.log(`Received broadcast message.`);
        if (message.senderId === socket.id) return;
        appendMessage(message);
    }

    function appendMessage(message) {
        const l = ulMessages;
        const element = createMessageElement(message);

        // scroll to the bottom
        const scrollPos = l.scrollHeight - l.offsetHeight;
        const autoScroll = Math.abs(l.scrollTop - scrollPos) < 1;
        l.appendChild(element);
        if (autoScroll) l.scrollTop = l.scrollHeight;

        message.element = element;
        messages.push(message);
        if (messages.length > 100) messages.shift();
    }

    function createMessageElement(message) {
        const element = document.createElement('li');
        element.classList.add('message');
        if (message.senderId === socket.id) element.classList.add('mine');
        
        const inner = document.createElement('div');
        inner.classList.add('inner');

        const sender = document.createElement('span');
        sender.classList.add('sender');
        sender.appendChild(document.createTextNode(message.senderName));
        inner.appendChild(sender);

        const text = document.createElement('span');
        text.classList.add('text');
        text.appendChild(document.createTextNode(message.text));
        inner.appendChild(text);

        element.appendChild(inner);
        return element;
    }

    return {
        messages,
        send,
        sendMessage
    }
}

socket.on('connect', () => {
    console.log(`User connected to client. (id: ${socket.id}, name: ${socket.username}).`);
})

socket.on('save-data', (key, value) => {
    socket[key] = value;
})
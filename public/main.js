console.log('> Script started.');

const form = document.querySelector('.send-message');
const inpMsg = form.querySelector('input');
const ulMessages = document.querySelector('ul.messages');
const spanName = document.querySelector('.name .value');
const spanUsers = document.querySelector('.users .value');

window.addEventListener('resize', resizeChat, true);
function resizeChat(event) {
    ulMessages.style.height = `0`;
    const chat = document.querySelector('.chat');
    const height = chat.clientHeight;
    ulMessages.style.height = `${height}px`;
}
resizeChat(null);


const socket = io();
const manager = MessageManager(socket);


form.addEventListener('submit', (e) => {
    e.preventDefault();
    manager.send();
});


function MessageManager(socket) {

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
        message.element.classList.add('pending');
        message.pending = true;
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

    socket.on('user-joined', userJoined);
    function userJoined(notif) {
        spanUsers.innerHTML = notif.usersAmount;
        notif.type = "server";
        notif.text = `${notif.userName} joined the chat`;
        notif.element = createNotification(notif);
        appendToChat(notif);
    }

    socket.on('user-left', userLeft);
    function userLeft(notif) {
        spanUsers.innerHTML = notif.usersAmount;
        notif.type = "server";
        notif.text = `${notif.userName} left the chat`;
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
        if (message.senderId === socket.id) element.classList.add('mine');
        
        const inner = document.createElement('div');
        inner.classList.add('inner');
        element.appendChild(inner);

        const sender = document.createElement('span');
        sender.classList.add('sender');
        sender.appendChild(document.createTextNode(message.senderName));
        inner.appendChild(sender);

        const text = document.createElement('span');
        text.classList.add('text');
        text.appendChild(document.createTextNode(message.text));
        inner.appendChild(text);

        return element;
    }

    function createNotification(notif) {
        const element = document.createElement('li');
        element.classList.add('message', 'server');
        //if (notif.senderId === socket.id) element.classList.add('mine');
        
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
        sendMessage
    }
}

socket.on('connect', () => {
    console.log(`User connected to client. (id: ${socket.id}, name: ${socket.username}).`);
})

socket.on('save-data', (key, value) => {
    socket[key] = value;
    spanName.innerHTML = socket.username;
})
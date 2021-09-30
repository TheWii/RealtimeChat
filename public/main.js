console.log('> Script started.');

import { MessageManager } from './message-manager.js';

const ulMessages = document.querySelector('ul.messages');
const form = document.querySelector('.send-message');

const divName = document.querySelector('.name');
const spanName = document.querySelector('.name .value');
const btnNameEdit = document.querySelector('.name .edit');
const btnNameSave = document.querySelector('.name .save');
const inpName = document.querySelector('.name .edit-value');


const socket = io();
const manager = MessageManager(socket);


socket.on('connect', () => {
    console.log(`Client -> Connected to server. (id: ${socket.id}, name: ${socket.name}).`);
})

socket.on('save-data', (key, value) => {
    socket[key] = value;
    spanName.innerHTML = socket.name;
})

socket.on('broadcast-message', manager.broadcastMessage);

socket.on('user-joined', userJoined);
function userJoined(notif) {
    notif.text = `${notif.userName} joined the chat`;
    manager.appendNotification(notif);
}

socket.on('user-left', userLeft);
function userLeft(notif) {
    notif.text = `${notif.userName} left the chat`;
    manager.appendNotification(notif);
}


manager.subscribe('send-message', sendMessage);
function sendMessage(data) {
    const message = data.message;
    console.log(`Client -> Sending message to server.`);
    message.sentAt = Date.now();
    socket.emit('send-message', message, (response) => {
        console.log(`Send message response after ${response.time - message.sentAt}ms`);
        message.id = response.messageId;
        message.element.classList.remove('pending');
        message.pending = false;
    });
}


window.addEventListener('resize', resizeChat, true);
function resizeChat(event) {
    ulMessages.style.height = `0`;
    const chat = document.querySelector('.chat');
    const height = chat.clientHeight;
    ulMessages.style.height = `${height}px`;
}
resizeChat(null);


btnNameEdit.addEventListener('click', (e) => {
    e.preventDefault();
    divName.classList.add('active');
    inpName.value = socket.username;
    
});
btnNameSave.addEventListener('click', (e) => {
    e.preventDefault();
    let name = inpName.value;
    if (!name) return;
    name = name.trim();
    if (!name.length) return;
    if (name.length > 20) name = name.slice(0, 19);
spanName.innerHTML = name;
    socket.username = name;
    socket.emit('change-name', { name });
    divName.classList.remove('active');

});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    manager.send();
});
console.log('> Script started.');

import Messenger from './modules/messenger.js';
import Connection from './modules/connection.js';

const ulMessages = document.querySelector('ul.messages');
const form = document.querySelector('.send-message');
const inpMsg = form.querySelector('input');
const spanName = document.querySelector('.name .value');
const spanTyping = document.querySelector('.typing');

const socket = io();
const messenger = Messenger(socket);
const connection = Connection(socket);


connection.subscribe('user-joined', messenger.appendNotification);
connection.subscribe('user-left', messenger.appendNotification);
connection.subscribe('updated-data', update);

messenger.subscribe('started-typing', connection.startedTyping);
messenger.subscribe('stopped-typing', connection.stoppedTyping);
connection.subscribe('user-started-typing', messenger.userStartedTyping);
connection.subscribe('user-stopped-typing', messenger.userStoppedTyping);

messenger.subscribe('send-message', connection.sendMessage);
connection.subscribe('message-response', messenger.messageSent)
connection.subscribe('received-message', messenger.appendMessage);



window.addEventListener('resize', resizeChat, true);
function resizeChat(event) {
    ulMessages.style.height = `0`;
    const chat = document.querySelector('.chat');
    const height = chat.clientHeight;
    ulMessages.style.height = `${height}px`;
}
resizeChat(null);


form.addEventListener('submit', (e) => {
    e.preventDefault();
    messenger.send();
    stopTyping();
});

inpMsg.addEventListener('input', (e) => {
    messenger.typed();
});


function update() {
    spanName.innerHTML = socket.name;
}
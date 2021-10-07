
import { dates } from '../lib/helper.js';
import EventBus from '../lib/events.js';

export default Messenger;

export function Messenger(user) {
    const inpMsg = document.querySelector('.send-message input');
    const spanTyping = document.querySelector('.typing')
    const ulMessages = document.querySelector('ul.messages');
    const spanUsers = document.querySelector('.users .value');

    const bus = EventBus();
    const messages = [];

    function generateMessage() {
        const text = inpMsg.value;
        if (!text) return;
        const senderId = user.id;
        const senderName = user.name;
        return {
            text,
            senderId,
            senderName
        };
    }
    
    function send() {
        const message = generateMessage();
        if (!message) return;
        console.log(`Messenger -> Generating new message.`);
        inpMsg.value = '';
        bus.publish('send-message', message);
        appendMessage(message);
        stoppedTyping();
        message.element.classList.add('pending');
        message.pending = true;
        ulMessages.scrollTop = ulMessages.scrollHeight;
    }

    function messageSent(message, response) {
        message.id = response.messageId;
        message.element.classList.remove('pending');
        message.pending = false;
    }

    function appendMessage(message) {
        console.log(`Messenger -> Appending message.`);
        message.element = createMessageElement(message);
        appendToChat(message);
    }
    
    function appendNotification(notif) {
        console.log(`Messenger -> Appending notification.`);
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
        if (messages.length > 100) {
            const message = messages.shift()
            ul.removeChild(message.element);
        }
    }

    let typing = null;
    function typed() {
        if (!typing) {
            console.log(`Messenger -> Started typing...`);
            bus.publish('started-typing'); 
        }
        window.clearTimeout(typing);
        typing = setTimeout(stoppedTyping, 2000);
        bus.publish('typed');
    }
    function stoppedTyping() {
        console.log(`Messenger -> Stopped typing.`);
        window.clearTimeout(typing);
        typing = null;
        bus.publish('stopped-typing');
    }
    
    const usersTyping = [];
    function userStartedTyping(they) {
        if (they.id !== user.id) {
            usersTyping.push(they);
            renderTypingMessage();
        }
        bus.publish('user-started-typing');
    };
    function userStoppedTyping(they) {
        if (they.id !== user.id) {
            const i = usersTyping.indexOf(they);
            usersTyping.splice(i, 1);
            renderTypingMessage();
        }
        bus.publish('user-stopped-typing');
    };    


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
                element.classList.add('successive');
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

        const time = dates.format(message.sentAt, '{H}:{0MIN}');
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

    function renderTypingMessage() {
        console.log('Messenger -> Rendering typing message');
        const users = usersTyping.map(user => user.name);
        let msg = `${users.join(', ')} ${users.length > 1 ? 'are' : 'is'} typing...`;
        if (!usersTyping.length) msg = '';
        console.log(msg);
        spanTyping.innerHTML = msg;
    }


    return {
        messages,
        send,
        messageSent,
        appendMessage,
        appendNotification,
        typed,
        userStartedTyping,
        userStoppedTyping,
        subscribe: bus.subscribe,
        unsubscribe: bus.unsubscribe
    }
}
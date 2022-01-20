<template>
<div class="chat container box vertical-grow">
    <ChatMessages
      :userId="io.userId"
      :messages="messages"
      :typing="typing"
    ></ChatMessages>
    <ChatInput
      @send="sendMessage"
    ></ChatInput>
</div>
</template>

<script>
import ChatMessages from './ChatMessages.vue';
import ChatInput from './ChatInput.vue';
export default {
    name: 'ChatContainer',
    components: {
        ChatMessages,
        ChatInput
    },
    props: [ 'io' ],
    data() { return {
        name: this.$cookies.get('name'),
        nextKey: 1,
        maxMessageCount: 100,
        messages: [],
        typing: []
    }},
    mounted() {
        this.io.$on('room:joined', this.joined.bind(this));
        this.io.$on('room:broadcast_message', this.receivedMessage.bind(this));
        this.io.$on('room:remove_message', this.removeMessage.bind(this));
        this.io.$on('room:user_joined', this.userJoined.bind(this));
        this.io.$on('room:user_left', this.userLeft.bind(this));
    },
    methods: {
        // EVENT LISTENERS
        joined(room) {
            console.log(`Joined room.`);
            for (let message of room.messages) {
                this.addMessage(message);
            }
            this.messages = room.messages;
            this.typing = room.typing;
        },
        receivedMessage(message) {
            if (message.senderId === this.io.userId) return; // ignore my own messages
            console.log(`Message#${message.id} received.`);
            this.addMessage(message);
        },
        userJoined(data) {
            this.addMessage({
                type: 'server',
                text: `${data.userName} joined the room`
            });
        },
        userLeft(data) {
            this.addMessage({
                type: 'server',
                text: `${data.userName} left the room`
            });
        },

        // CHAT METHODS
        isSucessive(message) {
            if (message.type !== 'user') return false;
            const lastMessage = this.messages[this.messages.length-1];
            if (!lastMessage) return false;
            return message.senderId === lastMessage.senderId;
        },

        addMessage(message) {
            message.key = this.nextKey++;
            message.successive = this.isSucessive(message);
            this.messages.push(message);
            if (this.messages.length > this.maxMessageCount) {
                this.removeMessage(0);
            }
        },
        removeMessage(param) {
            let message;
            if (typeof param === 'number') { // by index
                message = this.messages[param];
            }
            else if (typeof param === 'string') { // by id
                message = this.messages.find(msg => msg.id === param);
            }
            else if (this.messages.includes(param)) { // the message obj itself
                message = param;
            }
            if (!message) return;
            const index = this.messages.indexOf(message);
            console.log(`Message removed.`);
            return this.messages.splice(index, 1);
        },

        generateMessage(text, options={}) {
            console.log(`Message is being generated.`);
            return {
                type: "user",
                key: null,
                id: null,
                pending: true,
                senderId: this.io.userId,
                senderName: this.name,
                time: Date.now(),
                text,
                ...options
            };
        },

        // ACTION METHODS
        sendMessage(text) {
            const message = this.generateMessage(text);
            console.log(`Sending message.`);
            this.io.emit('room:send_message', { text }, (res) => {
                console.log(` Message#${res.messageId} was sent.`);
                message.id = res.messageId;
                message.pending = false;
            });
            this.addMessage(message);
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../../styles/container.scss';

@media screen and (max-width: 500px) {
    main {
        padding: 0;
    }

    .container.box {
        padding-left: 1rem;
        padding-right: 1rem;
    }
}
</style>
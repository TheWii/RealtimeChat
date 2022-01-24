<template>
<div class="chat container">
    <ChatMessages
      :userId="io.userId"
      :messages="messages"
      :typing="typing"
    ></ChatMessages>
    <ChatInput
      @send="sendMessage"
      @started-typing="startedTyping"
      @stopped-typing="stoppedTyping"
    ></ChatInput>
</div>
</template>

<script>
import { reactive } from 'vue';
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
        this.io.$on('room:started_typing', this.updateTyping.bind(this, 'started'));
        this.io.$on('room:stopped_typing', this.updateTyping.bind(this, 'stopped'));
    },
    methods: {
        // EVENT LISTENERS
        joined(room) {
            console.log(`Joined room.`);
            for (let message of room.messages) {
                this.addMessage(message);
            }
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
            return reactive({
                type: "user",
                key: null,
                id: null,
                pending: true,
                senderId: this.io.userId,
                senderName: this.name,
                time: Date.now(),
                text,
                ...options
            });
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
        },

        updateTyping(action, data) {
            if (data.userId === this.io.userId) return;
            console.log(`${data.userName} ${action} typing.`);
            switch (action) {
                case 'started':
                    this.typing.push(data);
                    break;
                case 'stopped': {
                    this.typing = this.typing.filter(el => el.userId !== data.userId);
                }
            }
            console.log(this.typing.map(el => el.userName));
        },

        startedTyping() {
            this.io.emit('room:started_typing');
        },
        stoppedTyping() {
            this.io.emit('room:stopped_typing');
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../../styles/chat/container.scss';

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
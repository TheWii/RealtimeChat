<template>
    <div class="chat-messages vertical-grow">
        <div class="messages-wrap vertical-grow" ref="chat">
            <ul class="messages" ref="messages">
                <li
                    v-for="message in messages"
                    :class="[
                        'message',
                        message.type,
                        {
                            mine: isMine(message),
                            successive: message.successive
                        },
                    ]"
                    :key="message.key"
                >
                    <div v-if="message.type === 'user'" class="inner">
                        <span class="sender">{{ message.senderName }}</span>
                        <div class="body">
                            <span class="text">{{ message.text }}</span>
                            <span class="time">{{ getTime(message) }}</span>
                        </div>
                    </div>

                    <div v-else-if="message.type === 'server'" class="inner">
                        <span class="text">{{ message.text }}</span>
                    </div>
                </li>
            </ul>
        </div>
        <div class="info">
            <span class="typing">{{typingMessage}}</span>
        </div>
    </div>
</template>

<script>
export default {
    name: "ChatMessages",
    props: ["userId", "messages", "typing"],
    mounted() {
        window.addEventListener("resize", this.resizeChat.bind(this), true);
        this.resizeChat();
    },
    computed: {
        typingMessage() {
            if (!this.typing.length) return '';
            const users = this.typing.map(el => el.userName);
            const verb = users.length > 1 ? 'are' : 'is';
            const list = users.length > 3 ? 'Multiple users' : users.join(', ');
            const msg = `${list} ${verb} typing...`;
            return msg;
        }
    },
    methods: {
        resizeChat() {
            const list = this.$refs.messages;
            const chat = this.$refs.chat;
            list.style.height = `0`;
            list.style.height = `${chat.clientHeight}px`;
        },
        isMine(message) {
            return message.senderId === this.userId;
        },
        getTime(message) {
            const time = new Date(message.time).toTimeString();
            return time.replace(/.*?(\d{2}:\d{2}).*/, "$1");
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../../styles/chat/messages.scss';

.chat-messages {
    padding: 1rem;
    border: 0.0625em solid var(--outline-input);
    border-radius: 0.25em;
    background: var(--background-chat);
}

.info {
    height: 1rem;
    text-align: left;
    color: var(--gray);
}
</style>
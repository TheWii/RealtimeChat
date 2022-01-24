<template>
<form class="chat-input"
  @submit="send"
>
    <input type="text" placeholder="Message"
      v-model="text"
      @input="typed"
    >
    <button type="submit" class="send-message">SEND</button>
</form>
</template>

<script>
export default {
    name: 'ChatInput',
    components: {
    },
    data() { return {
        text: '',
        delay: 2000,
        typing: null
    }},
    methods: {
        typed() {
            if (!this.typing) this.startTyping();
            window.clearTimeout(this.typing);
            this.typing = setTimeout(this.stopTyping.bind(this), this.delay);
            this.$emit('typed');
        },
        startTyping() {
            console.log(`Started typing...`);
            this.$emit('started-typing');
        },
        stopTyping() {
            console.log(`Stopped typing...`);
            window.clearTimeout(this.typing);
            this.typing = null;
            this.$emit('stopped-typing');
        },
        send(event) {
            event.preventDefault();
            this.stopTyping();
            this.$emit('send', this.text);
            this.text = '';
        }
    }
}
</script>

<style lang="scss" scoped>
input {
    padding: 0.4em 0.7em;
    border: 0.0625em solid var(--outline-input);
    border-radius: 0.25em;
    background: var(--background-input);

    &:focus,
    &:active {
        border-color: var(--outline-input-dark);
    }

    &::placeholder {
        color: var(--text);
        opacity: 0.5;
    }  
}

.chat-input {
    display: flex;
    flex-direction: row;
    gap: 0.25rem;

    input {
        background: var(--background-chat);
        flex-grow: 1;
        min-width: 0;
    }

    button.send-message {
        padding: 0.4rem 2rem;
    }
}

@media screen and (max-width: 500px) {
    .chat-input {
        flex-direction: column;
        gap: 0.5rem;
    }
}
</style>
<template>
<Header>
    <HomeButton></HomeButton>
</Header>
<main class="vertical-grow">
    <div class="chat-container">
        <ChatDetails
            :io="io"
        ></ChatDetails>
        <ChatContainer
            :io="io"
        ></ChatContainer>
    </div>
</main>
</template>

<script>
import Header from '../components/Header.vue';
import HomeButton from '../components/nav/HomeButton.vue';
import ChatContainer from '../components/chat/ChatContainer.vue';
import ChatDetails from '../components/chat/ChatDetails.vue';
import * as Rooms from '../services/rooms.js';

export default {
    name: 'Room',
    components: {
        Header,
        HomeButton,
        ChatContainer,
        ChatDetails
    },
    props: [ 'io', 'id' ],
    data() { return {
        name: this.$cookies.get('name'),
        token: null
    }},
    /** Attempt to authorize user to join the room.
     * 
     *  Succeeds when: - User is already authorized
     *                 - Room is public
     * 
     *  Fails when:    - User is unauthorized and room
     *                   is private (requires password)
     *                 - Room with id doesn't exist.
     */ 
    async beforeRouteEnter(to, from, next) {
        const id = to.params.id;
        const res = await Rooms.authorize(id);
        if (res.status === 401) return next(`/rooms/${id}/join`);
        if (res.status !== 200) return next(`/rooms`);
        next(vm => {
            vm.token = res.content.token
        });
    },
    async mounted() {
        this.io.emit('room:join', { token: this.token });
        this.io.$on('room:unauthorized', () => {
            this.$router.push({ name: 'join-room', params: { id: this.id }});
        });
    },
    beforeRouteLeave() {
        this.io.emit('room:leave');
    }
}
</script>

<style lang="scss" scoped>

body {
    height: 100vh;
}

main {
    flex-grow: 1;
    margin: 1rem auto;
    max-width: 70rem;

    ::-webkit-scrollbar {
        width: 0.625rem;
    }

    ::-webkit-scrollbar-track {
        background: var(--scroll-track);
        border-radius: 0.3em;
    }
    ::-webkit-scrollbar-thumb {
        background: var(--scroll-thumb);
        border-radius: 0.3em;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: var(--scroll-thumb-hover);
    }
}

.chat-container {
    flex-grow: 1;
    display: grid;
    grid-template-columns: 15rem auto;
    grid-gap: 1rem;
}

@media screen and (max-width: 800px) {
    .chat-container {
        padding: 2rem 3rem;
        grid-template-columns: auto;
        grid-template-rows: 2rem auto;
        border-radius: 0.25rem;
        box-shadow: 0 0 0.75rem rgba(0, 0, 0, 0.075);
        background: var(--background-container);
    }
}

@media screen and (max-width: 500px) {
    main {
        padding: 0;
        margin-bottom: 0;
    }

    .chat-container {
        padding: 1.5rem;
    }
}
</style>
<template>
<Header>
    <HomeButton></HomeButton>
</Header>
<main class="vertical-grow">
    <div class="container vertical-grow">
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
import * as Rooms from '../services/rooms.js';

export default {
    name: 'Room',
    components: {
        Header,
        HomeButton,
        ChatContainer
    },
    props: [ 'io', 'id' ],
    data() { return {
        name: this.$cookies.get('name'),
        token: null,
        room: {}
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
        this.io.$on('room:joined', (room) => {
            this.room = room;
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
    margin: 1rem auto;
    max-width: 50rem;

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

.container {
    padding: 0.5rem;

    > .name {
        color: var(--text-blue);
        font-size: 1.3em;
        text-align: center;
    }

    > .top {
        display: flex;
        gap: 1rem;
        padding: 0.2em;
        justify-content: space-between;
        align-items: center;
    }    
}

@media screen and (max-width: 500px) {
    main {
        padding: 0;

        .container {
            > .top {
                flex-direction: column;
                gap: 0.2em;
            }

            .send-message {
                flex-direction: column;
            }
        }
    }
}
</style>
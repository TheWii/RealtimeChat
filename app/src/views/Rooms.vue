<template>
    <Header>
        <LeaveButton v-if="name"></LeaveButton>
    </Header>
    <main>
        <h1 class="title">Join A Room</h1>
        <div v-if="loading" class="loading message">
            <p>Loading...</p>
        </div>
        <div v-else-if="error" class="error message">
            <p>Something went wrong.</p>
            <button
              @click="load"
            >Retry</button>
        </div>
        <div v-else>
            <ul class="rooms">
                <li v-for="room in rooms" :key="room.id">
                    <Room
                      :data="room"
                      @join="join"
                    ></Room>
                </li>
            </ul>
        </div>
    </main>
</template>

<script>
import Header from "../components/Header.vue";
import LeaveButton from '../components/nav/LeaveButton.vue';
import Room from './rooms/Room.vue';
import * as Rooms from '../services/rooms.js';

export default {
    name: 'Rooms',
    components: {
        Header,
        LeaveButton,
        Room
    },
    props: [ 'io' ],
    data() { return {
        name: this.$cookies.get('name'),
        loading: true,
        error: false,
        rooms: []
    }},
    mounted() {
        this.load();
    },
    methods: {
        async load() {
            this.loading = true;
            const rooms = await Rooms.getAll();
            this.error = rooms === null;
            this.loading = false;
            if (!this.error) this.rooms = rooms;
        },
        join(room) {
            console.log(`Joining room: #${room.id}`);
            this.$router.push(`/room/${room.id}`);
        }
    }
}
</script>

<style lang="scss" scoped>
main {
    max-width: 50em;

    .message {
        text-align: center;
    }

    .error > p {
        margin-bottom: 0.5rem;
    }
}

.title {
    font-size: 1.75rem;
    text-align: center;
    padding-bottom: 1.5rem;
}

.rooms {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
</style>
<template>
<Header>
    <HomeButton></HomeButton>
</Header>
<main>

</main>
</template>

<script>
import Header from '../components/Header.vue';
import HomeButton from '../components/nav/HomeButton.vue';
import * as Rooms from '../services/rooms.js';

export default {
    name: 'Room',
    components: {
        Header,
        HomeButton
    },
    props: [ 'io', 'id' ],
    data() { return {
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

<style>

</style>
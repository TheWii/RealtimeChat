<template>
    <Header>
        <HomeButton></HomeButton>
    </Header>
    <main>
        <div class="container box" v-if="room">
            <h1>Join {{room.name}}</h1>
            <div>
                <p v-if="room.isPrivate">
                    You need the password to join this room.
                </p>
                <p v-else>
                    This room is public!
                </p>
                <p class="gray small">
                    {{room.users}}/{{room.limit}} users
                </p>
            </div>
            <form id="form-join" @submit="submit">
                <TextInput
                    v-if="room.isPrivate"
                    :field="'password'"
                    :label="'Password'"
                    :required="true"
                    v-model:value="password"
                ></TextInput>
                <button type="submit">Join</button>
                <div class="error" v-if="error">
                    <span class="message">{{ error }}</span>
                </div>
            </form>
        </div>
    </main>
</template>

<script>
import Header from "../components/Header.vue";
import HomeButton from "../components/nav/HomeButton.vue";
import TextInput from "../components/TextInput.vue";
import * as Rooms from "../services/rooms.js";

export default {
    name: "JoinRoom",
    components: {
        Header,
        HomeButton,
        TextInput,
    },
    props: ["io", "id"],
    data() { return {
        room: null,
        error: ""
    }},
    async beforeRouteEnter(to, from, next) {
        const room = await Rooms.get(to.params.id);
        if (!room) next({ name: 'rooms' });
        next( vm => {
            vm.room = room;
        });
    },
    methods: {
        async submit(event) {
            event.preventDefault();
            console.log(`JoinRoom -> Joining room #${this.id}}`);
            if (this.room.isPrivate) {
                const password = this.password;
                const result = await Rooms.authorize(this.id, { password });
                if (!result.ok) {
                    this.error = result.content;
                    return;
                }
            }
            this.error = "";
            this.$router.push({ name: "room", params: { id: this.id } });
        },
    },
};
</script>

<style lang="scss" scoped>
@import "../styles/container.scss";
main {
    max-width: 32em;

    .message {
        text-align: center;
    }
}

.error {
    font-size: 1rem;
    color: var(--red);
}

form {
    padding-top: 1rem;
    gap: 0.75rem;
}

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

<template>
    <div class="chat-details container" v-if="room">
        <p class="name">{{ room.name }}</p>
        <div class="users section">
            <div class="top">
                <span class="label">Users</span>
                <div class="info" aria-label="Users in the room">
                    <span class="value">{{room.users.length}} / {{room.limit}}</span>
                    <img class="icon" src="../../images/users-fill.svg" alt="Users" />
                </div>
            </div>
        </div>
    </div>
    <div class="chat-details container loading" v-else>
        Loading...
    </div>
</template>

<script>
export default {
    name: "ChatDetails",
    props: ["io"],
    data() {
        return {
            room: null,
        };
    },
    mounted() {
        this.io.$on("room:joined", this.load.bind(this));
        this.io.$on("room:user_joined", this.addUser.bind(this));
        this.io.$on("room:user_left", this.removeUser.bind(this));
    },
    methods: {
        load(room) {
            this.room = room;
            this.loaded = true;
        },
        addUser(data) {
            const { userId: id, userName: name } = data;
            if (id === this.io.userId) return;
            this.room.users.push({ id, name });
        },
        removeUser(data) {
            const { userId } = data;
            if (userId === this.io.userId) return;
            const { users } = this.room;
            const user = users.find(user => user.id === userId);
            users.splice(users.indexOf(user), 1);
        }
    },
};
</script>

<style lang="scss" scoped>
@import "../../styles/chat/container.scss";

img {
    display: inline;
}

.chat-details {
    width: 100%;
}

.name {
    font-size: 1.25rem;
    font-weight: 600;
}

.section {
    .top {
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;
    }
    .info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
}

@media screen and (max-width: 800px) {
    .container {
        flex-direction: row;
        padding: 0;
        align-items: center;
    }

    .section {
        .label {
            display: none;
        }
    }
}
</style>
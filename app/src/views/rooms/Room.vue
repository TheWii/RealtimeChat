<template>
<div class="room">
    <div class="left">
        <h2 class="name">{{data.name}}</h2>
        <span class="type">{{type}}</span>
    </div>
    <div class="right">
        <span class="counter">{{data.users}}/{{data.limit}}</span>
        <button @click="join">
            JOIN
        </button>
    </div>
</div>
</template>

<script>
export default {
    props: [ 'data' ],
    computed: {
        type() {
            return this.data.isPrivate ? 'Private' : 'Public'
        }
    },
    methods: {
        join() {
            if (this.data.users >= this.data.limit) return;
            this.$emit('join', this.data);
        }
    }
}
</script>

<style lang="scss" scoped>

.room {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 2rem;
    border-radius: 0.25rem;
    box-shadow: 0 0 0.75rem rgba(0, 0, 0, 0.075);
    background: var(--background-container);

    > .left {
        text-align: center;
    }

    > .right {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
}

.name {
    display: inline;
    font-size: 1.25rem;
}

.type {
    margin-left: 0.5rem;
    color: var(--gray);
    text-transform: capitalize;
}

.counter {
    font-weight: 600;
}

button {
      padding: 0.3em 0.5em;
}

@media screen and (max-width: 500px) {
    .room {
        padding: 0.5rem;
    }
}

</style>
<template>
    <li class="item">
        <a
          @click="action"
          :title="'Leave session'"
        >
            <img src="../../images/nav-leave.svg" alt="Home">
            <span>Leave</span>
        </a>
    </li>
</template>

<script>
export default {
    name: 'LeaveButton',
    methods: {
        action() {
            this.$cookies.remove('name');
            this.$router.push({name:'welcome'});
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../../styles/header/nav.scss";
</style>
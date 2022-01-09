<template>
    <li class="item">
        <router-link to="/"
          :title="'Navigate back to home page'"
        >
            <img src="../../images/nav-home.svg" alt="Home">
            <span>Home</span>
        </router-link>
    </li>
</template>

<script>
export default {
    name: 'HomeButton',
}
</script>

<style lang="scss" scoped>
@import "../../styles/header/nav.scss";
</style>
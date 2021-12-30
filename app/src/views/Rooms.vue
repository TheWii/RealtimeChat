<template>
    <Header></Header>
    <main>
    </main>
</template>

<script>
import Header from "../components/Header.vue";
export default {
    name: 'Rooms',
    components: { Header },
    props: [ 'io' ]
}
</script>

<style lang="scss" scoped>
</style>
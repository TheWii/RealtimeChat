<template>
<router-view></router-view>
</template>

<script>
import { io } from 'socket.io-client';
export default {
  name: 'App',
  mounted() {
    this.io = io();
  }
}
</script>

<style lang="scss">
@import './styles/main.scss';
</style>
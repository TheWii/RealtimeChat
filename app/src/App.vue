<template>
<router-view
  :io="io"
></router-view>
</template>

<script>
import Connection from './services/connection.js';
export default {
  name: 'App',
  data() { return {
    io: null
  }},
  mounted() {
    this.io = Connection();
    this.$router.afterEach(() => {
      this.io.$resetListeners();
    });
  }
}
</script>

<style lang="scss">
@import './styles/main.scss';
</style>
<template>
  <Header></Header>
  <main>
    <div class="container box">
      <h1>Welcome, Stranger</h1>
      <div>
        <p>How should we call you?</p>
        <p class="gray small">(This name will be displayed to other users)</p>
      </div>
      <form id="form-join"
        @submit="submit"
      >
        <TextInput
          :field="'name'"
          :label="'Nickname'"
          :required="true"
          v-model:value="name"
        ></TextInput>
        <button type="submit">Continue</button>
        <div class="error" v-if="error">
          <span class="message">{{error}}</span>
        </div>
      </form>
    </div>
  </main>
</template>

<script>
import Header from "../components/Header.vue";
import TextInput from "../components/TextInput.vue";
import * as User from '../services/user.js';

export default {
  name: "Welcome",
  components: {
    Header,
    TextInput,
  },
  props: [ 'io' ],
  data() {
    return {
      name: "",
      error: ""
    };
  },
  methods: {
    async submit(event) {
      event.preventDefault();
      console.log(`Welcome -> Continue. name=${this.name}`);
      const result = await User.setName(this.name);
      if (!result.ok) {
        this.error = result.content;
        return;
      }
      this.error = "";
      this.$router.push({name:'rooms'});
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../styles/container.scss';
main {
    margin: 3rem auto;
    max-width: 32em;
    padding: 0 2rem;
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
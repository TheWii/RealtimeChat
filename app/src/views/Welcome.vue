<template>
  <Header></Header>
  <main>
    <div class="container box">
      <h1 class="blue">Welcome, Stranger</h1>
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
      </form>
    </div>
  </main>
</template>

<script>
import Header from "../components/Header.vue";
import TextInput from "../components/TextInput.vue";

export default {
  name: "Welcome",
  components: {
    Header,
    TextInput,
  },
  data() {
    return {
      name: "",
    };
  },
  methods: {
    submit(event) {
      event.preventDefault();
      console.log(`Welcome -> Continue. name=${this.name}`);
    },
  },
};
</script>

<style scoped>
main {
    margin: 2rem auto;
    max-width: 30em;
    padding: 0 1rem;
}

.container {
    display: flex;
    flex-direction: column;
    width: 100%;
}
.container.box {
    gap: 1rem;
    padding: 2rem;
    border-radius: 0.25rem;
    border: 0.0625rem solid var(--outline-input);
    background: var(--background-container);
}
.container.box > * {
    text-align: center;
}

form {
    padding-top: 1rem;
    gap: 0.75rem;
}
</style>
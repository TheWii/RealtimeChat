<template>
<div
  :class="[ field, 'input', 'field' ]"
>
    <input
      :id="id"
      :name="field"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      :required="required"
      :value="value"
      @input="update($event.target.value)"
    >
    <label
      :for="id"
    >{{label}}</label>
</div>
</template>

<script>
export default {
    name: 'Input',
    props: {
        field: {
            type: String,
            default: ''
        },
        label: {
            type: String,
            default: ''
        },
        value: {
            type: String,
            default: ''
        },
        required: {
            type: Boolean,
            default: false
        },
        placeholder: {
            type: String,
            default: ''
        },
        autocomplete: {
            type: String,
            default: 'off'
        }
    },
    computed: {
        id() {
            return `input-${this.field}`;
        }
    },
    methods: {
        update(value) {
            this.$emit('update:value', value);
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../styles/forms/input.scss';
</style>
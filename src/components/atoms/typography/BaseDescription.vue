// BaseDescription.vue
<template>
  <div class="about en-small">
    <slot>{{ text }}</slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BaseDescription',
  props: {
    text: {
      type: String,
      default: ''
    }
  }
});
</script>

<style scoped>
.about {
  color: var(--text-usual);
  text-align: left;
  position: relative;
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>
// BaseTitle.vue
<template>
  <div class="title en-body">
    <slot>{{ text }}</slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BaseTitle',
  props: {
    text: {
      type: String,
      default: ''
    }
  }
});
</script>

<style scoped>
.title {
  color: var(--text-header);
  text-align: left;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>


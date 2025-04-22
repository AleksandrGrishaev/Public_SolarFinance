<!-- src/components/atoms/buttons/BaseButton.vue -->
<template>
  <div 
    class="form-button"
    :class="[variant === 'outline' ? 'text-button' : 'primary-button']"
    @click="onClick"
  >
    <div class="button-text">
      {{ text }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BaseButton',
  props: {
    text: {
      type: String,
      required: true
    },
    variant: {
      type: String,
      default: 'primary',
      validator: (value: string) => ['primary', 'outline'].includes(value)
    }
  },
  emits: ['click'],
  methods: {
    onClick(): void {
      this.$emit('click')
    }
  }
});
</script>

<style scoped>
.form-button {
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-xl);
  font-size: var(--font-button-size);
  font-weight: var(--font-button-weight);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-speed) var(--transition-fn);
}

.primary-button {
  background-color: var(--accent-color);
  color: var(--text-contrast);
  border: none;
  backdrop-filter: blur(4px);
}

.primary-button:hover {
  filter: brightness(1.1);
}

.text-button {
  background-color: transparent;
  color: var(--accent-color);
  padding: var(--spacing-xs) var(--spacing-sm);
  border: none;
}

.text-button:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.button-text {
  font-size: var(--font-button-size);
  line-height: var(--font-button-line-height);
  font-weight: var(--font-button-weight);
}
</style>
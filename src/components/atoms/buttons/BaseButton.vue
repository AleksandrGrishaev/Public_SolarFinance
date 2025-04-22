<template>
    <div 
      class="form-button"
      :class="[variant === 'outline' ? 'text-button' : '']"
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
    background-color: var(--accent-color);
    color: var(--text-contrast);
    border-radius: var(--border-radius-xl);
    font-size: var(--font-button-size);
    font-weight: var(--font-button-weight);
    border: none;
    text-align: center;
    cursor: pointer;
    transition: all var(--transition-speed) var(--transition-fn);
  }
  
  .form-button:hover {
    filter: brightness(1.1);
  }
  
  .form-button.text-button {
    background-color: transparent;
    color: var(--accent-color);
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  
  .button-text {
    font-size: var(--font-button-size);
    line-height: var(--font-button-line-height);
    font-weight: var(--font-button-weight);
  }
  </style>
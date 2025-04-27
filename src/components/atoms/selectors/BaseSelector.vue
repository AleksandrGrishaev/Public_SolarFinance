<!-- src/components/atoms/selectors/BaseSelector.vue -->
<template>
    <div class="base-selector">
      <div 
        v-for="option in options" 
        :key="option.value"
        class="selector-option" 
        :class="{'active': modelValue === option.value}"
        @click="handleSelect(option.value)"
      >
        {{ option.label }}
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  const props = defineProps({
    modelValue: {
      type: [String, Number],
      required: true
    },
    options: {
      type: Array as () => Array<{
        label: string,
        value: string | number
      }>,
      required: true
    }
  });
  
  const emit = defineEmits(['update:modelValue']);
  
  const handleSelect = (value: string | number) => {
    emit('update:modelValue', value);
  };
  </script>
  
  <style scoped>
  .base-selector {
    background-color: var(--bg-field-dark, #2A2A2A);
    border-radius: 28px;
    display: flex;
    padding: 6px;
    gap: 4px;
  }
  
  .selector-option {
    padding: 8px 16px;
    border-radius: 34px;
    font-size: var(--font-small-size, 10px);
    font-weight: 600;
    color: var(--text-usual, #FFFFFF);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .selector-option.active {
    background-color: black;
    color: var(--text-contrast, #FFFFFF);
  }
  
  .selector-option:hover:not(.active) {
    background-color: rgba(255, 255, 255, 0.05);
  }
  </style>
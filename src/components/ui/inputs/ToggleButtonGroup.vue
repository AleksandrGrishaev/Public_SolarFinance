<!-- src/components/ui/inputs/ToggleButtonGroup.vue -->
<template>
    <div class="toggle-group">
      <button 
        v-for="(option, index) in options"
        :key="index"
        class="toggle-button"
        :class="{ 
          'active': modelValue === option.value,
          'custom-active': modelValue === option.value && option.customActiveClass
        }"
        @click="updateValue(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </template>
  
  <script setup lang="ts">
  const props = defineProps({
    modelValue: {
      type: [String, Number, Boolean],
      required: true
    },
    options: {
      type: Array,
      required: true,
      // Each option should have: { label, value, customActiveClass? }
    }
  });
  
  const emit = defineEmits(['update:modelValue']);
  
  const updateValue = (value) => {
    emit('update:modelValue', value);
  };
  </script>
  
  <style scoped>
  .toggle-group {
    display: flex;
    height: 32px;
    background-color: #949496;
    border-radius: 28px;
    padding: 6px;
    gap: 4px;
  }
  
  .toggle-button {
    height: 100%;
    padding: 0 16px;
    border: none;
    border-radius: 34px;
    background: transparent;
    color: #404040;
    font-size: 12px;
    cursor: pointer;
    white-space: nowrap;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .toggle-button.active {
    background-color: black;
    color: white;
  }
  
  .toggle-button.custom-active {
    background-color: var(--custom-active-bg, #A44942);
  }
  </style>
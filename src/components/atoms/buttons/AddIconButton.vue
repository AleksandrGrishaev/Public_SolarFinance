<!-- src/components/atoms/buttons/AddIconButton.vue -->
<template>
    <div 
      class="add-icon-button"
      :class="{ 'large': size === 'large', 'small': size === 'small' }"
      @click="$emit('click')"
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 16 16" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        :class="{ 'large-icon': size === 'large', 'small-icon': size === 'small' }"
      >
        <path 
          d="M8 3.33325V12.6666M3.33334 7.99992H12.6667" 
          stroke="currentColor" 
          stroke-width="1.5" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        />
      </svg>
    </div>
  </template>
  
  <script setup lang="ts">
  const props = defineProps({
    size: {
      type: String,
      default: 'medium', // 'small', 'medium', 'large'
      validator: (value: string) => ['small', 'medium', 'large'].includes(value)
    }
  });
  
  defineEmits(['click']);
  </script>
  
  <style scoped>
  .add-icon-button {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1.5px dashed #949496;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #949496;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .add-icon-button:hover {
    border-color: #FFFFFF;
    color: #FFFFFF;
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .add-icon-button.small {
    width: 24px;
    height: 24px;
  }
  
  .add-icon-button.large {
    width: 48px;
    height: 48px;
  }
  
  .small-icon {
    width: 12px;
    height: 12px;
  }
  
  .large-icon {
    width: 24px;
    height: 24px;
  }
  </style>
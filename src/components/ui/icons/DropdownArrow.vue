<!-- src/components/ui/icons/DropdownArrow.vue -->
<template>
    <svg 
      :width="size" 
      :height="size * 0.6" 
      viewBox="0 0 10 6" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M1 1L5 5L9 1" 
        :stroke="color" 
        :stroke-width="strokeWidth" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
    </svg>
  </template>
  
  <script setup lang="ts">
  defineProps({
    size: {
      type: Number,
      default: 10
    },
    color: {
      type: String,
      default: 'currentColor'
    },
    strokeWidth: {
      type: Number,
      default: 1.5
    }
  });
  </script>
<!-- src/components/ui/inputs/ColorPicker.vue -->
<template>
    <div class="color-picker">
      <div 
        class="color-preview" 
        :style="{ backgroundColor: modelValue || '#949496' }"
        @click="isOpen = !isOpen"
      ></div>
      
      <div v-if="isOpen" class="color-palette">
        <div 
          v-for="color in colorOptions" 
          :key="color"
          class="color-option"
          :style="{ backgroundColor: color }"
          @click="selectColor(color)"
        ></div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  
  const props = defineProps({
    modelValue: {
      type: String,
      default: '#949496'
    }
  });
  
  const emit = defineEmits(['update:modelValue']);
  
  const isOpen = ref(false);
  
  const colorOptions = [
    '#F8D76E', // Yellow
    '#A2C94F', // Green
    '#70B1E0', // Blue
    '#E882A3', // Pink
    '#8F7ED8', // Purple
    '#D85A5A', // Red
    '#5AD8B9', // Teal
    '#D8A55A', // Orange
    '#949496', // Gray
    '#000000'  // Black
  ];
  
  const selectColor = (color) => {
    emit('update:modelValue', color);
    isOpen.value = false;
  };
  </script>
  
  <style scoped>
  .color-picker {
    width: 83px;
    height: 32px;
    background-color: #949496;
    border-radius: 14px;
    cursor: pointer;
    padding: 4px;
    position: relative;
  }
  
  .color-preview {
    width: 100%;
    height: 100%;
    border-radius: 10px;
  }
  
  .color-palette {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 8px;
    background-color: #555555;
    border-radius: 8px;
    padding: 8px;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
    z-index: 10;
    width: 180px;
  }
  
  .color-option {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.2s;
  }
  
  .color-option:hover {
    transform: scale(1.1);
  }
  </style>
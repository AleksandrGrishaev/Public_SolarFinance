<!-- src/components/ui/inputs/ToggleSwitch.vue -->
<template>
    <div class="toggle-switch" @click="toggle">
      <div class="toggle-track" :class="{ 'toggle-on': modelValue }">
        <div class="toggle-thumb"></div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['update:modelValue']);
  
  const toggle = () => {
    emit('update:modelValue', !props.modelValue);
  };
  </script>
  
  <style scoped>
  .toggle-switch {
    width: 59px;
    height: 32px;
    cursor: pointer;
  }
  
  .toggle-track {
    width: 100%;
    height: 100%;
    background-color: #949496;
    border-radius: 16px;
    position: relative;
    transition: all 0.3s ease;
  }
  
  .toggle-thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 26px;
    height: 26px;
    background-color: white;
    border-radius: 50%;
    transition: all 0.3s ease;
  }
  
  .toggle-track.toggle-on .toggle-thumb {
    left: calc(100% - 29px);
  }
  </style>
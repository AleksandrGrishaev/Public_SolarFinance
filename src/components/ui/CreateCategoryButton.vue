<!-- src/components/ui/CreateCategoryButton.vue -->
<template>
    <div class="create-button-container">
      <button class="create-button" @click="$emit('click')">
        <IconPlus class="create-icon" />
        <span>{{ text }}</span>
      </button>
    </div>
  </template>
  
  <script setup lang="ts">
  import { IconPlus } from '@tabler/icons-vue';
  
  defineProps({
    text: {
      type: String,
      default: 'Create category'
    }
  });
  
  defineEmits(['click']);
  </script>
  
  <style scoped>
  .create-button-container {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }
  
  .create-button {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 19px;
    border-radius: 34px;
    border: 1px solid white;
    background: transparent;
    color: white;
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
    cursor: pointer;
  }
  
  .create-icon {
    width: 10px;
    height: 10px;
    color: white;
  }
  </style>
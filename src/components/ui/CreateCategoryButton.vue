<!-- src/components/ui/CreateCategoryButton.vue -->
<template>
    <div class="create-category-button" @click="$emit('click')">
      <div class="icon-wrapper">
        <IconPlus class="plus-icon" />
      </div>
      <span>Add category</span>
    </div>
  </template>
  
  <script setup lang="ts">
  import { IconPlus } from '@tabler/icons-vue';
  
  defineEmits(['click']);
  </script>
  
  <style scoped>
  .create-category-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 12px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    cursor: pointer;
    color: white;
    font-size: 16px;
    font-weight: 500;
    margin-top: 16px;
    transition: background-color 0.2s;
  }
  
  .create-category-button:hover {
    background-color: rgba(255, 255, 255, 0.15);
  }
  
  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
  }
  
  .plus-icon {
    color: #53B794;
    width: 18px;
    height: 18px;
  }
  </style>
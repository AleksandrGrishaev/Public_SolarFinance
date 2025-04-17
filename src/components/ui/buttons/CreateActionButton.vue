<!-- src/components/ui/buttons/CreateActionButton.vue -->
<template>
    <div class="create-action-button" @click="$emit('click')">
      <div class="icon-wrapper">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.23636 9.5V0.5H5.76364V9.5H4.23636ZM0.5 5.76364V4.23636H9.5V5.76364H0.5Z" fill="white"/>
        </svg>
      </div>
      <span>{{ text }}</span>
    </div>
  </template>
  
  <script setup lang="ts">
  defineEmits(['click']);
  
  defineProps({
    text: {
      type: String,
      default: 'Add item'
    }
  });
  </script>
  
  <style scoped>
.create-action-button {
  padding-left: 19px;
  padding-right: 19px;
  padding-top: 9px;
  padding-bottom: 9px;
  border-radius: 34px;
  border: 1px dashed white;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
  max-width: fit-content;
  margin: 0 auto;
}

.create-action-button.unactive {
  opacity: 0.7;
}
  
  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  span {
    color: white;
    font-size: 16px;
    font-family: Inter, sans-serif;
    font-weight: 500;
    line-height: 24px;
    word-wrap: break-word;
  }
  </style>
<!-- src/components/ui/views/BaseBookHeader.vue -->
<template>
    <div class="header-container">
      <h1 class="book-title text-header en-heading">{{ title }}</h1>
      <div v-if="editable" class="edit-icon" @click="$emit('edit')">
        <slot name="edit-icon">
          <IconEdit :size="24" class="icon" />
        </slot>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { IconEdit } from '@tabler/icons-vue';
  
  // Define props
  defineProps({
    title: {
      type: String,
      required: true
    },
    editable: {
      type: Boolean,
      default: true
    }
  });
  
  // Define emits
  defineEmits(['edit']);
  </script>
  
  <style scoped>
  .header-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding-bottom: var(--spacing-md);
    width: 100%;
    gap: var(--spacing-sm);
  }
  
  .book-title {
    margin: 0;
    text-align: center;
    color: var(--text-usual);
  }
  
  .edit-icon {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: var(--spacing-xs);
    border-radius: var(--border-radius-xxxl);
    cursor: pointer;
  }
  
  .edit-icon:hover {
    background-color: var(--bg-field-dark);
    opacity: var(--state-hover-opacity);
  }
  
  .icon {
    color: var(--bg-main);
  }
  </style>
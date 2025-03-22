<!-- src/layouts/EmptyLayout.vue -->
<template>
    <div class="empty-layout">
      <slot />
    </div>
  </template>
  
  <script setup lang="ts">
  // Empty layout without any UI elements
  // Used for login pages, error pages, etc.
  </script>
  
  <style scoped>
  .empty-layout {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: var(--body-color);
  }
  </style>
<!-- src/views/transaction/components/LoadingOverlay.vue -->
<template>
    <div class="loading-overlay">
      <div class="loading-spinner">
        <span>Загрузка...</span>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  // No props or logic needed
  </script>
  
  <style scoped>
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 1000;
  }
  
  .loading-spinner {
    color: white;
    font-size: 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  </style>
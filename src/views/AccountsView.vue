<!-- src/views/AccountsView.vue -->
<template>
    <div class="accounts-container">
      <n-h2>Accounts</n-h2>
      
      <n-card>
        <n-empty description="No accounts data available yet">
          <template #extra>
            <n-button>Add Account</n-button>
          </template>
        </n-empty>
      </n-card>
    </div>
  </template>
  
  <script setup lang="ts">
  import { NH2, NCard, NEmpty, NButton } from 'naive-ui';
  </script>
  
  <style scoped>
  .accounts-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  </style>
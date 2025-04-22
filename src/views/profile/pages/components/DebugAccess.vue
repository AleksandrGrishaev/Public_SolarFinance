<template>
    <div class="settings-item">
      <div class="settings-item-label">
        <n-icon size="20" class="settings-icon">
          <icon-code />
        </n-icon>
        <span>Инструменты разработчика</span>
      </div>
      <n-button 
        size="small" 
        @click="navigateToDebug"
        type="info"
        ghost
      >
        <template #icon>
          <n-icon>
            <icon-database />
          </n-icon>
        </template>
        Debug
      </n-button>
    </div>
  </template>
  
  <script setup lang="ts">
  import { NIcon, NButton } from 'naive-ui';
  import { IconCode, IconDatabase } from '@tabler/icons-vue';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  
  // Функция для перехода на страницу отладки
  const navigateToDebug = () => {
    router.push('/debug');
  };
  </script>
  
  <style scoped>
  .settings-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background-color: var(--bg-field-light);
    border-radius: 12px;
    margin-bottom: 16px;
  }
  
  .settings-item-label {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 16px;
  }
  
  .settings-icon {
    color: var(--color-primary);
  }
  </style>
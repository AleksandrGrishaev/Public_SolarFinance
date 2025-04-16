<!-- src/layouts/ConsoleLayout.vue -->
<template>
    <div class="console-layout">
      <!-- Верхний заголовок с кнопкой назад -->
      <div class="console-header">
        <n-button quaternary circle @click="navigateBack">
          <template #icon>
            <n-icon size="20">
              <icon-arrow-left />
            </n-icon>
          </template>
        </n-button>
        <div class="header-title">{{ pageTitle }}</div>
      </div>
  
      <!-- Основное содержимое со скроллом -->
      <div class="console-content">
        <router-view></router-view>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { NButton, NIcon } from 'naive-ui';
  import { IconArrowLeft } from '@tabler/icons-vue';
  
  const route = useRoute();
  const router = useRouter();
  
  // Получаем заголовок страницы из маршрута
  const pageTitle = computed(() => {
    return route.meta.title || 'Консоль';
  });
  
  // Функция для навигации назад
  const navigateBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/more');
    }
  };
  </script>
  
  <style scoped>
  .console-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
    background-color: var(--app-background);
    color: var(--text-primary);
  }
  
  .console-header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    height: 56px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background-color: var(--header-background, rgba(24, 24, 28, 0.9));
    backdrop-filter: blur(10px);
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  .header-title {
    font-size: 18px;
    font-weight: 600;
    margin-left: 12px;
  }
  
  .console-content {
    flex-grow: 1;
    overflow-y: auto;
    padding-bottom: 20px; /* Отступ снизу для скроллируемого содержимого */
    height: calc(100vh - 56px); /* Вычитаем высоту заголовка */
  }
  </style>
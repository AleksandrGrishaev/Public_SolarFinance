<template>
    <div class="settings-item">
      <div class="settings-item-label">
        <n-icon size="20" class="settings-icon">
          <icon-language />
        </n-icon>
        <span>Язык</span>
      </div>
      <n-select
        v-model:value="selectedLanguage"
        :options="languageOptions"
        size="small"
        style="width: 120px"
        @update:value="changeLanguage"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { NIcon, NSelect } from 'naive-ui';
  import type { SelectOption } from 'naive-ui';
  import { IconLanguage } from '@tabler/icons-vue';
  import { useUserStore } from '@/stores/user';
  
  const userStore = useUserStore();
  
  // Локальное состояние для выбранного языка
  const selectedLanguage = ref(userStore.userSettings?.language || 'ru');
  
  // Доступные языки
  const languageOptions = [
    { label: 'Русский', value: 'ru' },
    { label: 'English', value: 'en' }
  ] as SelectOption[];
  
  // Обработчик изменения языка
  const changeLanguage = (value: string) => {
    // Сохраняем выбранный язык в профиле пользователя
    if (userStore.currentUser) {
      userStore.updateUserSettings({ 
        language: value 
      });
    }
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
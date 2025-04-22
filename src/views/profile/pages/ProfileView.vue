<template>
    <div class="profile-view">
      <h1>Настройки профиля</h1>
      
      <n-card title="Тема оформления" class="theme-card">
        <n-space vertical>
          <div class="theme-switch-container">
            <span>Светлая тема</span>
            <ToggleSwitch 
              v-model="isDarkMode" 
              @update:modelValue="handleThemeToggle"
            />
            <span>Темная тема</span>
          </div>
          
          <p class="theme-description">
            {{ isDarkMode ? 'Тёмная тема активирована' : 'Светлая тема активирована' }}
          </p>
        </n-space>
      </n-card>
    </div>
  </template>
  
  <script setup lang="ts">
  import { onMounted } from 'vue';
  import { useSimpleTheme } from '@/composables/useSimpleTheme';
  import ToggleSwitch from '@/components/ui/inputs/ToggleSwitch.vue';
  import { useUserStore } from '@/stores/user/userStore';
  
  // Используем простую систему тем
  const { isDarkMode, toggleTheme } = useSimpleTheme();
  const userStore = useUserStore();
  
  // Обработчик переключения темы с логированием
  const handleThemeToggle = (value: boolean) => {
    console.log('[ProfileView] Переключение темы:', value ? 'темная' : 'светлая');
    
    // Переключаем тему
    toggleTheme(value);
    
    // Выводим информацию о теме из userStore
    console.log('[ProfileView] Тема пользователя из userStore:', 
      userStore.currentUser?.settings?.theme || 'тема не установлена');
  };
  
  onMounted(() => {
    // Выводим информацию о теме при загрузке компонента
    console.log('[ProfileView] Текущая тема при инициализации:', 
      userStore.currentUser?.settings?.theme || 'тема не установлена');
  });
  </script>
  
  <style scoped>
  .profile-view {
    padding: 20px;
  }
  
  h1 {
    margin-bottom: 20px;
    font-size: 24px;
  }
  
  .theme-card {
    margin-bottom: 16px;
  }
  
  .theme-description {
    margin-top: 8px;
    color: var(--n-text-color);
    font-size: 14px;
  }
  
  .theme-switch-container {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  </style>
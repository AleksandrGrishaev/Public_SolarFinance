<template>
  <div class="profile-view">
    <h1>Настройки профиля</h1>
    
    <n-card title="Тема оформления" class="theme-card">
      <n-space vertical>
        <div class="theme-switch-container">
          <span>Светлая тема</span>
          <ToggleSwitch 
            v-model="isDarkMode" 
            @update:modelValue="toggleTheme"
          />
          <span>Темная тема</span>
        </div>
        
        <p class="theme-description">
          {{ isDarkMode ? 'Тёмная тема активирована' : 'Светлая тема активирована' }}
        </p>
        
        <!-- Тестовые элементы для проверки применения стилей -->
        <div class="theme-test-container">
          <div class="test-item bg-contrast">
            bg-contrast
          </div>
          <div class="test-item bg-main">
            bg-main
          </div>
          <div class="test-item">
            <span class="color-primary">Text Primary</span>
          </div>
          <div class="test-item bg-color-primary">
            Primary Background
          </div>
        </div>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useTheme } from '@/composables/useTheme';
import ToggleSwitch from '@/components/ui/inputs/ToggleSwitch.vue';
import { useUserStore } from '@/stores/user/userStore';

// Используем единую систему тем
const { isDarkMode, toggleTheme } = useTheme();
const userStore = useUserStore();

onMounted(() => {
  // Выводим информацию о теме при загрузке компонента
  console.log('[ProfileView] Текущая тема при инициализации:', 
    userStore.currentUser?.settings?.theme || 'тема не установлена');
    
  // Проверяем CSS классы документа
  console.log('[ProfileView] Текущие классы на documentElement:', document.documentElement.className);
});
</script>

<style scoped>
.profile-view {
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
  font-size: 24px;
  color: var(--text-header);
}

.theme-card {
  margin-bottom: 16px;
}

.theme-description {
  margin-top: 8px;
  color: var(--text-primary);
  font-size: 14px;
}

.theme-switch-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Стили для тестовых элементов */
.theme-test-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.test-item {
  min-width: 120px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
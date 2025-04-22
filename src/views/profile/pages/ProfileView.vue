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

    <!-- Дополнительная карточка с тестовыми элементами -->
    <n-card title="Тестовые цвета темы" class="theme-card">
      <n-space vertical>
        <!-- Отображение текущих CSS-переменных -->
        <div class="css-vars-container">
          <div class="css-vars-title">CSS переменные:</div>
          <div id="css-vars-content" class="css-vars-content"></div>
        </div>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
// Исправлено: правильный импорт useTheme
import { useTheme } from '@/composables/useTheme';
import ToggleSwitch from '@/components/ui/inputs/ToggleSwitch.vue';
import { useUserStore } from '@/stores/user/userStore';

// Исправлено: правильное название функции
const { isDarkMode, toggleTheme } = useTheme();
const userStore = useUserStore();

// Обработчик переключения темы с логированием
const handleThemeToggle = (value: boolean) => {
  console.log('[ProfileView] Переключение темы:', value ? 'темная' : 'светлая');
  
  // Переключаем тему
  toggleTheme(value);
  
  // Выводим информацию о теме из userStore
  console.log('[ProfileView] Тема пользователя из userStore:', 
    userStore.currentUser?.settings?.theme || 'тема не установлена');
    
  // Проверяем CSS классы документа
  console.log('[ProfileView] Текущие классы на documentElement:', document.documentElement.className);
  
  // Обновляем отображение CSS-переменных
  updateCssVarsDisplay();
};

// Функция для отображения текущих CSS-переменных
const updateCssVarsDisplay = () => {
  const cssVarsElement = document.getElementById('css-vars-content');
  if (!cssVarsElement) return;
  
  const style = getComputedStyle(document.documentElement);
  const cssVars = [
    '--text-header',
    '--text-usual',
    '--color-primary',
    '--color-warning',
    '--color-success',
    '--bg-main',
    '--bg-screen',
    '--app-background',
    '--text-primary'
  ];
  
  let cssVarsHtml = '<ul>';
  cssVars.forEach(variable => {
    const value = style.getPropertyValue(variable).trim();
    cssVarsHtml += `<li>${variable}: <strong>${value}</strong></li>`;
  });
  cssVarsHtml += '</ul>';
  
  cssVarsElement.innerHTML = cssVarsHtml;
};

// Обновляем CSS-переменные при изменении темы
const themeObserver = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.attributeName === 'class') {
      updateCssVarsDisplay();
    }
  });
});

onMounted(() => {
  // Выводим информацию о теме при загрузке компонента
  console.log('[ProfileView] Текущая тема при инициализации:', 
    userStore.currentUser?.settings?.theme || 'тема не установлена');
    
  // Проверяем CSS классы документа
  console.log('[ProfileView] Текущие классы на documentElement:', document.documentElement.className);
  
  // Инициализируем отображение CSS-переменных
  updateCssVarsDisplay();
  
  // Наблюдаем за изменениями класса на documentElement
  themeObserver.observe(document.documentElement, { attributes: true });
  
  // Принудительно применяем тему (для надежности)
  setTimeout(() => {
    const isDark = userStore.currentUser?.settings?.theme === 'dark';
    toggleTheme(isDark);
    updateCssVarsDisplay();
  }, 100);
});

onBeforeUnmount(() => {
  // Останавливаем наблюдатель перед уничтожением компонента
  themeObserver.disconnect();
});
</script>

<style scoped>
.profile-view {
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
  font-size: 24px;
  color: var(--text-header); /* Используем CSS-переменную */
}

.theme-card {
  margin-bottom: 16px;
}

.theme-description {
  margin-top: 8px;
  color: var(--text-primary); /* Используем CSS-переменную */
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

/* Стили для отображения CSS-переменных */
.css-vars-container {
  margin-top: 10px;
}

.css-vars-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.css-vars-content {
  font-family: monospace;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
  padding: 10px;
  background-color: var(--bg-contrast);
  border-radius: 5px;
}

.css-vars-content ul {
  margin: 0;
  padding-left: 20px;
}

.css-vars-content li {
  margin-bottom: 5px;
}
</style>
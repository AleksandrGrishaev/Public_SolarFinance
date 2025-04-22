<template>
  <div class="profile-view">
    <h1>Настройки профиля</h1>
    
    <!-- Тема оформления -->
    <n-card title="Тема оформления" class="profile-card">
      <n-space vertical>
        <!-- Переключатель темы с выпадающим списком -->
        <div class="theme-select-container">
          <span class="theme-label">Выберите тему:</span>
          <n-select
            v-model:value="selectedTheme"
            :options="themeOptions"
            @update:value="handleThemeChange"
            size="medium"
            class="theme-select"
          />
        </div>
        
        <!-- Для обратной совместимости: переключатель темный/светлый режим -->
        <div class="theme-switch-container mt-3">
          <span>Светлая тема</span>
          <ToggleSwitch 
            v-model="isDarkMode" 
            @update:modelValue="handleDarkModeToggle"
          />
          <span>Темная тема</span>
        </div>
        
        <p class="theme-description mt-2">
          Текущая тема: <strong>{{ getThemeDisplayName }}</strong>
        </p>
      </n-space>
    </n-card>

    <!-- Локализация -->
    <n-card title="Локализация" class="profile-card">
      <language-settings />
    </n-card>
    
    <!-- Разработка и отладка -->
    <n-card title="Разработка и отладка" class="profile-card" v-if="isDebugEnabled">
      <debug-access />
      
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
      
      <!-- Отображение текущих CSS-переменных -->
      <div class="css-vars-container mt-3">
        <div class="css-vars-title">CSS переменные:</div>
        <div id="css-vars-content" class="css-vars-content"></div>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useTheme } from '@/stores/theme/useTheme';
import { type ThemeType } from '@/stores/theme/themeStore';
import ToggleSwitch from '@/components/ui/inputs/ToggleSwitch.vue';
import { useUserStore } from '@/stores/user/userStore';
import { NSelect, NCard, NSpace } from 'naive-ui';
import LanguageSettings from './components/LanguageSettings.vue';
import DebugAccess from './components/DebugAccess.vue';

// Используем обновленный composable
const { isDarkMode, currentTheme, setTheme } = useTheme();
const userStore = useUserStore();

// Создаем реактивное значение для выбранной темы
const selectedTheme = ref(currentTheme.value);

// Определяем доступные опции тем
const themeOptions = [
  { label: 'Светлая тема', value: 'light' },
  { label: 'Темная тема', value: 'dark' },
  { label: 'Синяя тема', value: 'blue' },
  { label: 'Высокий контраст', value: 'high-contrast' },
  { label: 'Системная тема', value: 'system' }
];

// Флаг для отображения инструментов отладки
// В реальном приложении его можно привязать к роли пользователя или режиму разработки
const isDebugEnabled = ref(process.env.NODE_ENV === 'development' || true);

// Вычисляемое свойство для отображаемого имени темы
const getThemeDisplayName = computed(() => {
  const option = themeOptions.find(opt => opt.value === selectedTheme.value);
  return option ? option.label : 'Не определено';
});

// Обработчик изменения темы в селекторе
const handleThemeChange = (value: ThemeType) => {
  console.log(`[ProfileView] Changing theme to: ${value}`);
  setTheme(value);
  
  // Выводим информацию о теме из userStore
  console.log('[ProfileView] Тема пользователя из userStore:', 
    userStore.currentUser?.settings?.theme || 'тема не установлена');
    
  // Проверяем CSS классы документа
  console.log('[ProfileView] Текущие классы на documentElement:', document.documentElement.className);
  
  // Обновляем отображение CSS-переменных
  updateCssVarsDisplay();
};

// Обработчик переключения темной/светлой темы (для обратной совместимости)
const handleDarkModeToggle = (value: boolean) => {
  console.log('[ProfileView] Переключение темы:', value ? 'темная' : 'светлая');
  
  // Обновляем выбранную тему
  selectedTheme.value = value ? 'dark' : 'light';
  
  // Устанавливаем тему
  setTheme(selectedTheme.value);
  
  // Обновляем отображение CSS-переменных
  updateCssVarsDisplay();
};

// Следим за изменением темы в store
watch(currentTheme, (newTheme) => {
  // Обновляем локальное значение
  selectedTheme.value = newTheme;
});

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
  
  // Обновляем локальное значение выбранной темы
  selectedTheme.value = currentTheme.value;
  
  // Инициализируем отображение CSS-переменных
  updateCssVarsDisplay();
  
  // Наблюдаем за изменениями класса на documentElement
  themeObserver.observe(document.documentElement, { attributes: true });
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
  color: var(--text-header);
}

.profile-card {
  margin-bottom: 20px;
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

.theme-select-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.theme-label {
  min-width: 120px;
}

.theme-select {
  width: 200px;
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

.mt-3 {
  margin-top: 16px;
}
</style>
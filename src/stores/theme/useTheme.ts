// src/stores/theme/useTheme.ts
import { computed, onMounted, onBeforeUnmount } from 'vue';
import { useThemeStore, type ThemeType } from './themeStore';

/**
 * Composable для работы с темой, который использует ThemeStore
 */
export function useTheme() {
  const themeStore = useThemeStore();
  
  // Вычисляемое свойство для проверки, является ли текущая тема темной
  const isDarkMode = computed(() => themeStore.isDarkTheme);
  
  // Вычисляемое свойство для получения текущей темы
  const currentTheme = computed(() => themeStore.currentTheme);
  
  // Функция для переключения между светлой и темной темой (для обратной совместимости)
  function toggleTheme(value: boolean) {
    themeStore.setTheme(value ? 'dark' : 'light');
  }
  
  // Функция для установки конкретной темы
  function setTheme(theme: ThemeType) {
    themeStore.setTheme(theme);
  }
  
  // Функция для инициализации темы
  function initTheme() {
    if (!themeStore.isInitialized) {
      themeStore.init();
    }
  }
  
  // Инициализируем тему при монтировании
  onMounted(() => {
    initTheme();
  });
  
  // Очищаем ресурсы при размонтировании
  onBeforeUnmount(() => {
    // Эта функция ничего не делает в текущей реализации, 
    // но может потребоваться для будущих улучшений
    themeStore.cleanup();
  });
  
  return {
    isDarkMode,
    currentTheme,
    toggleTheme, // Для обратной совместимости
    setTheme,    // Новый метод для установки любой темы
    initTheme
  };
}
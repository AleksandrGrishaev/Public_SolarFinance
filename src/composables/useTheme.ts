// src/composables/useTheme.ts

import { ref, onMounted, watch } from 'vue';
import { useUserStore } from '@/stores/user/userStore';

// Глобальный state переменная, чтобы состояние было одинаковым везде
const isDarkMode = ref(false);

/**
 * Простой composable для работы с темой
 */
export function useTheme() {
  const userStore = useUserStore();
  
  /**
   * Применяет нужный класс темы к HTML элементу
   */
  function applyTheme(isDark: boolean) {
    // Удаляем существующие классы тем
    document.documentElement.classList.remove('dark-theme', 'light-theme');
    
    // Добавляем нужный класс темы
    document.documentElement.classList.add(isDark ? 'dark-theme' : 'light-theme');
    
    // Принудительно вызываем layout recalculation
     
    void document.documentElement.offsetHeight;
    
    // Записываем предпочтения в localStorage для не авторизованных пользователей
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    console.log(`[Theme] Applied ${isDark ? 'dark' : 'light'} theme`);
  }
  
  /**
   * Инициализация темы при старте
   */
  function initTheme() {
    // Проверяем настройки пользователя
    if (userStore.isAuthenticated && userStore.currentUser?.settings?.theme) {
      const userTheme = userStore.currentUser.settings.theme;
      
      if (userTheme === 'system') {
        // Если установлена системная тема, используем предпочтение ОС
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        isDarkMode.value = prefersDark;
      } else {
        // Иначе используем выбор пользователя
        isDarkMode.value = userTheme === 'dark';
      }
    } else {
      // Для неавторизованных пользователей проверяем localStorage
      const savedTheme = localStorage.getItem('theme');
      
      if (savedTheme) {
        isDarkMode.value = savedTheme === 'dark';
      } else {
        // По умолчанию используем системные настройки
        isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    }
    
    // Применяем тему
    applyTheme(isDarkMode.value);
    
    // Слушаем изменения системной темы
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', e => {
      // Обновляем тему только если у пользователя выбрана системная тема
      if (!userStore.isAuthenticated || userStore.currentUser?.settings?.theme === 'system') {
        isDarkMode.value = e.matches;
        applyTheme(e.matches);
      }
    });
  }
  
  /**
   * Переключение темы
   */
  function toggleTheme(value: boolean) {
    isDarkMode.value = value;
    applyTheme(value);
    
    // Сохраняем настройки в профиле пользователя
    if (userStore.isAuthenticated && userStore.currentUser) {
      userStore.updateUserSettings({
        theme: value ? 'dark' : 'light'
      });
    }
  }
  
  // Отслеживаем изменения isDarkMode для применения темы
  watch(isDarkMode, newValue => {
    applyTheme(newValue);
  });
  
  // Инициализируем тему при монтировании
  onMounted(() => {
    initTheme();
  });
  
  return {
    isDarkMode,
    toggleTheme,
    initTheme
  };
}
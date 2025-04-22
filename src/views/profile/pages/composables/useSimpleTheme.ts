// src/composables/useSimpleTheme.ts
import { ref, onMounted, watchEffect } from 'vue';
import { useUserStore } from '@/stores/user/userStore';
import { forceThemeStyles } from '@/utils/forceThemeStyles';

// Глобальная версия темы для отслеживания изменений
const themeVersion = ref(0);

// Экспортируем isDarkMode для глобального доступа
const isDarkMode = ref(false);

export function useSimpleTheme() {
  const userStore = useUserStore();
  
  /**
   * Инициализирует тему на основе настроек пользователя
   */
  const initTheme = () => {
    // Получаем текущие настройки пользователя
    const currentTheme = userStore.currentUser?.settings?.theme || 'system';
    
    // Устанавливаем начальное значение
    isDarkMode.value = currentTheme === 'dark' || 
      (currentTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    // Применяем текущую тему при монтировании
    applyThemeClasses(isDarkMode.value);
    
    console.log('[useSimpleTheme] Инициализирована тема:', isDarkMode.value ? 'dark' : 'light');
    
    // Добавляем слушатель изменений системной темы
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (userStore.currentUser?.settings?.theme === 'system') {
        isDarkMode.value = e.matches;
        applyThemeClasses(e.matches);
      }
    });
  };
  
  // Инициализируем тему при монтировании
  onMounted(() => {
    initTheme();
  });
  
  /**
   * Применяет CSS классы темы к документу
   */
  const applyThemeClasses = (isDark: boolean) => {
    // Удаляем существующие классы тем
    document.documentElement.classList.remove('dark-theme', 'light-theme');
    
    // Добавляем нужный класс темы
    if (isDark) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.add('light-theme');
    }
    
    // ВАЖНО: Принудительно применяем стили через inline стили
    // Это переопределит любые конфликтующие стили в CSS
    forceThemeStyles(isDark);
    
    // Принудительно запускаем перерасчет макета DOM
    void document.documentElement.offsetHeight;
    
    // Обновляем версию темы для отслеживания изменений
    themeVersion.value = Date.now();
    
    // Логируем для отладки
    console.log('[useSimpleTheme] Применены классы темы:', isDark ? 'dark-theme' : 'light-theme');
    logComputedStyles();
  };
  
  /**
   * Переключает тему и сохраняет выбор пользователя
   */
  const toggleTheme = (value: boolean) => {
    // Обновляем значение
    isDarkMode.value = value;
    
    // Применяем классы темы к документу
    applyThemeClasses(value);
    
    // Сохраняем в настройках пользователя
    if (userStore.currentUser) {
      userStore.updateUserSettings({
        theme: value ? 'dark' : 'light'
      });
    }
    
    console.log('[useSimpleTheme] Тема переключена на:', value ? 'dark' : 'light');
  };
  
  /**
   * Логирует вычисленные стили для отладки
   */
  const logComputedStyles = () => {
    const style = getComputedStyle(document.documentElement);
    console.log('=== THEME DEBUG ===');
    console.log('isDarkMode:', isDarkMode.value);
    console.log('Classes on documentElement:', document.documentElement.className);
    console.log('--bg-screen:', style.getPropertyValue('--bg-screen').trim());
    console.log('--bg-main:', style.getPropertyValue('--bg-main').trim());
    console.log('--text-header:', style.getPropertyValue('--text-header').trim());
    console.log('--text-usual:', style.getPropertyValue('--text-usual').trim());
    console.log('--color-primary:', style.getPropertyValue('--color-primary').trim());
    console.log('=== END THEME DEBUG ===');
  };
  
  // Отслеживаем изменения isDarkMode для немедленного применения темы
  watchEffect(() => {
    applyThemeClasses(isDarkMode.value);
  });
  
  return {
    isDarkMode,
    toggleTheme,
    themeVersion,
    initTheme,
    applyThemeClasses,
    logComputedStyles
  };
}
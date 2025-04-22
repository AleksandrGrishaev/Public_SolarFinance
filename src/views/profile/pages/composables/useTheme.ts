import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/user/userStore';

export function useTheme() {
  const userStore = useUserStore();
  const isDarkMode = ref(false);
  
  // Установка начального значения из настроек пользователя
  onMounted(() => {
    // Получаем текущие настройки пользователя
    const currentTheme = userStore.currentUser?.settings?.theme || 'system';
    
    // Устанавливаем начальное значение
    isDarkMode.value = currentTheme === 'dark' || 
      (currentTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    // Применяем текущую тему при монтировании
    applyThemeClasses(isDarkMode.value);
    
    console.log('[useTheme] Начальное значение темы:', isDarkMode.value ? 'dark' : 'light');
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
    
    console.log('[useTheme] Применены классы темы:', isDark ? 'dark-theme' : 'light-theme');
  };
  
  /**
   * Переключает тему и сохраняет выбор пользователя
   */
  const toggleTheme = (value: boolean) => {
    // Обновляем значение в composable
    isDarkMode.value = value;
    
    // Применяем классы темы к документу
    applyThemeClasses(value);
    
    // Сохраняем в настройках пользователя
    if (userStore.currentUser) {
      userStore.updateUserSettings({
        theme: value ? 'dark' : 'light'
      });
    }
    
    console.log('[useTheme] Тема переключена на:', value ? 'dark' : 'light');
  };
  
  return {
    isDarkMode,
    toggleTheme
  };
}
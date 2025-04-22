// src/stores/theme/themeStore.ts
import { defineStore } from 'pinia';
import { useUserStore } from '../user/userStore';

// Определяем доступные темы
export type ThemeType = 'light' | 'dark' | 'system' | 'blue' | 'high-contrast';

// Определяем интерфейс для состояния темы
interface ThemeState {
  currentTheme: ThemeType;
  isInitialized: boolean;
  // Для проверки, было ли определено автоматически по системным настройкам
  isAutoDetected: boolean;
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    currentTheme: 'system',
    isInitialized: false,
    isAutoDetected: false
  }),

  getters: {
    // Получение текущего CSS-класса темы
    themeClass: (state) => {
      // Если тема system, тогда определяем светлая или темная на основе предпочтений ОС
      if (state.currentTheme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches 
          ? 'dark-theme' 
          : 'light-theme';
      }
      
      // Иначе возвращаем соответствующий класс темы
      return `${state.currentTheme}-theme`;
    },
    
    // Проверка, темная ли тема
    isDarkTheme(): boolean {
      // Если текущая тема - system, проверяем системные настройки
      if (this.currentTheme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      
      // Для других тем проверяем, содержат ли они 'dark' в названии
      return this.currentTheme === 'dark' || this.currentTheme === 'high-contrast';
    }
  },

  actions: {
    /**
     * Инициализация хранилища тем
     */
    init() {
      if (this.isInitialized) return;
      
      console.log('[ThemeStore] Initializing theme store');
      
      // Получаем userStore для доступа к настройкам пользователя
      const userStore = useUserStore();
      
      // Определяем начальную тему
      if (userStore.isAuthenticated && userStore.userSettings?.theme) {
        // Используем тему из настроек пользователя
        this.currentTheme = userStore.userSettings.theme as ThemeType;
        console.log(`[ThemeStore] Using theme from user settings: ${this.currentTheme}`);
      } else {
        // Для неавторизованных пользователей проверяем localStorage
        const savedTheme = localStorage.getItem('theme') as ThemeType;
        
        if (savedTheme) {
          this.currentTheme = savedTheme;
          console.log(`[ThemeStore] Using theme from localStorage: ${this.currentTheme}`);
        } else {
          // По умолчанию используем системные настройки
          this.currentTheme = 'system';
          this.isAutoDetected = true;
          console.log('[ThemeStore] No saved theme found, using system default');
        }
      }
      
      // Применяем тему
      this.applyTheme();
      
      // Создаем слушатель для изменений системной темы
      this.setupSystemThemeListener();
      
      this.isInitialized = true;
    },
    
    /**
     * Настройка слушателя изменений системной темы
     */
    setupSystemThemeListener() {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Добавляем слушатель изменений
      const listener = (e: MediaQueryListEvent) => {
        // Обновляем тему только если текущая тема - system
        if (this.currentTheme === 'system') {
          console.log(`[ThemeStore] System theme changed to ${e.matches ? 'dark' : 'light'}`);
          this.applyTheme();
        }
      };
      
      // Используем addListener для обратной совместимости
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', listener);
      } else if (mediaQuery.addListener) {
        // Для старых браузеров
        mediaQuery.addListener(listener);
      }
    },
    
    /**
     * Применение текущей темы
     */
    applyTheme() {
      // Удаляем все классы тем
      document.documentElement.classList.remove(
        'dark-theme', 
        'light-theme', 
        'blue-theme', 
        'high-contrast-theme'
      );
      
      // Добавляем класс для текущей темы
      document.documentElement.classList.add(this.themeClass);
      
      // Принудительно вызываем layout recalculation
      void document.documentElement.offsetHeight;
      
      // Если тема не system, сохраняем её в localStorage
      if (this.currentTheme !== 'system') {
        localStorage.setItem('theme', this.currentTheme);
      }
      
      console.log(`[ThemeStore] Applied theme class: ${this.themeClass}`);
    },
    
    /**
     * Смена темы
     */
    setTheme(theme: ThemeType) {
      console.log(`[ThemeStore] Setting theme to: ${theme}`);
      this.currentTheme = theme;
      this.isAutoDetected = false;
      
      // Применяем новую тему
      this.applyTheme();
      
      // Сохраняем в настройках пользователя, если он авторизован
      const userStore = useUserStore();
      if (userStore.isAuthenticated && userStore.currentUser) {
        userStore.updateUserSettings({
          theme: theme
        });
      }
    },
    
    /**
     * Очистка ресурсов при уничтожении
     */
    cleanup() {
      // В реальном приложении здесь нужно было бы удалить слушатель изменений темы
      console.log('[ThemeStore] Cleaning up theme resources');
    }
  }
});
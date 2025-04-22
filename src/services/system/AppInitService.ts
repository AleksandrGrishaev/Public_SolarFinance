// src/services/system/AppInitService.ts
import { useCurrencyStore } from '@/stores/currency';
import { useUserStore } from '@/stores/user';
import { useSystemStore } from '@/stores/system';
import { useSimpleTheme } from '@/composables/useSimpleTheme';

/**
 * Класс для инициализации приложения
 * Обеспечивает централизованное управление запуском всех необходимых сервисов
 */
export class AppInitService {
  private static instance: AppInitService;
  private _isInitialized = false;
  
  // Синглтон
  private constructor() {}
  
  /**
   * Получение инстанса сервиса
   */
  public static getInstance(): AppInitService {
    if (!AppInitService.instance) {
      AppInitService.instance = new AppInitService();
    }
    return AppInitService.instance;
  }
  
  /**
   * Флаг инициализации
   */
  public get isInitialized(): boolean {
    return this._isInitialized;
  }
  
  /**
   * Инициализация всех основных сервисов приложения
   */
  public async initializeApp(): Promise<void> {
    if (this._isInitialized) {
      console.log('[AppInitService] App already initialized');
      return;
    }
    console.log('[AppInitService] Initializing application...');
    
    try {
      // Инициализация системного хранилища (платформа, безопасные зоны)
      const systemStore = useSystemStore();
      systemStore.initialize();
      console.log('[AppInitService] System store initialized, platform:', systemStore.platform);
      
      // Не нужно дублировать вывод информации о системе, 
      // так как она уже выводится в systemStore.initialize()
      
      // Инициализация хранилища валют
      const currencyStore = useCurrencyStore();
      await currencyStore.init();
      console.log('[AppInitService] Currency store initialized');
      
      // Инициализация хранилища пользователей
      const userStore = useUserStore();
      await userStore.init();
      console.log('[AppInitService] User store initialized, authenticated:', userStore.isAuthenticated);
      
      // Инициализация темы с использованием useSimpleTheme
      this.initializeTheme(userStore);
      
      this._isInitialized = true;
      console.log('[AppInitService] Application initialization complete');
    } catch (error) {
      console.error('[AppInitService] Error during initialization:', error);
      throw error;
    }
  }
  
  /**
   * Инициализация темы на основе настроек пользователя или системных настроек
   */
  private initializeTheme(userStore: ReturnType<typeof useUserStore>): void {
    // Используем useSimpleTheme для инициализации темы
    const { initTheme, toggleTheme } = useSimpleTheme();
    
    // Применяем тему из настроек пользователя, если он авторизован
    if (userStore.isAuthenticated && userStore.userSettings?.theme) {
      const userTheme = userStore.userSettings.theme;
      if (userTheme === 'dark' || userTheme === 'light') {
        // Устанавливаем тему напрямую
        toggleTheme(userTheme === 'dark');
        console.log('[AppInitService] Applied theme from user settings:', userTheme);
      } else {
        // Если установлено 'system', используем системные настройки
        initTheme();
        console.log('[AppInitService] Applied system theme preference');
      }
    } else {
      // Если пользователь не авторизован, инициализируем тему по системным настройкам
      initTheme();
      console.log('[AppInitService] Theme initialized using system preferences');
    }
  }
}

// Экспортируем инстанс для удобного доступа
export const appInitService = AppInitService.getInstance();
// src/services/system/AppInitService.ts
import { useCurrencyStore } from '@/stores/currency';
import { useUserStore } from '@/stores/user';
import { useSystemStore } from '@/stores/system';
import { useThemeStore } from '@/stores/theme/themeStore';

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
      
      // Инициализация хранилища валют
      const currencyStore = useCurrencyStore();
      await currencyStore.init();
      console.log('[AppInitService] Currency store initialized');
      
      // Инициализация хранилища пользователей
      const userStore = useUserStore();
      await userStore.init();
      console.log('[AppInitService] User store initialized, authenticated:', userStore.isAuthenticated);
      
      // Инициализация темы через ThemeStore
      const themeStore = useThemeStore();
      themeStore.init();
      console.log('[AppInitService] Theme store initialized, current theme:', themeStore.currentTheme);
      
      this._isInitialized = true;
      console.log('[AppInitService] Application initialization complete');
    } catch (error) {
      console.error('[AppInitService] Error during initialization:', error);
      throw error;
    }
  }
}

// Экспортируем инстанс для удобного доступа
export const appInitService = AppInitService.getInstance();
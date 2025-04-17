// src/services/MessageService.ts
/**
 * Сервис для управления системными сообщениями
 * Обеспечивает единую точку доступа к уведомлениям для всего приложения
 */
export class MessageService {
    private static instance: MessageService;
    private _provider: any = null;
  
    // Синглтон
    private constructor() {}
  
    /**
     * Получение инстанса сервиса
     */
    public static getInstance(): MessageService {
      if (!MessageService.instance) {
        MessageService.instance = new MessageService();
      }
      return MessageService.instance;
    }
  
    /**
     * Установка провайдера сообщений
     */
    public setProvider(provider: any): void {
      this._provider = provider;
      
      // Также устанавливаем глобальную переменную для обратной совместимости
      if (window) {
        window.$message = provider;
      }
      
      console.log('[MessageService] Message provider initialized');
    }
  
    /**
     * Проверка наличия провайдера
     */
    public get hasProvider(): boolean {
      return !!this._provider;
    }
  
    /**
     * Показать успешное сообщение
     */
    public success(content: string, options?: any): void {
      if (this._provider) {
        this._provider.success(content, options);
      } else {
        console.log('[MessageService] Success:', content);
        // Резервный вариант, если провайдер не инициализирован
        alert(`✓ ${content}`);
      }
    }
  
    /**
     * Показать сообщение об ошибке
     */
    public error(content: string, options?: any): void {
      if (this._provider) {
        this._provider.error(content, options);
      } else {
        console.error('[MessageService] Error:', content);
        // Резервный вариант, если провайдер не инициализирован
        alert(`✗ ${content}`);
      }
    }
  
    /**
     * Показать информационное сообщение
     */
    public info(content: string, options?: any): void {
      if (this._provider) {
        this._provider.info(content, options);
      } else {
        console.log('[MessageService] Info:', content);
        // Резервный вариант, если провайдер не инициализирован
        alert(`ℹ ${content}`);
      }
    }
  
    /**
     * Показать предупреждение
     */
    public warning(content: string, options?: any): void {
      if (this._provider) {
        this._provider.warning(content, options);
      } else {
        console.warn('[MessageService] Warning:', content);
        // Резервный вариант, если провайдер не инициализирован
        alert(`⚠ ${content}`);
      }
    }
  }
  
  // Экспортируем инстанс для удобного доступа
  export const messageService = MessageService.getInstance();
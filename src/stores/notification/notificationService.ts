// src/stores/notification/notificationService.ts
import { useNotificationStore } from './notificationStore';
import { DefaultNotifications } from './DefaultNotification';
import { NotificationType, NotificationSubtype, type NotificationAction } from './types';

/**
 * Сервис для работы с уведомлениями
 */
export class NotificationService {
  private static instance: NotificationService;
  private store: ReturnType<typeof useNotificationStore> | null = null;
  private wsConnection: WebSocket | null = null;
  
  private constructor() {
    // Приватный конструктор для синглтона
  }
  
  /**
   * Получение экземпляра сервиса
   */
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }
  
  /**
   * Инициализация сервиса уведомлений
   */
  public init() {
    // Инициализируем store здесь, а не в конструкторе
    this.store = useNotificationStore();
    
    // Загрузить существующие уведомления
    this.store.fetchNotifications();
    
    // Очистить просроченные уведомления
    this.store.clearExpiredNotifications();
    
    // Подключить WebSocket для реал-тайм обновлений (если необходимо)
    // this.connectWebSocket();
    
    // Настроить интервал для проверки просроченных уведомлений
    setInterval(() => {
      this.store?.clearExpiredNotifications();
    }, 60000); // Проверять каждую минуту
  }
  
  /**
   * Подключение к WebSocket для получения уведомлений в реальном времени
   */
  private connectWebSocket() {
    // Реализация WebSocket подключения здесь
    // Реализация осталась без изменений
  }
  
  /**
   * Создание системного уведомления
   */
  public showSystemNotification(
    title: string, 
    message: string, 
    subtype: NotificationSubtype = NotificationSubtype.INFO,
    action?: NotificationAction
  ) {
    if (!this.store) {
      console.error('NotificationService not initialized. Call init() first.');
      return null;
    }
    
    return this.store.addNotification({
      type: NotificationType.SYSTEM,
      subtype,
      title,
      message,
      action
    });
  }
  
  /**
   * Создание пользовательского уведомления
   */
  public showUserNotification(
    title: string, 
    message: string, 
    subtype: NotificationSubtype = NotificationSubtype.INFO,
    action?: NotificationAction
  ) {
    if (!this.store) {
      console.error('NotificationService not initialized. Call init() first.');
      return null;
    }
    
    return this.store.addNotification({
      type: NotificationType.USER,
      subtype,
      title,
      message,
      action
    });
  }
  
  /**
   * Быстрые методы для создания уведомлений
   */
  public showInfo(title: string, message: string, action?: NotificationAction) {
    if (!this.store) {
      console.error('NotificationService not initialized. Call init() first.');
      return null;
    }
    
    return this.store.addNotification(
      DefaultNotifications.userInfo(title, message, action)
    );
  }
  
  public showDebt(
    title: string,
    message: string,
    transactionName: string,
    amount: number,
    debtAmount: number,
    createdBy: string,
    transactionId: string,
    currency?: string,
    action?: NotificationAction
  ) {
    if (!this.store) {
      console.error('NotificationService not initialized. Call init() first.');
      return null;
    }
    
    return this.store.addNotification(
      DefaultNotifications.debt(
        title, 
        message, 
        transactionName, 
        amount, 
        debtAmount, 
        createdBy, 
        transactionId,
        currency,
        action
      )
    );
  }
  
  public showPromo(title: string, message: string, action?: NotificationAction, expireAt?: Date) {
    if (!this.store) {
      console.error('NotificationService not initialized. Call init() first.');
      return null;
    }
    
    return this.store.addNotification(
      DefaultNotifications.promo(title, message, action, expireAt)
    );
  }
  
  /**
   * Возвращает количество непрочитанных уведомлений
   */
  public getUnreadCount() {
    if (!this.store) {
      console.error('NotificationService not initialized. Call init() first.');
      return 0;
    }
    
    return this.store.unreadCount;
  }
  
  /**
   * Проверяет наличие непрочитанных уведомлений
   */
  public hasUnreadNotifications() {
    if (!this.store) {
      console.error('NotificationService not initialized. Call init() first.');
      return false;
    }
    
    return this.store.hasUnread;
  }
  
  /**
   * Маркирует все уведомления как прочитанные
   */
  public markAllAsRead() {
    if (!this.store) {
      console.error('NotificationService not initialized. Call init() first.');
      return;
    }
    
    return this.store.markAllAsRead();
  }
  
  /**
   * Удаляет уведомление по ID
   */
  public deleteNotification(id: string) {
    if (!this.store) {
      console.error('NotificationService not initialized. Call init() first.');
      return;
    }
    
    return this.store.deleteNotification(id);
  }
  
  /**
   * Удаляет все прочитанные уведомления
   */
  public clearReadNotifications() {
    if (!this.store) {
      console.error('NotificationService not initialized. Call init() first.');
      return;
    }
    
    return this.store.clearReadNotifications();
  }
}

// Экспортируем функцию для получения экземпляра сервиса
export const useNotificationService = (): NotificationService => {
  return NotificationService.getInstance();
};
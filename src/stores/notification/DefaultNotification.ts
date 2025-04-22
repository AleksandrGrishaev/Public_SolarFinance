// src/stores/notification/DefaultNotification.ts
import { 
    type Notification, 
    NotificationType, 
    NotificationSubtype,
    type CreateNotificationPayload
  } from './types';
  
  /**
   * Создает объект уведомления с заданными параметрами
   */
  export const createNotification = (payload: CreateNotificationPayload): Notification => {
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      type: payload.type,
      subtype: payload.subtype,
      title: payload.title,
      message: payload.message,
      read: false,
      date: new Date(),
      action: payload.action,
      priority: payload.priority || 1,
      expireAt: payload.expireAt,
      icon: payload.icon
    };
  };
  
  /**
   * Предопределенные шаблоны уведомлений для частых случаев
   */
  export const DefaultNotifications = {
    /**
     * Создает уведомление об обновлении системы
     */
    systemUpdate: (title: string, message: string, action?: any): CreateNotificationPayload => ({
      type: NotificationType.SYSTEM,
      subtype: NotificationSubtype.UPDATE,
      title,
      message, 
      action,
      priority: 3
    }),
    
    /**
     * Создает уведомление с информацией для пользователя
     */
    userInfo: (title: string, message: string, action?: any): CreateNotificationPayload => ({
      type: NotificationType.USER,
      subtype: NotificationSubtype.INFO,
      title,
      message,
      action
    }),
    
    /**
     * Создает уведомление-напоминание для пользователя
     */
    userReminder: (title: string, message: string, action?: any): CreateNotificationPayload => ({
      type: NotificationType.USER,
      subtype: NotificationSubtype.REMINDER,
      title,
      message,
      action,
      priority: 2
    }),
    
    /**
     * Создает уведомление об ошибке
     */
    error: (title: string, message: string, action?: any): CreateNotificationPayload => ({
      type: NotificationType.SYSTEM,
      subtype: NotificationSubtype.ERROR,
      title,
      message,
      action,
      priority: 5
    }),
    
    /**
     * Создает промо-уведомление
     */
    promo: (title: string, message: string, action?: any, expireAt?: Date): CreateNotificationPayload => ({
      type: NotificationType.SYSTEM,
      subtype: NotificationSubtype.PROMO,
      title,
      message,
      action,
      expireAt
    })
  };
// src/stores/notification/DefaultNotification.ts
import { 
    NotificationType, 
    NotificationSubtype,
    type NotificationAction,
    type Notification,
    type CreateNotificationPayload,
    type BaseNotification,
    type CreateInfoNotificationPayload,
    type CreateDebtNotificationPayload
  } from './types';
  
  /**
   * Создает объект уведомления с заданными параметрами
   */
  export const createNotification = (payload: CreateNotificationPayload): Notification => {
    const baseNotification: BaseNotification = {
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
  
    // В зависимости от подтипа добавляем специфичные поля
    switch (payload.subtype) {
      case NotificationSubtype.INFO:
        return {
          ...baseNotification,
          subtype: NotificationSubtype.INFO,
          category: (payload as CreateInfoNotificationPayload).category,
          tags: (payload as CreateInfoNotificationPayload).tags,
          dismissible: (payload as CreateInfoNotificationPayload).dismissible ?? true
        };
      case NotificationSubtype.DEBT:
        return {
          ...baseNotification,
          subtype: NotificationSubtype.DEBT,
          transactionName: (payload as CreateDebtNotificationPayload).transactionName,
          amount: (payload as CreateDebtNotificationPayload).amount,
          debtAmount: (payload as CreateDebtNotificationPayload).debtAmount,
          createdBy: (payload as CreateDebtNotificationPayload).createdBy,
          transactionId: (payload as CreateDebtNotificationPayload).transactionId,
          currency: (payload as CreateDebtNotificationPayload).currency
        };
      default:
        return baseNotification;
    }
  };
  
  /**
   * Предопределенные шаблоны уведомлений для частых случаев
   */
  export const DefaultNotifications = {
    /**
     * Создает уведомление с информацией для пользователя
     */
    userInfo: (title: string, message: string, action?: NotificationAction): CreateNotificationPayload => ({
      type: NotificationType.USER,
      subtype: NotificationSubtype.INFO,
      title,
      message,
      action
    }),
    
    /**
     * Создает промо-уведомление
     */
    promo: (title: string, message: string, action?: NotificationAction, expireAt?: Date): CreateNotificationPayload => ({
      type: NotificationType.SYSTEM,
      subtype: NotificationSubtype.PROMO,
      title,
      message,
      action,
      expireAt
    }),
  
    /**
     * Создает уведомление о долге
     */
    debt: (
      title: string, 
      message: string, 
      transactionName: string,
      amount: number,
      debtAmount: number,
      createdBy: string,
      transactionId: string,
      currency?: string,
      action?: NotificationAction
    ): CreateDebtNotificationPayload => ({
      type: NotificationType.USER,
      subtype: NotificationSubtype.DEBT,
      title,
      message,
      transactionName,
      amount,
      debtAmount,
      createdBy,
      transactionId,
      currency,
      action,
      priority: 4 // Высокий приоритет для долговых уведомлений
    })
  };
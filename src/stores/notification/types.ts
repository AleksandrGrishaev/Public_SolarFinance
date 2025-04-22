// src/stores/notification/types.ts

export enum NotificationType {
    SYSTEM = 'system',
    USER = 'user'
  }
  
  export enum NotificationSubtype {
    PROMO = 'promo',
    UPDATE = 'update',
    REMINDER = 'reminder',
    INFO = 'info',
    ERROR = 'error'
  }
  
  export interface NotificationAction {
    text: string;
    route?: string;
    handler?: () => void;
  }
  
  export interface Notification {
    id: string;
    type: NotificationType;
    subtype?: NotificationSubtype;
    title: string;
    message: string;
    read: boolean;
    date: Date;
    action?: NotificationAction;
    // Дополнительные поля при необходимости
    priority?: number; // Приоритет уведомления (1-5, где 5 - самый высокий)
    expireAt?: Date; // Дата, после которой уведомление считается неактуальным
    icon?: string; // Иконка для уведомления
  }
  
  export interface NotificationState {
    notifications: Notification[];
    isLoading: boolean;
    error: string | null;
  }
  
  export interface CreateNotificationPayload {
    type: NotificationType;
    subtype?: NotificationSubtype;
    title: string;
    message: string;
    action?: NotificationAction;
    priority?: number;
    expireAt?: Date;
    icon?: string;
  }
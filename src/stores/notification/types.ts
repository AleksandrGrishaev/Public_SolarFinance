// src/stores/notification/types.ts

export enum NotificationType {
    SYSTEM = 'system',
    USER = 'user'
  }
  
  export enum NotificationSubtype {
    PROMO = 'promo',
    INFO = 'info',
    DEBT = 'debt'
  }
  
  export interface NotificationAction {
    text: string;
    route?: string;
    handler?: () => void;
  }
  
// Базовый интерфейс с общими свойствами
export interface BaseNotification {
    id: string;
    type: NotificationType;
    subtype?: NotificationSubtype;
    title: string;
    message: string;
    read: boolean;
    date: Date;
    action?: NotificationAction;
    priority?: number;
    expireAt?: Date;
    icon?: string;
  }
  
  // Интерфейс для INFO уведомлений
  export interface InfoNotification extends BaseNotification {
    subtype: NotificationSubtype.INFO;
    category?: string;
    tags?: string[];
    dismissible?: boolean;
  }
  
  // Интерфейс для DEBT уведомлений
  export interface DebtNotification extends BaseNotification {
    subtype: NotificationSubtype.DEBT;
    transactionName: string;
    amount: number;        // Сумма операции
    debtAmount: number;    // Сумма долга
    createdBy: string;     // Имя создателя
    transactionId: string; // ID транзакции для связи с базой данных
    currency?: string;     // Валюта (опционально)
  }
  
  // Объединяющий тип для всех видов уведомлений
  export type Notification = 
    | (BaseNotification & { subtype?: undefined }) // Для уведомлений без подтипа
    | InfoNotification
    | DebtNotification;
  
  export interface NotificationState {
    notifications: Notification[];
    isLoading: boolean;
    error: string | null;
  }
  
  export interface BaseCreateNotificationPayload {
    type: NotificationType;
    title: string;
    message: string;
    action?: NotificationAction;
    priority?: number;
    expireAt?: Date;
    icon?: string;
  }
  
  export interface CreateInfoNotificationPayload extends BaseCreateNotificationPayload {
    subtype: NotificationSubtype.INFO;
    category?: string;
    tags?: string[];
    dismissible?: boolean;
  }
  
  export interface CreateDebtNotificationPayload extends BaseCreateNotificationPayload {
    subtype: NotificationSubtype.DEBT;
    transactionName: string;
    amount: number;
    debtAmount: number;
    createdBy: string;
    transactionId: string;
    currency?: string;
  }
  
  export type CreateNotificationPayload = 
    | (BaseCreateNotificationPayload & { subtype?: undefined })
    | CreateInfoNotificationPayload
    | CreateDebtNotificationPayload;
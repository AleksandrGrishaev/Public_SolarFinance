// src/stores/notification/index.ts
import { useNotificationStore } from './notificationStore';
import { useNotificationService } from './notificationService';
import { DefaultNotifications, createNotification } from './DefaultNotification';
import { 
  Notification, 
  NotificationType,
  NotificationSubtype,
  NotificationAction,
  NotificationState,
  CreateNotificationPayload
} from './types';

// Реэкспорт всех необходимых компонентов для обеспечения чистого API
export {
  // Store
  useNotificationStore,
  
  // Service
  useNotificationService,
  
  // Helpers
  DefaultNotifications,
  createNotification,
  
  // Types
 
  NotificationType,
  NotificationSubtype,
  NotificationAction,
  NotificationState,
  CreateNotificationPayload
};

/**
 * Инициализирует и возвращает сервис уведомлений для использования в приложении
 */
export const initializeNotifications = () => {
  const service = useNotificationService();
  service.init();
  return service;
};
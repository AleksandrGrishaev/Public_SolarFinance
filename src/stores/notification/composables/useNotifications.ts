// src/stores/notification/composables/useNotifications.ts
import { computed } from 'vue';
import { useNotificationStore } from '../notificationStore';
import { useNotificationService } from '../notificationService';
import { NotificationType, NotificationSubtype, type NotificationAction } from '../types';

/**
 * Композабл для удобной работы с уведомлениями в компонентах Vue
 */
export function useNotifications() {
  const store = useNotificationStore();
  const service = useNotificationService();
  
  // Получение списка уведомлений
  const notifications = computed(() => store.sortedNotifications);
  const systemNotifications = computed(() => store.systemNotifications);
  const userNotifications = computed(() => store.userNotifications);
  const unreadCount = computed(() => store.unreadCount);
  const hasUnread = computed(() => store.hasUnread);
  const priorityNotifications = computed(() => store.prioritySortedNotifications);
  
  // Функция для создания пользовательского уведомления
  const showUserNotification = (
    title: string, 
    message: string, 
    subtype?: NotificationSubtype, 
    action?: NotificationAction
  ) => {
    return service.showUserNotification(title, message, subtype, action);
  };
  
  // Функция для создания системного уведомления
  const showSystemNotification = (
    title: string, 
    message: string, 
    subtype?: NotificationSubtype, 
    action?: NotificationAction
  ) => {
    return service.showSystemNotification(title, message, subtype, action);
  };
  
  // Быстрые методы для создания типовых уведомлений
  const showInfo = (title: string, message: string, action?: NotificationAction) => {
    return service.showInfo(title, message, action);
  };
  
  const showError = (title: string, message: string, action?: NotificationAction) => {
    return service.showError(title, message, action);
  };
  
  const showUpdate = (title: string, message: string, action?: NotificationAction) => {
    return service.showUpdate(title, message, action);
  };
  
  const showReminder = (title: string, message: string, action?: NotificationAction) => {
    return service.showReminder(title, message, action);
  };
  
  const showPromo = (
    title: string, 
    message: string, 
    action?: NotificationAction, 
    expireAt?: Date
  ) => {
    return service.showPromo(title, message, action, expireAt);
  };
  
  // Управление уведомлениями
  const markAsRead = (id: string) => store.markAsRead(id);
  const markAllAsRead = () => store.markAllAsRead();
  const deleteNotification = (id: string) => store.deleteNotification(id);
  const clearReadNotifications = () => store.clearReadNotifications();
  
  return {
    // Списки уведомлений
    notifications,
    systemNotifications,
    userNotifications,
    unreadCount,
    hasUnread,
    priorityNotifications,
    
    // Создание уведомлений
    showUserNotification,
    showSystemNotification,
    showInfo,
    showError,
    showUpdate,
    showReminder,
    showPromo,
    
    // Управление уведомлениями
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
    
    // Типы для удобства использования
    NotificationType,
    NotificationSubtype
  };
}
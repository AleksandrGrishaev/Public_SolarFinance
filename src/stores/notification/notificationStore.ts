// src/stores/notification/notificationStore.ts
import { defineStore } from 'pinia';
import type { 
  Notification, 
  NotificationState, 
  CreateNotificationPayload
} from './types';
import { createNotification } from './DefaultNotification';

export const useNotificationStore = defineStore('notifications', {
  state: (): NotificationState => ({
    notifications: [],
    isLoading: false,
    error: null,
  }),
  
  getters: {
    /**
     * Количество непрочитанных уведомлений
     */
    unreadCount: (state): number => 
      state.notifications.filter(n => !n.read).length,
    
    /**
     * Есть ли непрочитанные уведомления
     */
    hasUnread: (state): boolean => 
      state.notifications.some(n => !n.read),
    
    /**
     * Системные уведомления
     */
    systemNotifications: (state): Notification[] => 
      state.notifications.filter(n => n.type === 'system'),
    
    /**
     * Пользовательские уведомления
     */
    userNotifications: (state): Notification[] => 
      state.notifications.filter(n => n.type === 'user'),
    
    /**
     * Отсортированные уведомления по дате (новые вверху)
     */
    sortedNotifications: (state): Notification[] => 
      [...state.notifications].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()),

    /**
     * Актуальные уведомления (не просроченные)
     */
    validNotifications: (state): Notification[] => 
      state.notifications.filter(n => 
        !n.expireAt || new Date(n.expireAt) > new Date()),

    /**
     * Отсортированные уведомления по приоритету и дате
     */
    prioritySortedNotifications: (state): Notification[] => 
      [...state.notifications].sort((a, b) => {
        // Сначала по приоритету (высокий приоритет в начале)
        const priorityDiff = (b.priority || 1) - (a.priority || 1);
        if (priorityDiff !== 0) return priorityDiff;
        
        // Затем по дате (новые в начале)
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }),
  },
  
  actions: {
    /**
     * Загружает уведомления с сервера
     */
    async fetchNotifications() {
      this.isLoading = true;
      this.error = null;
      
      try {
        // Здесь должен быть запрос к API
        // const response = await api.get('/notifications');
        // this.notifications = response.data;
        
        // Временная заглушка для демонстрации
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Добавим тестовые уведомления
        this.notifications = [
          createNotification({
            type: 'system',
            subtype: 'update',
            title: 'Обновление приложения',
            message: 'Мы улучшили производительность и добавили новые функции!',
            priority: 3
          }),
          createNotification({
            type: 'user',
            subtype: 'reminder',
            title: 'Напоминание',
            message: 'Не забудьте заполнить профиль пользователя',
            priority: 2
          })
        ];
        
        this.isLoading = false;
      } catch (error) {
        this.error = 'Не удалось загрузить уведомления';
        this.isLoading = false;
      }
    },
    
    /**
     * Отмечает уведомление как прочитанное
     */
    async markAsRead(id: string) {
      const notification = this.notifications.find(n => n.id === id);
      if (notification) {
        notification.read = true;
        
        // Здесь должен быть запрос к API
        // await api.put(`/notifications/${id}/read`);
      }
    },
    
    /**
     * Отмечает все уведомления как прочитанные
     */
    async markAllAsRead() {
      this.notifications.forEach(n => n.read = true);
      
      // Здесь должен быть запрос к API
      // await api.put('/notifications/read-all');
    },
    
    /**
     * Удаляет уведомление
     */
    async deleteNotification(id: string) {
      this.notifications = this.notifications.filter(n => n.id !== id);
      
      // Здесь должен быть запрос к API
      // await api.delete(`/notifications/${id}`);
    },
    
    /**
     * Удаляет все прочитанные уведомления
     */
    async clearReadNotifications() {
      const readIds = this.notifications
        .filter(n => n.read)
        .map(n => n.id);
      
      this.notifications = this.notifications.filter(n => !n.read);
      
      // Здесь должен быть запрос к API
      // await api.delete('/notifications', { data: { ids: readIds } });
    },
    
    /**
     * Добавляет новое уведомление
     */
    addNotification(payload: CreateNotificationPayload) {
      const notification = createNotification(payload);
      this.notifications.unshift(notification);
      
      // Здесь должен быть запрос к API для сохранения на сервере
      // await api.post('/notifications', notification);
      
      return notification;
    },
    
    /**
     * Очищает все просроченные уведомления
     */
    clearExpiredNotifications() {
      const now = new Date();
      this.notifications = this.notifications.filter(n => 
        !n.expireAt || new Date(n.expireAt) > now
      );
    }
  }
});
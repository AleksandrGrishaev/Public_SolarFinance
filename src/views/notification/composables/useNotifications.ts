// src/views/notification/composables/useNotifications.ts
import { ref, computed } from 'vue';

interface NotificationItem {
  id: string;
  date: string;
  iconSrc: string;
  iconAlt?: string;
  title: string;
  notes?: string;
  description: string;
  declineText?: string;
  acceptText?: string;
}

export function useNotifications() {
  // This would later be connected to a Vuex/Pinia store
  const notifications = ref<NotificationItem[]>([
    {
      id: '1',
      date: '14 march',
      iconSrc: 'icon-box0.svg',
      title: 'New debt',
      notes: 'Notes: family expense',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    },
    {
      id: '2',
      date: '14 march',
      iconSrc: 'icon-box0.svg',
      title: 'Family expense',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore...'
    },
    {
      id: '3',
      date: '14 march',
      iconSrc: 'icon-box0.svg',
      title: 'Family expense',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore...'
    }
  ]);
  
  const hasNotifications = computed(() => notifications.value.length > 0);
  
  const getNotificationById = (id: string) => {
    return notifications.value.find(notification => notification.id === id);
  };
  
  const addNotification = (notification: NotificationItem) => {
    notifications.value.push(notification);
  };
  
  const removeNotification = (id: string) => {
    notifications.value = notifications.value.filter(notification => notification.id !== id);
  };
  
  const clearAllNotifications = () => {
    notifications.value = [];
  };
  
  const acceptNotification = (id: string) => {
    // Here we would add business logic for accepting a notification
    // For now, just remove it
    removeNotification(id);
  };
  
  const declineNotification = (id: string) => {
    // Here we would add business logic for declining a notification
    // For now, just remove it
    removeNotification(id);
  };
  
  return {
    notifications,
    hasNotifications,
    getNotificationById,
    addNotification,
    removeNotification,
    clearAllNotifications,
    acceptNotification,
    declineNotification
  };
}
// src/views/notification/initNotifications.ts
import { App } from 'vue';
import { initializeNotifications } from '@/stores/notification';
import NotificationPopup from '@/views/notification/components/NotificationPopup.vue';
import NotificationList from '@/views/notification/components/NotificationList.vue';

/**
 * Initialize the notification system
 * @param app Vue application instance
 */
export function initNotifications(app: App) {
  // Register components globally
  app.component('NotificationPopup', NotificationPopup);
  app.component('NotificationList', NotificationList);
  
  // Initialize notification service
  const notificationService = initializeNotifications();
  
  // Optionally, add any app-wide test notifications here
  // For example, welcome notification on first load
  const hasSeenWelcome = localStorage.getItem('has_seen_welcome');
  if (!hasSeenWelcome) {
    notificationService.showInfo(
      'Welcome to the app',
      'Explore our new features and improvements',
      {
        text: 'Explore',
        route: '/explore'
      }
    );
    localStorage.setItem('has_seen_welcome', 'true');
  }
  
  return notificationService;
}
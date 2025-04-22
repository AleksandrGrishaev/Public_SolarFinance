<!-- src/views/notification/NotificationsView.vue -->
<template>
    <div class="notifications-view">
      <AppTopHeader 
        title="Notifications" 
        :showNotificationIcon="false"
      />
      
      <div class="notifications-view__header">
        <div class="notifications-view__filters">
          <BaseButton
            variant="outline"
            :text="activeTab === 'all' ? 'All' : 'All notifications'"
            :class="{ 'active': activeTab === 'all' }"
            @click="activeTab = 'all'"
          />
          <BaseButton
            variant="outline" 
            :text="activeTab === 'system' ? 'System' : 'System notifications'"
            :class="{ 'active': activeTab === 'system' }"
            @click="activeTab = 'system'"
          />
          <BaseButton 
            variant="outline"
            :text="activeTab === 'user' ? 'User' : 'User notifications'"
            :class="{ 'active': activeTab === 'user' }"
            @click="activeTab = 'user'"
          />
        </div>
        
        <div class="notifications-view__actions">
          <BaseButton 
            v-if="hasUnread"
            variant="outline" 
            text="Mark all read" 
            @click="markAllAsRead" 
          />
          <BaseButton 
            variant="outline" 
            text="Clear read" 
            @click="clearReadNotifications" 
          />
        </div>
      </div>
      
      <div class="notifications-view__content">
        <!-- List of notifications -->
        <NotificationList 
          :notifications="formattedNotifications"
          @decline="onDeclineNotification"
          @accept="onAcceptNotification"
        />
        
        <div v-if="!hasNotifications" class="notifications-view__empty">
          <p>No notifications to display.</p>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed } from 'vue';
  import { format as formatDate } from 'date-fns';
  import { useRouter } from 'vue-router';
  import AppTopHeader from '@/components/navigation/AppTopHeader.vue';
  import BaseButton from '@/components/atoms/buttons/BaseButton.vue';
  import NotificationList from './components/NotificationList.vue';
  import { useNotifications } from '@/stores/notification/composables/useNotifications';
  import { NotificationSubtype, NotificationType } from '@/stores/notification/types';
  
  type TabType = 'all' | 'system' | 'user';
  
  export default defineComponent({
    name: 'NotificationsView',
    components: {
      AppTopHeader,
      BaseButton,
      NotificationList
    },
    setup() {
      const router = useRouter();
      const activeTab = ref<TabType>('all');
      
      // Use notifications composable
      const {
        notifications,
        systemNotifications,
        userNotifications,
        hasUnread,
        markAllAsRead,
        clearReadNotifications,
        deleteNotification,
        markAsRead
      } = useNotifications();
      
      // Format the notifications for our UI components based on active tab
      const formattedNotifications = computed(() => {
        const notificationsToDisplay = activeTab.value === 'all' 
          ? notifications.value 
          : activeTab.value === 'system' 
            ? systemNotifications.value 
            : userNotifications.value;
        
        return notificationsToDisplay.map(notification => {
          // Get appropriate icon based on notification subtype
          let iconSrc = 'icon-box0.svg'; // Default icon
          
          switch (notification.subtype) {
            case NotificationSubtype.INFO:
              iconSrc = 'icon-info.svg';
              break;
            case NotificationSubtype.ERROR:
              iconSrc = 'icon-error.svg';
              break;
            case NotificationSubtype.UPDATE:
              iconSrc = 'icon-update.svg';
              break;
            case NotificationSubtype.REMINDER:
              iconSrc = 'icon-reminder.svg';
              break;
            case NotificationSubtype.PROMO:
              iconSrc = 'icon-promo.svg';
              break;
          }
          
          // Format date for display
          const formattedDate = formatDate(new Date(notification.date), 'd MMMM');
          
          return {
            id: notification.id,
            date: formattedDate,
            iconSrc,
            iconAlt: notification.subtype || 'notification',
            title: notification.title,
            notes: '',
            description: notification.message,
            declineText: 'Dismiss',
            acceptText: notification.action?.text || 'View',
            read: notification.read,
            action: notification.action
          };
        });
      });
      
      const hasNotifications = computed(() => {
        return formattedNotifications.value.length > 0;
      });
      
      const onDeclineNotification = (id: string) => {
        console.log('Dismissed notification:', id);
        deleteNotification(id);
      };
      
      const onAcceptNotification = (id: string) => {
        console.log('Accepted notification:', id);
        
        // Find the notification
        const notification = notifications.value.find(n => n.id === id);
        
        // Mark as read
        markAsRead(id);
        
        // If there's an action handler, execute it
        if (notification?.action?.handler) {
          notification.action.handler();
        }
        
        // If there's a route, navigate to it
        if (notification?.action?.route) {
          router.push(notification.action.route);
        }
      };
      
      return {
        activeTab,
        formattedNotifications,
        hasNotifications,
        hasUnread,
        markAllAsRead,
        clearReadNotifications,
        onDeclineNotification,
        onAcceptNotification
      };
    }
  });
  </script>
  
  <style scoped>
  .notifications-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background-color: var(--bg-primary);
  }
  
  .notifications-view__header {
    display: flex;
    flex-direction: column;
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
    gap: var(--spacing-md);
  }
  
  .notifications-view__filters {
    display: flex;
    gap: var(--spacing-sm);
    overflow-x: auto;
    padding-bottom: var(--spacing-xs);
  }
  
  .notifications-view__filters :deep(.form-button) {
    padding: var(--spacing-xs) var(--spacing-md);
    white-space: nowrap;
  }
  
  .notifications-view__filters :deep(.form-button.active) {
    background-color: var(--accent-color-light);
    color: var(--accent-color);
  }
  
  .notifications-view__actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-sm);
  }
  
  .notifications-view__content {
    flex: 1;
    overflow-y: auto;
    padding: 0 var(--spacing-lg);
  }
  
  .notifications-view__empty {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    color: var(--text-secondary);
  }
  </style>
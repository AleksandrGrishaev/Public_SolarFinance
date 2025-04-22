<!-- src/views/notification/components/NotificationPopup.vue -->
<template>
    <BaseFloatingPopup
      v-model="isVisible"
      position="right"
      :width="'90%'"
      :max-width="'400px'"
      :height="'70%'"
      @close="onClose"
    >
      <div class="notification-popup">
        <div class="notification-popup__header">
          <h2 class="en-subheading">Notifications</h2>
          <div class="notification-popup__actions">
            <BaseButton 
              v-if="hasUnread"
              variant="outline" 
              text="Mark all read" 
              @click="markAllAsRead" 
            />
            <BaseIcon 
              :icon="IconX" 
              size="md" 
              clickable
              @click="onClose"
            />
          </div>
        </div>
        <div class="notification-popup__content">
          <NotificationList 
            :notifications="formattedNotifications"
            @decline="onDeclineNotification"
            @accept="onAcceptNotification"
          />
        </div>
      </div>
    </BaseFloatingPopup>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed } from 'vue';
  import { IconX as IconXOrig } from '@tabler/icons-vue';
  const IconX = IconXOrig;
  import { format as formatDate } from 'date-fns';
  import BaseFloatingPopup from '@/components/organisms/popups/BaseFloatingPopup.vue';
  import BaseIcon from '@/components/ui/icons/BaseIcon.vue';
  import BaseButton from '@/components/atoms/buttons/BaseButton.vue';
  import NotificationList from './NotificationList.vue';
  import { useNotifications } from '@/stores/notification/composables/useNotifications';
  import { NotificationSubtype } from '@/stores/notification/types';
  
  export default defineComponent({
    name: 'NotificationPopup',
    components: {
      BaseFloatingPopup,
      BaseIcon,
      BaseButton,
      NotificationList
    },
    setup() {
      // Using IconX directly from import
      const isVisible = ref(false);
      
      // Use the store
      const {
        notifications,
        hasUnread,
        markAllAsRead,
        deleteNotification,
        markAsRead
      } = useNotifications();
      
      // Format the notifications for our UI components
      const formattedNotifications = computed(() => {
        return notifications.value.map(notification => {
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
      
      const open = () => {
        isVisible.value = true;
      };
      
      const close = () => {
        isVisible.value = false;
      };
      
      const onClose = () => {
        close();
      };
      
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
          // Assuming you have router injected
          // router.push(notification.action.route);
          console.log('Navigate to:', notification.action.route);
        }
        
        // Close the popup if navigating
        if (notification?.action?.route) {
          close();
        }
      };
      
      return {
        IconX,
        isVisible,
        formattedNotifications,
        hasUnread,
        open,
        close,
        onClose,
        markAllAsRead,
        onDeclineNotification,
        onAcceptNotification
      };
    }
  });
  </script>
  
  <style scoped>
  .notification-popup {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }
  
  .notification-popup__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
  }
  
  .notification-popup__actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }
  
  .notification-popup__content {
    flex: 1;
    overflow-y: auto;
  }
  </style>
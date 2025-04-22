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
            <div class="notification-popup__close-icon" @click="onClose">
              <IconX size="20" />
            </div>
          </div>
        </div>
        <div class="notification-popup__content">
          <NotificationList 
            :notifications="formattedNotifications"
            @decline="onDeclineNotification"
            @accept="onAcceptNotification"
            @read="onReadNotification"
            @debtView="onDebtView"
            @debtDecline="onDebtDecline"
            @debtAccept="onDebtAccept"
          />
        </div>
      </div>
    </BaseFloatingPopup>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed } from 'vue';
  import { IconX } from '@tabler/icons-vue';
  import { format as formatDate } from 'date-fns';
  import { useRouter } from 'vue-router';
  import BaseFloatingPopup from '@/components/organisms/popups/BaseFloatingPopup.vue';
  import BaseButton from '@/components/atoms/buttons/BaseButton.vue';
  import NotificationList from './NotificationList.vue';
  import { useNotifications } from '@/stores/notification/composables/useNotifications';
  import { NotificationSubtype } from '@/stores/notification/types';
  
  export default defineComponent({
    name: 'NotificationPopup',
    components: {
      BaseFloatingPopup,
      BaseButton,
      NotificationList,
      IconX
    },
    setup() {
      const router = useRouter();
      const isVisible = ref(false);
      
      // Use the notification store
      const {
        notifications,
        hasUnread,
        markAllAsRead,
        deleteNotification,
        markAsRead,
        showInfo
      } = useNotifications();
      
      // Format the notifications for our UI components
      const formattedNotifications = computed(() => {
        return notifications.value.map(notification => {
          // Special handling for DEBT notifications
          if (notification.subtype === NotificationSubtype.DEBT) {
            return {
              ...notification,
              // Add date formatting for correct display
              date: typeof notification.date === 'string' 
                ? notification.date 
                : formatDate(new Date(notification.date), 'd MMMM')
            };
          }
          
          // Format date for display
          const formattedDate = typeof notification.date === 'string' 
            ? notification.date 
            : formatDate(new Date(notification.date), 'd MMMM');
          
          return {
            ...notification,
            date: formattedDate
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
          router.push(notification.action.route);
          // Close the popup if navigating
          close();
        }
      };
      
      const onReadNotification = (id: string) => {
        markAsRead(id);
      };
      
      const onDebtView = (data: { id: string, transactionId: string }) => {
        console.log('View debt transaction:', data);
        
        // Mark notification as read
        markAsRead(data.id);
        
        // Navigate to transaction
        router.push(`/transactions/${data.transactionId}`);
        
        // Close popup
        close();
      };
      
      const onDebtDecline = (data: { id: string, transactionId: string }) => {
        console.log('Decline debt transaction:', data);
        
        // Here should be logic for declining the debt
        // For example, calling an API to change transaction status
        
        // Delete the notification
        deleteNotification(data.id);
        
        // Show a success message
        showInfo('Debt declined', 'You have successfully declined the debt');
      };
      
      const onDebtAccept = (data: { id: string, transactionId: string }) => {
        console.log('Accept debt transaction:', data);
        
        // Here should be logic for accepting the debt
        // For example, calling an API to change transaction status
        
        // Delete the notification
        deleteNotification(data.id);
        
        // Show a success message
        showInfo('Debt accepted', 'You have successfully accepted the debt');
      };
      
      return {
        isVisible,
        formattedNotifications,
        hasUnread,
        open,
        close,
        onClose,
        markAllAsRead,
        onDeclineNotification,
        onAcceptNotification,
        onReadNotification,
        onDebtView,
        onDebtDecline,
        onDebtAccept
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
  
  .notification-popup__close-icon {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    transition: background-color 0.2s ease;
  }
  
  .notification-popup__close-icon:hover {
    background-color: var(--bg-hover);
  }
  
  .notification-popup__content {
    flex: 1;
    overflow-y: auto;
  }
  </style>
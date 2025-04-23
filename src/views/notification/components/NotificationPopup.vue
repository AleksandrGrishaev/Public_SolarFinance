<!-- src/views/notification/components/NotificationPopup.vue -->
<template>
  <BaseFloatingPopup
    v-model="isVisible"
    position="bottom"
    :width="'100%'"
    :max-width="'400px'"
    :height="'auto'"
    @close="onClose"
  >
    <div class="notification-popup">
      <div class="notification-popup__header">
        <div class="header-actions">
          <div class="mark-read-button" @click="handleMarkAllAsRead" v-if="hasUnread">
            Mark all read
          </div>
        </div>
        <div class="close-icon" @click="onClose">
          <IconX size="20" color="var(--color-warning, #A44942)" />
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
          @delete="onDeleteNotification"
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
import NotificationList from './NotificationList.vue';
import { useNotifications } from '@/stores/notification/composables/useNotifications';
import { NotificationSubtype } from '@/stores/notification/types';
import { useAlerts } from '@/stores/alert/alertService';

export default defineComponent({
  name: 'NotificationPopup',
  components: {
    BaseFloatingPopup,
    NotificationList,
    IconX
  },
  expose: ['open', 'close'],
  setup() {
    const router = useRouter();
    const isVisible = ref(false);
    const alerts = useAlerts();
    
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
    
    // Function to check if popup should close after notifications are deleted/modified
    const checkAndCloseIfEmpty = () => {
      if (notifications.value.length === 0) {
        setTimeout(() => {
          isVisible.value = false;
        }, 500);
        return true;
      }
      return false;
    };

    // Public methods
    const open = () => {
      isVisible.value = true;
    };
    
    const close = () => {
      isVisible.value = false;
    };
    
    const onClose = () => {
      close();
    };

    // Mark all as read
    const handleMarkAllAsRead = () => {
      markAllAsRead();
      
      // Show a success alert
      alerts.success('Notifications marked as read', {
        duration: 2000
      });
      
      // Close popup after a brief delay
      setTimeout(() => {
        close();
      }, 500);
    };
    
    // Handle notification actions
    const onDeleteNotification = (id: string) => {
      deleteNotification(id);
      checkAndCloseIfEmpty();
    };
    
    const onDeclineNotification = (id: string) => {
      console.log('Dismissed notification:', id);
      deleteNotification(id);
      
      // Show a simple alert that notification was dismissed
      alerts.info('Notification dismissed', {
        duration: 2000
      });
      
      checkAndCloseIfEmpty();
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
      
      // After handling, remove the notification
      deleteNotification(id);
      
      // Show a success alert
      alerts.success('Action completed', {
        title: notification?.action?.text || 'Success',
        duration: 3000
      });
      
      // If we're not already navigating, check if we should close the popup
      if (!notification?.action?.route) {
        checkAndCloseIfEmpty();
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
      
      // Delete the notification
      deleteNotification(data.id);
      
      // Show a warning alert
      alerts.warning('Debt declined', {
        title: 'Debt Request',
        message: 'You have declined the debt request',
        duration: 3000
      });
      
      checkAndCloseIfEmpty();
    };
    
    const onDebtAccept = (data: { id: string, transactionId: string }) => {
      console.log('Accept debt transaction:', data);
      
      // Delete the notification
      deleteNotification(data.id);
      
      // Show a success alert
      alerts.success('Debt accepted', {
        title: 'Debt Request',
        message: 'You have successfully accepted the debt',
        duration: 3000
      });
      
      checkAndCloseIfEmpty();
    };
    
    return {
      isVisible,
      formattedNotifications,
      hasUnread,
      open,
      close,
      onClose,
      handleMarkAllAsRead,
      onDeleteNotification,
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
  padding: 13px 13px 13px 13px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-actions {
  /* This container ensures the Mark all read button has a fixed position */
  display: flex;
  flex: 1;
}

.mark-read-button {
  color: var(--maincolor-colorsucces, #53b794);
  text-align: left;
  font-family: var(--enbutton-font-family, "Inter-Medium", sans-serif);
  font-size: var(--enbutton-font-size, 16px);
  line-height: var(--enbutton-line-height, 24px);
  font-weight: var(--enbutton-font-weight, 500);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
}

.close-icon {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; /* Prevent shrinking */
}

.notification-popup__content {
  flex: 1;
  overflow-y: auto;
  position: relative;
  padding-bottom: 10px;
  max-height: 95vh; /* Limit the height to enable scrolling for many notifications */
}
</style>
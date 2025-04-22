<!-- src/views/notification/components/NotificationPopup.vue -->
<template>
  <BaseFloatingPopup
    v-model="isVisible"
    position="bottom"
    :width="'90%'"
    :max-width="'400px'"
    :height="'auto'"
    @close="onClose"
  >
    <div class="notification-popup">
      <div class="notification-popup__header">
        <div class="mark-read-button" @click="markAllAsRead" v-if="hasUnread">
          Mark all read
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

export default defineComponent({
  name: 'NotificationPopup',
  components: {
    BaseFloatingPopup,
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
  padding: 13px 21px 13px 21px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
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
}

.notification-popup__content {
  flex: 1;
  overflow-y: auto;
  position: relative;
}

.notification-popup__content::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40px;
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.3));
  backdrop-filter: blur(4px);
  pointer-events: none; /* Allows clicking through the gradient */
}
</style>
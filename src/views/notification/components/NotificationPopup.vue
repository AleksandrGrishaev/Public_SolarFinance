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
          <BaseIcon 
            :icon="IconX" 
            size="md" 
            clickable
            @click="onClose"
          />
        </div>
        <div class="notification-popup__content">
          <NotificationList 
            :notifications="notifications"
            @decline="onDeclineNotification"
            @accept="onAcceptNotification"
          />
        </div>
      </div>
    </BaseFloatingPopup>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, PropType, watch } from 'vue';
  import { IconX } from '@tabler/icons-vue';
  import BaseFloatingPopup from '@/components/organisms/popups/BaseFloatingPopup.vue';
  import BaseIcon from '@/components/ui/icons/BaseIcon.vue';
  import NotificationList from './NotificationList.vue';
  
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
  
  export default defineComponent({
    name: 'NotificationPopup',
    components: {
      BaseFloatingPopup,
      BaseIcon,
      NotificationList
    },
    setup() {
      const IconX = ref(IconX);
      const isVisible = ref(false);
      const notifications = ref<NotificationItem[]>([
        // Sample data - will be replaced with data from store
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
        // Here would be the logic to handle declining a notification
        console.log('Declined notification:', id);
        // This would be replaced with store action call
        notifications.value = notifications.value.filter(n => n.id !== id);
      };
      
      const onAcceptNotification = (id: string) => {
        // Here would be the logic to handle accepting a notification
        console.log('Accepted notification:', id);
        // This would be replaced with store action call
        notifications.value = notifications.value.filter(n => n.id !== id);
      };
      
      return {
        IconX,
        isVisible,
        notifications,
        open,
        close,
        onClose,
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
  
  .notification-popup__content {
    flex: 1;
    overflow-y: auto;
  }
  </style>
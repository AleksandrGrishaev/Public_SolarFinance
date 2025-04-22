<!-- src/views/notification/components/NotificationList.vue -->
<template>
    <div class="notification-list">
      <template v-for="(group, date) in groupedNotifications" :key="date">
        <BaseList :date="date" :dateFormat="dateFormat">
          <Notification
            v-for="notification in group"
            :key="notification.id"
            :iconSrc="notification.iconSrc"
            :iconAlt="notification.iconAlt"
            :title="notification.title"
            :notes="notification.notes"
            :description="notification.description"
            :declineText="notification.declineText || 'Dismiss'"
            :acceptText="notification.acceptText || 'View'"
            :class="{ 'notification--read': notification.read }"
            @decline="onDecline(notification.id)"
            @accept="onAccept(notification.id)"
          />
        </BaseList>
      </template>
      
      <div v-if="!hasNotifications" class="notification-list__empty">
        <p class="en-body text-secondary">No notifications</p>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, PropType, computed } from 'vue';
  import BaseList from '@/components/molecules/lists/BaseList.vue';
  import Notification from '@/components/organisms/notifications/Notification.vue';
  
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
    read?: boolean;
    action?: any;
  }
  
  export default defineComponent({
    name: 'NotificationList',
    components: {
      BaseList,
      Notification
    },
    props: {
      notifications: {
        type: Array as PropType<NotificationItem[]>,
        default: () => []
      },
      dateFormat: {
        type: String,
        default: 'd MMMM'
      }
    },
    emits: ['decline', 'accept'],
    setup(props, { emit }) {
      const groupedNotifications = computed(() => {
        const groups: Record<string, NotificationItem[]> = {};
        
        props.notifications.forEach(notification => {
          const date = notification.date;
          if (!groups[date]) {
            groups[date] = [];
          }
          groups[date].push(notification);
        });
        
        // Sort groups by date (newest first)
        return Object.fromEntries(
          Object.entries(groups).sort((a, b) => {
            // Assuming date format is "d MMMM"
            return new Date(b[0]).getTime() - new Date(a[0]).getTime();
          })
        );
      });
      
      const hasNotifications = computed(() => props.notifications.length > 0);
      
      const onDecline = (id: string) => {
        emit('decline', id);
      };
      
      const onAccept = (id: string) => {
        emit('accept', id);
      };
      
      return {
        groupedNotifications,
        hasNotifications,
        onDecline,
        onAccept
      };
    }
  });
  </script>
  
  <style scoped>
  .notification-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: var(--spacing-md) 0;
    overflow-y: auto;
    max-height: 100%;
  }
  
  .notification-list__empty {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: var(--spacing-xl) 0;
  }
  
  :deep(.notification--read) {
    opacity: 0.7;
  }
  </style>
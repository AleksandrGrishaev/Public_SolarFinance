<!-- src/views/notification/components/NotificationList.vue -->
<template>
    <div class="notification-list">
      <template v-for="(group, date) in groupedNotifications" :key="date">
        <BaseList :date="date">
          <Notification
            v-for="notification in group"
            :key="notification.id"
            :iconSrc="notification.iconSrc"
            :iconAlt="notification.iconAlt"
            :title="notification.title"
            :notes="notification.notes"
            :description="notification.description"
            :declineText="notification.declineText || 'Decline'"
            :acceptText="notification.acceptText || 'Accept'"
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
        
        return groups;
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
  </style>
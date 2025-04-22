<!-- src/views/notification/components/NotificationItem.vue -->
<template>
    <div class="notification-item" :class="{ 'notification-item--read': read }">
      <div class="notification-item__icon">
        <img :src="getIconPath(iconType)" :alt="iconType" class="notification-item__icon-img" />
      </div>
      <div class="notification-item__content">
        <div class="notification-item__header">
          <h3 class="notification-item__title en-body">{{ title }}</h3>
          <span class="notification-item__time en-small text-secondary">{{ formattedTime }}</span>
        </div>
        <p class="notification-item__message en-small">{{ message }}</p>
        <div v-if="hasAction" class="notification-item__actions">
          <BaseButton 
            variant="outline" 
            :text="actionText" 
            @click="handleAction" 
          />
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, computed } from 'vue';
  import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
  import BaseButton from '@/components/atoms/buttons/BaseButton.vue';
  import { NotificationSubtype } from '@/stores/notification/types';
  
  export default defineComponent({
    name: 'NotificationItem',
    components: {
      BaseButton
    },
    props: {
      id: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true
      },
      message: {
        type: String,
        required: true
      },
      date: {
        type: [Date, String],
        required: true
      },
      read: {
        type: Boolean,
        default: false
      },
      iconType: {
        type: String,
        default: 'info'
      },
      action: {
        type: Object,
        default: null
      }
    },
    emits: ['action', 'read'],
    setup(props, { emit }) {
      const hasAction = computed(() => !!props.action);
      const actionText = computed(() => props.action?.text || 'View');
      
      // Format time display - today shows time, older shows date
      const formattedTime = computed(() => {
        const dateObj = typeof props.date === 'string' ? new Date(props.date) : props.date;
        
        if (isToday(dateObj)) {
          return format(dateObj, 'HH:mm');
        } else if (isYesterday(dateObj)) {
          return 'Yesterday';
        } else if (dateObj > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
          // Less than a week ago
          return formatDistanceToNow(dateObj, { addSuffix: true });
        } else {
          return format(dateObj, 'd MMM');
        }
      });
      
      // Map notification types to icon paths
      const getIconPath = (type: string) => {
        switch (type) {
          case NotificationSubtype.INFO:
            return '/icons/notification-info.svg';
          case NotificationSubtype.ERROR:
            return '/icons/notification-error.svg';
          case NotificationSubtype.UPDATE:
            return '/icons/notification-update.svg';
          case NotificationSubtype.REMINDER:
            return '/icons/notification-reminder.svg';
          case NotificationSubtype.PROMO:
            return '/icons/notification-promo.svg';
          default:
            return '/icons/notification-default.svg';
        }
      };
      
      const handleAction = () => {
        if (!props.read) {
          emit('read', props.id);
        }
        
        if (props.action) {
          emit('action', {
            id: props.id,
            action: props.action
          });
        }
      };
      
      return {
        hasAction,
        actionText,
        formattedTime,
        getIconPath,
        handleAction
      };
    }
  });
  </script>
  
  <style scoped>
  .notification-item {
    display: flex;
    padding: var(--spacing-sm);
    background-color: var(--bg-primary);
    border-radius: var(--border-radius-md);
    margin-bottom: var(--spacing-xs);
    box-shadow: var(--shadow-sm);
    transition: background-color 0.2s ease;
  }
  
  .notification-item:hover {
    background-color: var(--bg-secondary);
  }
  
  .notification-item--read {
    opacity: 0.7;
  }
  
  .notification-item__icon {
    margin-right: var(--spacing-sm);
    display: flex;
    align-items: flex-start;
  }
  
  .notification-item__icon-img {
    width: var(--icon-size-md);
    height: var(--icon-size-md);
    border-radius: var(--border-radius-sm);
  }
  
  .notification-item__content {
    flex: 1;
  }
  
  .notification-item__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-xs);
  }
  
  .notification-item__title {
    font-weight: 500;
    margin: 0;
  }
  
  .notification-item__time {
    white-space: nowrap;
  }
  
  .notification-item__message {
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--text-secondary);
  }
  
  .notification-item__actions {
    display: flex;
    justify-content: flex-end;
  }
  </style>
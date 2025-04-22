<!-- src/views/notification/components/NotificationList.vue -->
<template>
  <div class="notification-list">
    <template v-for="(group, date) in groupedNotifications" :key="date">
      <BaseList :date="date" :dateFormat="dateFormat">
        <template v-for="notification in group" :key="notification.id">
          <!-- Debt Notification -->
          <NotificationDebtItem
            v-if="notification.subtype === 'debt'"
            :id="notification.id"
            :title="notification.title"
            :message="notification.message"
            :date="notification.date"
            :read="notification.read"
            :transactionName="notification.transactionName"
            :amount="notification.amount"
            :debtAmount="notification.debtAmount"
            :createdBy="notification.createdBy"
            :transactionId="notification.transactionId"
            :currency="notification.currency || 'RUB'"
            @view="onDebtView"
            @decline="onDebtDecline"
            @accept="onDebtAccept"
            @read="onRead"
          />
          
          <!-- Regular Notification -->
          <NotificationItem
            v-else
            :id="notification.id"
            :title="notification.title"
            :message="notification.message"
            :date="notification.date"
            :read="notification.read"
            :iconType="notification.subtype"
            :action="notification.action"
            @action="onAction"
            @read="onRead"
            @delete="onDelete"
          />
        </template>
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
import NotificationItem from './NotificationItem.vue';
import NotificationDebtItem from './NotificationDebtItem.vue';
import { NotificationSubtype } from '@/stores/notification/types';

interface NotificationBase {
  id: string;
  title: string;
  message: string;
  date: string | Date;
  read?: boolean;
  subtype?: string;
  action?: any;
}

interface DebtNotification extends NotificationBase {
  subtype: 'debt';
  transactionName: string;
  amount: number;
  debtAmount: number;
  createdBy: string;
  transactionId: string;
  currency?: string;
}

type NotificationItem = NotificationBase | DebtNotification;

export default defineComponent({
  name: 'NotificationList',
  components: {
    BaseList,
    NotificationItem,
    NotificationDebtItem
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
  emits: ['decline', 'accept', 'read', 'debtView', 'debtDecline', 'debtAccept', 'delete'],
  setup(props, { emit }) {
    const groupedNotifications = computed(() => {
      const groups: Record<string, NotificationItem[]> = {};
      
      props.notifications.forEach(notification => {
        // Ensure date is a string format for grouping
        let dateStr: string;
        if (typeof notification.date === 'string') {
          dateStr = notification.date;
        } else {
          const dateObj = new Date(notification.date);
          // Format date to a consistent string format for grouping
          const options: Intl.DateTimeFormatOptions = { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          };
          dateStr = new Intl.DateTimeFormat('en-US', options).format(dateObj);
        }
        
        if (!groups[dateStr]) {
          groups[dateStr] = [];
        }
        groups[dateStr].push(notification);
      });
      
      // Sort groups by date (newest first)
      return Object.fromEntries(
        Object.entries(groups).sort((a, b) => {
          // Convert string dates back to Date objects for comparison
          return new Date(b[0]).getTime() - new Date(a[0]).getTime();
        })
      );
    });
    
    const hasNotifications = computed(() => props.notifications.length > 0);
    
    const onAction = (data: { id: string, action: any }) => {
      if (data.action.handler) {
        data.action.handler();
      } else if (data.action.text === 'Dismiss') {
        emit('decline', data.id);
      } else {
        emit('accept', data.id);
      }
    };
    
    const onRead = (id: string) => {
      emit('read', id);
    };
    
    const onDelete = (id: string) => {
      emit('delete', id);
    };
    
    const onDebtView = (data: { id: string, transactionId: string }) => {
      emit('debtView', data);
    };
    
    const onDebtDecline = (data: { id: string, transactionId: string }) => {
      emit('debtDecline', data);
    };
    
    const onDebtAccept = (data: { id: string, transactionId: string }) => {
      emit('debtAccept', data);
    };
    
    return {
      groupedNotifications,
      hasNotifications,
      onAction,
      onRead,
      onDelete,
      onDebtView,
      onDebtDecline,
      onDebtAccept
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
  color: rgba(255, 255, 255, 0.7);
}
</style>
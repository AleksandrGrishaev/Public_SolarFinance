<!-- src/views/notification/components/NotificationDebtItem.vue -->
<template>
    <div class="debt-notification" :class="{ 'debt-notification--read': read }">
      <div class="debt-notification__icon">
        <component :is="IconCash" size="24" class="debt-notification__icon-img" />
      </div>
      <div class="debt-notification__content">
        <div class="debt-notification__header">
          <h3 class="debt-notification__title en-body">{{ title }}</h3>
          <span class="debt-notification__time en-small text-secondary">{{ formattedTime }}</span>
        </div>
        <p class="debt-notification__message en-small">{{ message }}</p>
        
        <div class="debt-notification__details">
          <div class="debt-notification__row">
            <span class="debt-notification__label">Transaction:</span>
            <span class="debt-notification__value">{{ transactionName }}</span>
          </div>
          <div class="debt-notification__row">
            <span class="debt-notification__label">Total Amount:</span>
            <span class="debt-notification__value">{{ formattedAmount }}</span>
          </div>
          <div class="debt-notification__row">
            <span class="debt-notification__label">Your Debt:</span>
            <span class="debt-notification__value debt-notification__debt-amount">{{ formattedDebtAmount }}</span>
          </div>
          <div class="debt-notification__row">
            <span class="debt-notification__label">Created by:</span>
            <span class="debt-notification__value">{{ createdBy }}</span>
          </div>
        </div>
        
        <div class="debt-notification__actions">
          <BaseButton 
            variant="outline" 
            text="Decline" 
            @click="decline" 
          />
          <BaseButton 
            variant="outline" 
            text="View" 
            @click="view" 
          />
          <BaseButton 
            variant="primary" 
            text="Accept" 
            @click="accept" 
          />
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, computed } from 'vue';
  import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
  import { IconCash } from '@tabler/icons-vue';
  import BaseButton from '@/components/atoms/buttons/BaseButton.vue';
  
  export default defineComponent({
    name: 'NotificationDebtItem',
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
      transactionName: {
        type: String,
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      debtAmount: {
        type: Number,
        required: true
      },
      createdBy: {
        type: String,
        required: true
      },
      transactionId: {
        type: String,
        required: true
      },
      currency: {
        type: String,
        default: 'RUB'
      }
    },
    emits: ['view', 'decline', 'accept', 'read'],
    setup(props, { emit }) {
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
      
      // Format currency amounts
      const formattedAmount = computed(() => {
        return new Intl.NumberFormat('ru-RU', { 
          style: 'currency', 
          currency: props.currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(props.amount);
      });
      
      const formattedDebtAmount = computed(() => {
        return new Intl.NumberFormat('ru-RU', { 
          style: 'currency', 
          currency: props.currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(props.debtAmount);
      });
      
      // Action handlers
      const markAsRead = () => {
        if (!props.read) {
          emit('read', props.id);
        }
      };
      
      const view = () => {
        markAsRead();
        emit('view', { 
          id: props.id, 
          transactionId: props.transactionId 
        });
      };
      
      const decline = () => {
        markAsRead();
        emit('decline', { 
          id: props.id, 
          transactionId: props.transactionId 
        });
      };
      
      const accept = () => {
        markAsRead();
        emit('accept', { 
          id: props.id, 
          transactionId: props.transactionId 
        });
      };
      
      return {
        IconCash, // Export the icon for the template
        formattedTime,
        formattedAmount,
        formattedDebtAmount,
        view,
        decline,
        accept
      };
    }
  });
  </script>
  
  <style scoped>
  .debt-notification {
    display: flex;
    padding: var(--spacing-md);
    background-color: var(--bg-primary);
    border-radius: var(--border-radius-md);
    margin-bottom: var(--spacing-xs);
    box-shadow: var(--shadow-sm);
    transition: background-color 0.2s ease;
  }
  
  .debt-notification:hover {
    background-color: var(--bg-secondary);
  }
  
  .debt-notification--read {
    opacity: 0.7;
  }
  
  .debt-notification__icon {
    margin-right: var(--spacing-md);
    display: flex;
    align-items: flex-start;
    color: var(--color-warning);
  }
  
  .debt-notification__icon-img {
    border-radius: var(--border-radius-sm);
  }
  
  .debt-notification__content {
    flex: 1;
  }
  
  .debt-notification__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-xs);
  }
  
  .debt-notification__title {
    font-weight: 500;
    margin: 0;
  }
  
  .debt-notification__time {
    white-space: nowrap;
  }
  
  .debt-notification__message {
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--text-secondary);
  }
  
  .debt-notification__details {
    background-color: var(--bg-tertiary);
    border-radius: var(--border-radius-sm);
    padding: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
  }
  
  .debt-notification__row {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--spacing-xs);
  }
  
  .debt-notification__row:last-child {
    margin-bottom: 0;
  }
  
  .debt-notification__label {
    color: var(--text-secondary);
    font-size: 0.9em;
  }
  
  .debt-notification__value {
    font-weight: 500;
  }
  
  .debt-notification__debt-amount {
    color: var(--color-warning);
  }
  
  .debt-notification__actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-sm);
  }
  </style>
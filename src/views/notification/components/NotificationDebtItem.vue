<!-- src/views/notification/components/NotificationDebtItem.vue -->
<template>
  <div class="notification-wrapper">
    <div
      class="notification-swipe-actions notification-swipe-actions--left"
      :class="{ 'notification-swipe-actions--visible': swipeDirection === 'left' }"
    >
      <div class="swipe-action swipe-action--accept" @click.stop="accept">
        <IconCheck size="20" />
        <span>Accept</span>
      </div>
    </div>
    
    <div
      class="notification-swipe-actions notification-swipe-actions--right"
      :class="{ 'notification-swipe-actions--visible': swipeDirection === 'right' }"
    >
      <div class="swipe-action swipe-action--decline" @click.stop="decline">
        <IconX size="20" />
        <span>Decline</span>
      </div>
    </div>
  
    <div 
      class="notification" 
      :class="{ 
        'notification--read': read,
        'swiping': isSwiping,
        'swipe-left': swipeDirection === 'left',
        'swipe-right': swipeDirection === 'right'
      }"
      :style="swipeStyle"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <div class="icon-big">
        <BaseIconComponent 
          :icon="IconCash" 
          size="38" 
          background="var(--maincolor-colorsucces, #53b794)" 
          color="white"
          borderRadius="50%"
        />
      </div>
      <div class="note-debt">
        <div class="text">
          <BaseTitle :text="`New debt from ${createdBy}`" />
          <BaseDescription :text="`Notes: ${transactionName}. ${message}`" />
          <div class="debt-amount">{{ formattedDebtAmount }}</div>
          <div class="debt-time">{{ formattedTime }}</div>
        </div>
        <ExpressAction 
          declineText="Decline"
          viewText="View"
          acceptText="Accept"
          @decline="decline"
          @view="view"
          @accept="accept"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { IconCash, IconCheck, IconX } from '@tabler/icons-vue';
import BaseIconComponent from '@/components/atoms/icons/BaseIconComponent.vue';
import BaseTitle from '@/components/atoms/typography/BaseTitle.vue';
import BaseDescription from '@/components/atoms/typography/BaseDescription.vue';
import ExpressAction from '@/components/molecules/actions/ExpressAction.vue';
import { useSwipe } from '@/composables/useSwipe';

export default defineComponent({
  name: 'NotificationDebtItem',
  components: {
    BaseIconComponent,
    BaseTitle,
    BaseDescription,
    ExpressAction,
    IconCheck,
    IconX
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
    // Format time display
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
    
    // Use our swipe composable
    const { 
      isSwiping, 
      swipeDirection, 
      swipeStyle, 
      onTouchStart, 
      onTouchMove, 
      onTouchEnd 
    } = useSwipe({
      threshold: 70,
      maxSwipe: 120,
      onLeftSwipe: accept,   // Left swipe to accept debt
      onRightSwipe: decline  // Right swipe to decline debt
    });
    
    return {
      IconCash,
      formattedTime,
      formattedAmount,
      formattedDebtAmount,
      view,
      decline,
      accept,
      isSwiping,
      swipeDirection,
      swipeStyle,
      onTouchStart,
      onTouchMove,
      onTouchEnd
    };
  }
});
</script>

<style scoped>
.notification-wrapper {
  position: relative;
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
  border-radius: 32px;
}

.notification,
.notification * {
  box-sizing: border-box;
}

.notification {
  background: var(--text-textsubheader, #444444);
  border-radius: 32px;
  padding: 8px 12px 8px 12px;
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  will-change: transform;
}

.notification--read {
  opacity: 0.7;
}

.note-debt {
  padding: 4px 8px 4px 0px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  align-items: flex-start;
  justify-content: center;
  flex: 1;
  position: relative;
  overflow: hidden;
}

.text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.debt-amount {
  font-size: 14px;
  font-weight: 500;
  color: var(--maincolor-colorsucces, #53b794);
  margin-top: 4px;
}

.debt-time {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}

/* Swipe states */
.notification.swiping {
  transition: none;
}

.notification:not(.swiping) {
  transition: transform 0.3s ease;
}

.notification.swipe-left {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

.notification.swipe-right {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}

/* Swipe action buttons */
.notification-swipe-actions {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.notification-swipe-actions--left {
  left: 0;
  padding-left: 16px;
}

.notification-swipe-actions--right {
  right: 0;
  padding-right: 16px;
}

.notification-swipe-actions--visible {
  opacity: 1;
}

.swipe-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: white;
  font-size: 10px;
}

.swipe-action--accept {
  color: var(--maincolor-colorsucces, #53b794);
}

.swipe-action--decline {
  color: var(--maincolor-colorwarrning, #a44942);
}
</style>
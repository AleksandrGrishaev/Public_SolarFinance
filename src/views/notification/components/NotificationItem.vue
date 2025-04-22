<!-- src/views/notification/components/NotificationItem.vue -->
<template>
  <div class="notification-wrapper">
    <div
      class="notification-swipe-actions notification-swipe-actions--left"
      :class="{ 'notification-swipe-actions--visible': swipeDirection === 'left' }"
    >
      <div class="swipe-action swipe-action--read" @click.stop="handleMarkAsRead">
        <IconCheck size="20" />
        <span>Read</span>
      </div>
    </div>
    
    <div
      class="notification-swipe-actions notification-swipe-actions--right"
      :class="{ 'notification-swipe-actions--visible': swipeDirection === 'right' }"
    >
      <div class="swipe-action swipe-action--delete" @click.stop="handleDelete">
        <IconTrash size="20" />
        <span>Delete</span>
      </div>
    </div>
    
    <div 
      ref="swipeEl"
      class="transaction" 
      :class="{ 
        'transaction--read': read, 
        'swiping': isSwiping,
        'swipe-left': swipeDirection === 'left',
        'swipe-right': swipeDirection === 'right'
      }" 
      :style="swipeStyle"
      @click="handleAction"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <div class="icon-big">
        <BaseIconComponent 
          :icon="getIconComponent()" 
          size="38" 
          :background="getIconBackground()" 
          color="white"
          borderRadius="19px"
        />
      </div>
      <div class="name-info">
        <BaseTitle :text="title" />
        <BaseDescription :text="message" />
        <div class="time-info">{{ formattedTime }}</div>
      </div>
      <div v-if="action && action.text" class="action-indicator">
        <IconChevronRight size="16" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { IconInfoCircle, IconBell, IconCash, IconDiscount, IconCheck, IconTrash, IconChevronRight } from '@tabler/icons-vue';
import BaseIconComponent from '@/components/atoms/icons/BaseIconComponent.vue';
import BaseTitle from '@/components/atoms/typography/BaseTitle.vue';
import BaseDescription from '@/components/atoms/typography/BaseDescription.vue';
import { NotificationSubtype } from '@/stores/notification/types';
import { useSwipe } from '@/composables/useSwipe';
import { useAlerts } from '@/stores/alert/alertService';

export default defineComponent({
  name: 'NotificationItem',
  components: {
    BaseIconComponent,
    BaseTitle,
    BaseDescription,
    IconCheck,
    IconTrash,
    IconChevronRight
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
  emits: ['action', 'read', 'delete'],
  setup(props, { emit }) {
    const alerts = useAlerts();
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
    
    const handleMarkAsRead = () => {
      if (!props.read) {
        emit('read', props.id);
        
        // Show confirmation alert
        alerts.info(`Notification marked as read`, {
          duration: 2000
        });
      }
    };
    
    const handleDelete = () => {
      emit('delete', props.id);
      
      // Show confirmation alert
      alerts.info(`Notification removed`, {
        duration: 2000
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
      onLeftSwipe: handleMarkAsRead,
      onRightSwipe: handleDelete
    });
    
    // Get appropriate icon component based on notification type
    const getIconComponent = () => {
      switch (props.iconType) {
        case NotificationSubtype.INFO:
          return IconInfoCircle;
        case NotificationSubtype.PROMO:
          return IconDiscount;
        case NotificationSubtype.DEBT:
          return IconCash;
        default:
          return IconBell;
      }
    };
    
    // Get appropriate icon background color based on notification type
    const getIconBackground = () => {
      switch (props.iconType) {
        case NotificationSubtype.INFO:
          return 'var(--maincolor-colorsucces)';
        case NotificationSubtype.PROMO:
          return 'var(--maincolor-colorpromo, purple)';
        case NotificationSubtype.DEBT:
          return 'var(--maincolor-colorwarrning)';
        default:
          return 'var(--maincolor-colorsucces)';
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
        
        // Show relevant alert based on action type
        if (props.action.text === 'Dismiss') {
          alerts.info(`Notification dismissed`, {
            duration: 2000
          });
        } else {
          alerts.success(`${props.action.text} action completed`, {
            duration: 2000
          });
        }
      }
    };
    
    return {
      hasAction,
      actionText,
      formattedTime,
      getIconComponent,
      getIconBackground,
      handleAction,
      isSwiping,
      swipeDirection,
      swipeStyle,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      handleMarkAsRead,
      handleDelete
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

.transaction,
.transaction * {
  box-sizing: border-box;
}

.transaction {
  padding: 8px 16px 8px 12px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  background: var(--text-textsubheader, #444444);
  border-radius: 32px;
  cursor: pointer;
  z-index: 1;
  will-change: transform;
}

.transaction:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.transaction--read {
  opacity: 0.7;
}

.name-info {
  padding: 8px 8px 8px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  justify-content: flex-start;
  flex: 1;
  position: relative;
  overflow: hidden;
}

.time-info {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}

/* Action indicator arrow */
.action-indicator {
  color: var(--maincolor-colorsucces, #53b794);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Swipe states */
.transaction.swiping {
  transition: none;
}

.transaction:not(.swiping) {
  transition: transform 0.3s ease;
}

.transaction.swipe-left {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

.transaction.swipe-right {
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

.swipe-action--read {
  color: var(--maincolor-colorsucces, #53b794);
}

.swipe-action--delete {
  color: var(--maincolor-colorwarrning, #a44942);
}
</style>
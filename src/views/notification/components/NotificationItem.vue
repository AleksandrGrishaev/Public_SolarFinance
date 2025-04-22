<!-- src/views/notification/components/NotificationItem.vue -->
<template>
  <div class="transaction" :class="{ 'transaction--read': read }" @click="handleAction">
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
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { IconInfoCircle, IconBell, IconCash, IconDiscount } from '@tabler/icons-vue';
import BaseIconComponent from '@/components/atoms/icons/BaseIconComponent.vue';
import BaseTitle from '@/components/atoms/typography/BaseTitle.vue';
import BaseDescription from '@/components/atoms/typography/BaseDescription.vue';
import { NotificationSubtype } from '@/stores/notification/types';

export default defineComponent({
  name: 'NotificationItem',
  components: {
    BaseIconComponent,
    BaseTitle,
    BaseDescription
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
      }
    };
    
    return {
      hasAction,
      actionText,
      formattedTime,
      getIconComponent,
      getIconBackground,
      handleAction
    };
  }
});
</script>

<style scoped>
.transaction,
.transaction * {
  box-sizing: border-box;
}

.transaction {
  padding: 6px 20px 6px 12px;
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
  margin-bottom: var(--spacing-xs);
  cursor: pointer;
}

.transaction:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.transaction--read {
  opacity: 0.7;
}

.name-info {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  justify-content: flex-start;
  flex: 1;
  position: relative;
  overflow: hidden;
}
</style>
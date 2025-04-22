<!-- src/views/notification/components/NotificationItem.vue -->
<template>
  <div class="transaction" :class="{ 'transaction--read': read }">
    <div class="icon-big">
      <component :is="getIconComponent()" size="24" class="icon-box" />
    </div>
    <div class="name-info">
      <div class="title">{{ title }}</div>
      <div class="about">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { IconInfoCircle, IconBell, IconCash, IconDiscount } from '@tabler/icons-vue';
import { NotificationSubtype } from '@/stores/notification/types';

export default defineComponent({
  name: 'NotificationItem',
  components: {},
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
}

.transaction--read {
  opacity: 0.7;
}

.icon-big {
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.icon-box {
  border-radius: 19px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  position: relative;
  overflow: visible;
  aspect-ratio: 1;
  background-color: var(--maincolor-colorsucces, #53b794);
  color: white;
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

.title {
  color: #ffffff;
  text-align: left;
  font-family: var(--enbody-font-family, "Inter-Regular", sans-serif);
  font-size: var(--enbody-font-size, 16px);
  line-height: var(--enbody-line-height, 20px);
  letter-spacing: var(--enbody-letter-spacing, -0.02em);
  font-weight: var(--enbody-font-weight, 400);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.about {
  color: #ffffff;
  text-align: left;
  font-family: var(--ensmall-font-family, "Inter-Regular", sans-serif);
  font-size: var(--ensmall-font-size, 12px);
  line-height: var(--ensmall-line-height, 16px);
  font-weight: var(--ensmall-font-weight, 400);
  position: relative;
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>
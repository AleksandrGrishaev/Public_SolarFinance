<!-- src/views/notification/components/NotificationDebtItem.vue -->
<template>
  <div class="notification" :class="{ 'notification--read': read }">
    <div class="icon-big">
      <component :is="IconCash" size="24" class="icon-box" />
    </div>
    <div class="note-debt">
      <div class="text">
        <div class="title">New debt from {{ createdBy }}</div>
        <div class="about">
          Notes: {{ transactionName }}. {{ message }}
        </div>
      </div>
      <div class="express-action">
        <div class="button-line">
          <div class="decline" @click="decline">
            <div class="declire">Decline</div>
          </div>
          <div class="view" @click="view">
            <div class="declire2">View</div>
          </div>
          <div class="accept" @click="accept">
            <div class="acccept">Accept</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { IconCash } from '@tabler/icons-vue';

export default defineComponent({
  name: 'NotificationDebtItem',
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
}

.notification--read {
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

.express-action {
  padding: 0px 8px 0px 0px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  height: 20px;
  position: relative;
}

.button-line {
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.decline {
  border-radius: 34px;
  border-style: dashed;
  border-color: var(--maincolor-colorwarrning, #a44942);
  border-width: 1px;
  padding: 4px 8px 4px 8px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
}

.declire {
  color: var(--maincolor-colorwarrning, #a44942);
  text-align: left;
  font-family: var(--ensupersmall-font-family, "Inter-Regular", sans-serif);
  font-size: var(--ensupersmall-font-size, 10px);
  line-height: var(--ensupersmall-line-height, 12px);
  font-weight: var(--ensupersmall-font-weight, 400);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.view {
  background: var(--maincolor-colorneutral, #dbdadd);
  border-radius: 34px;
  padding: 4px 8px 4px 8px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
}

.declire2 {
  color: var(--text-textgrey, #949496);
  text-align: left;
  font-family: var(--ensupersmall-font-family, "Inter-Regular", sans-serif);
  font-size: var(--ensupersmall-font-size, 10px);
  line-height: var(--ensupersmall-line-height, 12px);
  font-weight: var(--ensupersmall-font-weight, 400);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.accept {
  background: var(--maincolor-colorsucces, #53b794);
  border-radius: 34px;
  padding: 4px 8px 4px 8px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
}

.acccept {
  color: var(--text-textcontrast, #ffffff);
  text-align: left;
  font-family: var(--ensupersmall-font-family, "Inter-Regular", sans-serif);
  font-size: var(--ensupersmall-font-size, 10px);
  line-height: var(--ensupersmall-line-height, 12px);
  font-weight: var(--ensupersmall-font-weight, 400);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>
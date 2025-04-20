<!-- src/components/ui/views/BaseTransactionItem.vue -->
<template>
  <div 
    class="base-transaction-item"
    :class="{ 
      'with-border': withBorder,
      'is-clickable': isClickable,
      [customClass]: customClass
    }"
    @click="handleClick"
  >
    <!-- Transaction container with rounded corners -->
    <div class="transaction-container">
      <!-- Left part with icon -->
      <div class="item-icon">
        <slot name="icon">
          <div class="icon-wrapper" :style="iconStyle">
            <slot name="icon-content">
              <!-- Category icon (if provided) -->
              <component 
                v-if="resolvedCategoryIcon" 
                :is="resolvedCategoryIcon" 
                :size="iconSize" 
                :stroke="1.5"
                :color="iconTextColor" 
                class="category-icon"
              />
              <!-- Standard icon (if provided) -->
              <component 
                v-else-if="resolvedIcon" 
                :is="resolvedIcon" 
                :size="iconSize" 
                :stroke="1.5"
                :color="iconTextColor" 
              />
              <!-- Initials (if no icons) -->
              <span v-else-if="initials" class="icon-placeholder">{{ initials }}</span>
            </slot>
          </div>
        </slot>
      </div>
      
      <!-- Main content area with title, description and amount -->
      <div class="transaction-content">
        <!-- Center part with name and description -->
        <div class="content-top-line">
          <div class="item-name">
            <slot name="content">
              <div class="item-title" v-if="title">{{ title }}</div>
              <div class="item-description" v-if="description">{{ description }}</div>
            </slot>
          </div>
          
          <!-- Right part with amount -->
          <div class="item-money">
            <slot name="amount">
              <div class="amount-wrapper">
                <div class="amount" :class="amountColorClass" v-if="amount !== undefined">
                  {{ formattedAmount }}
                </div>
              </div>
            </slot>
          </div>
        </div>
        
        <!-- Bottom line with subtitle and info -->
        <div class="content-bottom-line">
          <div class="item-owner">
            <span class="owner-text" v-if="subtitle">{{ subtitle }}</span>
          </div>
          
          <div class="item-account">
            <span class="account-text" v-if="info">{{ info }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import * as TablerIcons from '@tabler/icons-vue';

// Type definitions
interface ItemClickEvent {
  item: any;
  event: MouseEvent;
}

const props = defineProps({
  // Main content
  item: {
    type: Object,
    default: () => ({})
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  info: {
    type: String,
    default: ''
  },
  
  // Financial data
  amount: {
    type: Number,
    default: undefined
  },
  currency: {
    type: String,
    default: ''
  },
  amountPrefix: {
    type: String,
    default: ''
  },
  amountSuffix: {
    type: String,
    default: ''
  },
  
  // Icon
  icon: {
    type: [Object, Function, String],
    default: null
  },
  iconColor: {
    type: String,
    default: ''
  },
  iconSize: {
    type: Number,
    default: 20
  },
  initials: {
    type: String,
    default: ''
  },
  
  // Category properties
  categoryIcon: {
    type: [Object, Function, String],
    default: null
  },
  categoryColor: {
    type: String,
    default: ''
  },
  
  // Type and style
  type: {
    type: String,
    default: '' // 'income', 'expense', 'transfer'
  },
  amountType: {
    type: String,
    default: '' // 'positive', 'negative', 'neutral'
  },
  withBorder: {
    type: Boolean,
    default: false
  },
  isClickable: {
    type: Boolean,
    default: true
  },
  customClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['click']);

// Resolve Tabler icons
const resolvedCategoryIcon = computed(() => {
  if (!props.categoryIcon) return null;
  
  // If an object or function is passed, use as is
  if (typeof props.categoryIcon !== 'string') {
    return props.categoryIcon;
  }
  
  // Check if string is a Tabler icon name (e.g. 'IconCar')
  if (props.categoryIcon.startsWith('Icon') && TablerIcons[props.categoryIcon]) {
    return TablerIcons[props.categoryIcon];
  }
  
  return null;
});

// Same for standard icon
const resolvedIcon = computed(() => {
  if (!props.icon) return null;
  
  // If an object or function is passed, use as is
  if (typeof props.icon !== 'string') {
    return props.icon;
  }
  
  // Check if string is a Tabler icon name (e.g. 'IconCar')
  if (props.icon.startsWith('Icon') && TablerIcons[props.icon]) {
    return TablerIcons[props.icon];
  }
  
  return null;
});

// Icon style
const iconStyle = computed(() => {
  // Priority 1: If category color is set, use it
  if (props.categoryColor) {
    return { backgroundColor: props.categoryColor };
  }
  
  // Priority 2: If specific icon color is set, use it
  if (props.iconColor) {
    return { backgroundColor: props.iconColor };
  }
  
  // Priority 3: Determine color based on type
  if (props.type === 'income' || props.amountType === 'positive') {
    return { backgroundColor: 'var(--color-success)' };
  } 
  else if (props.type === 'expense' || props.amountType === 'negative') {
    return { backgroundColor: 'var(--color-warning)' };
  }
  else if (props.type === 'transfer' || props.amountType === 'neutral') {
    return { backgroundColor: 'var(--text-contrast)' };
  }
  
  // Priority 4: If type is undefined but amount exists
  if (props.amount !== undefined) {
    if (props.amount > 0) {
      return { backgroundColor: 'var(--color-success)' };
    } 
    else if (props.amount < 0) {
      return { backgroundColor: 'var(--color-warning)' };
    }
  }
  
  // Default: use neutral color
  return { backgroundColor: '#D9D9D9' };
});

// Icon text color
const iconTextColor = computed(() => {
  // For transfers, use dark text on light background
  if (props.type === 'transfer' || props.amountType === 'neutral') {
    return 'var(--bg-main)';
  }
  
  // For others use white text
  return 'var(--text-contrast)';
});

// Amount color class
const amountColorClass = computed(() => {
  // If specific type is set, use it
  if (props.amountType === 'positive') {
    return 'color-success';
  } 
  else if (props.amountType === 'negative') {
    return 'color-warning';
  }
  else if (props.amountType === 'neutral') {
    return '';
  }
  
  // By transaction type
  if (props.type === 'income') {
    return 'color-success';
  } 
  else if (props.type === 'expense') {
    return 'color-warning';
  }
  
  // By amount value
  if (props.amount !== undefined) {
    if (props.amount > 0) {
      return 'color-success';
    } 
    else if (props.amount < 0) {
      return 'color-warning';
    }
  }
  
  // Default: no special class
  return '';
});

// Formatted amount with currency symbol
const formattedAmount = computed(() => {
  if (props.amount === undefined) {
    return '';
  }
  
  const isNegative = props.amount < 0;
  const absAmount = Math.abs(props.amount);
  const prefix = props.amountPrefix || '';
  const suffix = props.amountSuffix || '';
  
  // Get currency symbol or use passed one
  let currencySymbol = '';
  
  // Determine currency symbol
  if (props.currency) {
    if (props.currency === 'IDR' || props.currency === 'Rp') {
      currencySymbol = 'Rp ';
    } else if (props.currency === 'USD') {
      currencySymbol = '$ ';
    } else if (props.currency === 'RUB') {
      currencySymbol = '₽ ';
    } else {
      currencySymbol = `${props.currency} `;
    }
  }
  
  // Format with thousands separators
  // For negative values, minus should go before currency symbol with 4px spacing
  return isNegative
    ? `${prefix}- ${currencySymbol}${absAmount.toLocaleString()}${suffix}`
    : `${prefix}${currencySymbol}${absAmount.toLocaleString()}${suffix}`;
});

// Click handler
const handleClick = (event) => {
  if (!props.isClickable) return;
  
  emit('click', {
    item: props.item,
    event: event
  });
};
</script>

<style scoped>
.base-transaction-item {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  margin-bottom: 10px;
  margin: 0;
}

.transaction-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 6px 20px 6px 10px;
  width: 100%;
  /* Remove max-width to be responsive to parent container */
  height: 68px;
  background: #444444;
  border-radius: 32px;
  gap: 10px;
  box-sizing: border-box;
}

.item-icon {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 37px;
  height: 53px;
}

.icon-wrapper {
  width: 37px;
  height: 37px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background: #D9D9D9;
}

.icon-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-contrast);
}

.transaction-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 0;
  gap: 4px;
  width: 297px;
  height: 56px;
}

.content-top-line {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px 4px 0px 0px;
  gap: 10px;
  width: 100%;
  height: 36px;
}

.item-name {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px 10px;
  gap: 2px;
  flex: 1;
  height: 34px;
}

.item-title {
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 20px;
  display: flex;
  align-items: center;
  letter-spacing: -0.02em;
  color: #FFFFFF;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-description {
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 10px;
  line-height: 12px;
  display: flex;
  align-items: center;
  color: #949496;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-money {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  padding: 8px 0px;
  gap: 2px;
  flex: 1;
  height: 36px;
}

.amount-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 2px;
}

.amount {
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 20px;
  display: flex;
  align-items: center;
  letter-spacing: -0.02em;
  color: #FFFFFF;
  white-space: nowrap;
}

.color-warning {
  color: #A44942;
}

.color-success {
  color: var(--color-success);
}

.content-bottom-line {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px 4px 0px 0px;
  gap: 10px;
  width: 100%;
  height: 16px;
}

.item-owner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px 10px;
  gap: 2px;
  width: 199px;
  height: 16px;
}

.owner-text {
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  display: flex;
  align-items: center;
  color: #FFFFFF;
}

.item-account {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  padding: 0px;
  gap: 2px;
  height: 16px;
}

.account-text {
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  display: flex;
  align-items: center;
  text-align: right;
  color: #FFFFFF;
}

/* We can keep these utility classes from the original as they might be used elsewhere */
.is-clickable {
  cursor: pointer;
}

.is-clickable:active {
  opacity: 0.9;
}

.with-border {
  /* We'll remove the default border since we have a contained design now */
  border-bottom: none;
}
</style>
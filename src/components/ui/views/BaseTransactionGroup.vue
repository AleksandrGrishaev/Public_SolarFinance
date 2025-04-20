<!-- src/components/ui/views/BaseTransactionGroup.vue -->
<template>
  <div class="base-transaction-group">
    <!-- Group header with date or other information -->
    <div class="group-header">
      <slot name="header">
        <div class="group-title">{{ title }}</div>
        <div class="group-amount" :class="amountClass">
          {{ formattedAmount }}
        </div>
      </slot>
    </div>
    
    <!-- Container for the list of items -->
    <div class="group-content" :class="{ 'custom-content': $slots.default }">
      <slot>
        <!-- If there are no child elements, show placeholder or empty state -->
        <div class="empty-state" v-if="showEmptyState">
          <slot name="empty">
            <div class="empty-message">{{ emptyMessage }}</div>
          </slot>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  // Basic group information
  title: {
    type: String,
    default: ''
  },
  
  // Amount data
  amount: {
    type: Number,
    default: 0
  },
  amountType: {
    type: String,
    default: '' // 'positive', 'negative', 'neutral'
  },
  currency: {
    type: String,
    default: ''
  },
  
  // Additional options
  showEmptyState: {
    type: Boolean,
    default: false
  },
  emptyMessage: {
    type: String,
    default: 'No items to display'
  },
  
  // Formatting
  amountFormatter: {
    type: Function,
    default: null
  },
  
  // Styles
  headerClass: {
    type: String,
    default: ''
  },
  contentClass: {
    type: String,
    default: ''
  }
});

// Determine the class for the amount (positive/negative)
const amountClass = computed(() => {
  // If amount type is set, use it
  if (props.amountType === 'positive') {
    return 'color-success';
  } 
  else if (props.amountType === 'negative') {
    return 'color-warning';
  }
  
  // Otherwise determine by value
  if (props.amount > 0) {
    return 'color-success';
  } 
  else if (props.amount < 0) {
    return 'color-warning';
  }
  
  return ''; // Neutral color
});

// Format the amount with currency symbol
const formattedAmount = computed(() => {
    // Use custom formatter if provided
    if (typeof props.amountFormatter === 'function') {
      return props.amountFormatter(props.amount, props.currency);
    }
    
    // Standard formatting
    const isNegative = props.amount < 0;
    const absAmount = Math.abs(props.amount);
    
    // Determine currency symbol
    let currencySymbol = '';
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
    
    // For negative values, minus should go before the currency symbol with 4px spacing
    return isNegative
      ? `- ${currencySymbol}${absAmount.toLocaleString()}`
      : `${currencySymbol}${absAmount.toLocaleString()}`;
  });
</script>

<style scoped>
.base-transaction-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: var(--spacing-sm);
}

.group-header {
  width: 100%;
  padding: 0 var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-title {
  padding: var(--spacing-sm);
  color: var(--text-header);
  font-size: var(--font-small-size);
  font-weight: var(--font-small-weight);
  line-height: var(--font-small-line-height);
}

.group-amount {
  padding: var(--spacing-sm);
  color: var(--text-header);
  display: flex;
  align-items: center;
  gap: 3px;
  text-align: right;
  min-width: 120px;
  justify-content: flex-end;
  font-size: var(--font-small-size);
  font-weight: var(--font-heading-weight);
  line-height: var(--font-small-line-height);
}

.group-content {
  width: 100%;
  background: var(--bg-dropdown);
  border-radius: var(--border-radius-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden; /* To maintain rounded corners */
  margin: 0;
  padding: var(--spacing-xs);
  gap: var(--spacing-xs); /* Gap between transaction items */
}

/* Add subtle dividers using ::v-deep to target child components */
.group-content :deep(> *:not(:last-child)) {
  position: relative;
}

.group-content :deep(> *:not(:last-child))::after {
  content: "";
  position: absolute;
  bottom: calc(var(--spacing-xs) * -1); /* Position it at the bottom with offset for gap */
  left: var(--spacing-md);
  right: var(--spacing-md);
  height: 1px;
  background-color: rgba(255, 255, 255, 0.06); /* Very subtle light color */
  z-index: 1;
}

.custom-content {
  /* Custom content may have its own styles */
}

.empty-state {
  padding: var(--spacing-lg);
  display: flex;
  justify-content: center;
  align-items: center;
}

.empty-message {
  color: var(--text-inactive);
  font-size: var(--font-small-size);
  text-align: center;
}

/* Styles for color highlighting of amounts */
.color-success {
  color: var(--color-success);
}

.color-warning {
  color: var(--color-warning);
}
</style>
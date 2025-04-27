<template>
    <div class="transaction-item" @click="$emit('click', transaction)">
      <div class="transaction-icon" :style="iconStyle">
        <span v-if="categoryIcon" class="category-icon">
          <component :is="categoryIcon" :size="18" />
        </span>
        <span v-else class="icon-text">{{ getCategoryInitials() }}</span>
      </div>
      
      <div class="transaction-content">
        <div class="transaction-title">{{ transaction.description || 'Transaction' }}</div>
        <div class="transaction-subtitle">{{ getTransactionSubtitle() }}</div>
      </div>
      
      <div class="transaction-amount" :class="valueClass">
        {{ formatAmount() }}
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import { format } from 'date-fns';
  import { 
  IconCash, 
  IconReceipt, 
  IconHome, 
  IconBus, 
  IconHeartFilled,
  IconSchool,
  IconMovie,
  IconShoppingCart,
  IconCreditCard,
  IconCurrencyDollar,
  IconArrowsExchange, 
  IconSettings 
} from '@tabler/icons-vue';
  import { useDebts } from '../composables/useDebts';
  
  const props = defineProps({
    transaction: {
      type: Object,
      required: true
    }
  });
  
  const emit = defineEmits(['click']);
  
  // Use the debts composable
  const { formatCurrency } = useDebts();
  
  // Map category IDs to icons
  const categoryIcons = {
    'main_job': IconCash,
    'salary': IconCash,
    'freelance': IconCurrencyDollar,
    'investment': IconCreditCard,
    'groceries': IconShoppingCart,
    'restaurants': IconReceipt,
    'transport': IconBus,
    'utilities': IconHome,
    'health': IconHeartFilled,
    'education': IconSchool,
    'entertainment': IconMovie,
    'transfer': IconArrowsExchange,
    'debt_payment': IconCreditCard,
    'adjustment': IconSettings
  };
  
  // Computed properties
  const categoryIcon = computed(() => {
    return props.transaction.categoryId 
      ? categoryIcons[props.transaction.categoryId] 
      : null;
  });
  
  const valueClass = computed(() => {
    return {
      'positive': props.transaction.amount > 0,
      'negative': props.transaction.amount < 0
    };
  });
  
  const iconStyle = computed(() => {
    return {
      backgroundColor: getCategoryColor()
    };
  });
  
  // Helper methods
  const getCategoryColor = () => {
    // Map of category IDs to colors
    const categoryColors = {
      'main_job': '#4CAF50',     // Green
      'salary': '#4CAF50',       // Green
      'freelance': '#2196F3',    // Blue
      'investment': '#9C27B0',   // Purple
      'groceries': '#FF9800',    // Orange
      'restaurants': '#FF5722',  // Deep Orange
      'transport': '#795548',    // Brown
      'utilities': '#607D8B',    // Blue Grey
      'health': '#E91E63',       // Pink
      'education': '#3F51B5',    // Indigo
      'entertainment': '#673AB7', // Deep Purple
      'transfer': '#2196F3',     // Blue
      'debt_payment': '#FF5722', // Deep Orange
      'adjustment': '#9E9E9E'    // Grey
    };
    
    return props.transaction.categoryId 
      ? categoryColors[props.transaction.categoryId] || 'var(--bg-light)'
      : 'var(--bg-light)';
  };
  
  const getCategoryInitials = () => {
    if (props.transaction.categoryId) {
      const words = props.transaction.categoryId.split('_');
      if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
      }
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    
    // Fallback based on transaction type
    switch (props.transaction.type) {
      case 'income': return 'IN';
      case 'expense': return 'EX';
      case 'transfer': return 'TR';
      default: return 'TX';
    }
  };
  
  const getTransactionSubtitle = () => {
    // Combine relevant information for subtitle
    const parts = [];
    
    // Add source or destination info
    if (props.transaction.sourceEntityType && props.transaction.sourceEntityId) {
      parts.push(`From: ${props.transaction.sourceEntityId}`);
    }
    
    if (props.transaction.destinationEntityType && props.transaction.destinationEntityId) {
      parts.push(`To: ${props.transaction.destinationEntityId}`);
    }
    
    // Add time if available
    if (props.transaction.date) {
      const date = new Date(props.transaction.date);
      if (date instanceof Date && !isNaN(date.getTime())) {
        parts.push(format(date, 'HH:mm'));
      }
    }
    
    return parts.join(' · ');
  };
  
  const formatAmount = () => {
    return formatCurrency(props.transaction.amount, props.transaction.currency);
  };
  </script>
  
  <style scoped>
  .transaction-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    gap: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .transaction-item:last-child {
    border-bottom: none;
  }
  
  .transaction-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .transaction-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-contrast);
    font-weight: bold;
    flex-shrink: 0;
  }
  
  .icon-text {
    font-size: 14px;
  }
  
  .category-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .transaction-content {
    flex: 1;
    min-width: 0;
  }
  
  .transaction-title {
    font-size: var(--font-body-size);
    font-weight: 500;
    color: var(--text-usual);
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .transaction-subtitle {
    font-size: var(--font-small-size);
    color: var(--text-grey);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .transaction-amount {
    font-size: var(--font-body-size);
    font-weight: 600;
    white-space: nowrap;
  }
  
  .transaction-amount.positive {
    color: var(--maincolor-colorsucces);
  }
  
  .transaction-amount.negative {
    color: var(--maincolor-colorwarrning);
  }
  </style>
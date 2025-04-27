<template>
    <div class="debt-header">
      <div class="debt-header-content">
        <div class="debt-title-container">
          <h1 class="debt-title">{{ debt.name }}</h1>
          <div v-if="editable" class="edit-button" @click="$emit('edit')">
            <IconEdit :size="18" />
          </div>
        </div>
        
        <div class="debt-subtitle" v-if="debt.subtitle">
          {{ debt.subtitle }}
        </div>
        
        <div class="amount-display">
          <div 
            class="amount-value" 
            :class="{'negative': !isDebtOwed(debt), 'positive': isDebtOwed(debt)}"
          >
            {{ formatDebtAmount(debt) }}
          </div>
          
          <!-- Converted amount (if currency differs from user's base currency) -->
          <div class="amount-converted" v-if="showConvertedAmount">
            {{ formatAmountInUserCurrency(debt) }}
          </div>
          
          <!-- Original amount (if different from remaining) -->
          <div class="amount-original" v-if="showOriginalAmount">
            from {{ formatCurrency(debt.amount, debt.currency) }}
          </div>
        </div>
        
        <!-- Debt status indicator -->
        <div class="debt-status-container">
          <div class="debt-status" :class="`status-${debt.status}`">
            {{ formatStatus(debt.status) }}
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import { IconEdit } from '@tabler/icons-vue';
  import { useDebts } from '../composables/useDebts';
  
  const props = defineProps({
    debt: {
      type: Object,
      required: true
    },
    editable: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['edit']);
  
  // Use the useDebts composable to get necessary functions
  const { 
    isDebtOwed, 
    formatDebtAmount, 
    formatAmountInUserCurrency, 
    formatCurrency, 
    userBaseCurrency 
  } = useDebts();
  
  // Determine if we should show converted amount
  const showConvertedAmount = computed(() => {
    return props.debt.currency !== userBaseCurrency.value;
  });
  
  // Determine if we should show original amount
  const showOriginalAmount = computed(() => {
    return props.debt.amount !== props.debt.remainingAmount;
  });
  
  // Format status text
  const formatStatus = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'partially_paid': return 'Partially Paid';
      case 'paid': return 'Paid';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };
  </script>
  
  <style scoped>
  .debt-header {
    background-color: var(--bg-field-dark);
    border-radius: 32px;
    padding: 20px;
    margin-bottom: 16px;
  }
  
  .debt-header-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .debt-title-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 4px;
    width: 100%;
  }
  
  .debt-title {
    font-size: var(--font-heading-size);
    font-weight: var(--font-heading-weight);
    color: var(--text-header);
    margin: 0;
    text-align: center;
  }
  
  .edit-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    color: var(--text-grey);
    transition: all 0.2s ease;
  }
  
  .edit-button:hover {
    background-color: var(--bg-light);
    color: var(--text-usual);
  }
  
  .debt-subtitle {
    font-size: var(--font-small-size);
    color: var(--text-grey);
    margin-bottom: 16px;
    text-align: center;
  }
  
  .amount-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 16px 0;
  }
  
  .amount-value {
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 4px;
  }
  
  .amount-value.negative {
    color: var(--maincolor-colorwarrning);
  }
  
  .amount-value.positive {
    color: var(--maincolor-colorsucces);
  }
  
  .amount-converted {
    font-size: var(--font-body-size);
    margin-bottom: 4px;
    color: var(--text-usual);
    opacity: 0.9;
  }
  
  .amount-original {
    font-size: var(--font-small-size);
    color: var(--text-grey);
  }
  
  .debt-status-container {
    display: flex;
    justify-content: center;
    margin-top: 16px;
  }
  
  .debt-status {
    padding: 6px 12px;
    border-radius: 20px;
    background-color: var(--bg-light);
    font-size: var(--font-small-size);
    font-weight: 500;
  }
  
  .status-active {
    color: var(--maincolor-colorsucces);
  }
  
  .status-partially_paid {
    color: var(--color-primary);
  }
  
  .status-paid {
    color: var(--text-grey);
  }
  
  .status-cancelled {
    color: var(--maincolor-colorwarrning);
  }
  </style>
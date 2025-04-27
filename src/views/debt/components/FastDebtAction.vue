<template>
    <div class="fast-debt-action" v-if="showPaymentOption">
      <div class="action-content">
        <div class="action-title">Quick Payment</div>
        
        <div class="payment-info">
          <div class="remaining-amount">
            <span class="remaining-label">Remaining:</span>
            <span class="remaining-value" :class="{'negative': !isDebtOwed(debt)}">
              {{ formatDebtAmount(debt) }}
            </span>
          </div>
          
          <button 
            class="payment-button" 
            :class="{'disabled': debt.status === 'paid'}"
            @click="handlePay"
            :disabled="debt.status === 'paid'"
          >
            Pay Debt
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import { useDebts } from '../composables/useDebts';
  
  const props = defineProps({
    debt: {
      type: Object,
      required: true
    }
  });
  
  const emit = defineEmits(['pay']);
  
  // Use the debts composable
  const { isDebtOwed, formatDebtAmount } = useDebts();
  
  // Determine if we should show the payment option
  const showPaymentOption = computed(() => {
    // Only show payment options for active or partially paid debts
    return ['active', 'partially_paid'].includes(props.debt.status);
  });
  
  // Handle pay button click
  const handlePay = () => {
    if (showPaymentOption.value) {
      emit('pay');
    }
  };
  </script>
  
  <style scoped>
  .fast-debt-action {
    background-color: var(--bg-field-dark);
    border-radius: 32px;
    padding: 16px 20px;
    margin-bottom: 16px;
  }
  
  .action-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .action-title {
    font-size: var(--font-subheading-size);
    font-weight: var(--font-subheading-weight);
    color: var(--text-header);
  }
  
  .payment-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .remaining-amount {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .remaining-label {
    font-size: var(--font-small-size);
    color: var(--text-grey);
  }
  
  .remaining-value {
    font-size: var(--font-body-size);
    font-weight: 600;
    color: var(--maincolor-colorsucces);
  }
  
  .remaining-value.negative {
    color: var(--maincolor-colorwarrning);
  }
  
  .payment-button {
    background-color: var(--accent-color);
    color: var(--text-contrast);
    border: none;
    border-radius: var(--border-radius-xl);
    padding: 10px 20px;
    font-size: var(--font-button-size);
    font-weight: var(--font-button-weight);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .payment-button:hover {
    filter: brightness(1.1);
  }
  
  .payment-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: var(--bg-light);
  }
  </style>
<!-- src/components/transactions/TransactionDateGroup.vue -->
<template>
    <div class="transaction-date-group">
      <!-- Заголовок даты с суммой -->
      <div class="date-header">
        <div class="date-label">{{ formattedDate }}</div>
        <div class="date-amount" :class="{ 'negative': isNegative }">
          {{ formattedAmount }}
        </div>
      </div>
      
      <!-- Транзакции за дату -->
      <div class="transactions-list">
        <slot></slot>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  
  const props = defineProps({
    date: {
      type: [Date, String],
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'Rp'
    }
  });
  
  // Форматированная дата
  const formattedDate = computed(() => {
    const date = props.date instanceof Date ? props.date : new Date(props.date);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    
    return `${day} ${month}, ${year}`;
  });
  
  // Отрицательная ли сумма
  const isNegative = computed(() => props.totalAmount < 0);
  
  // Форматированная сумма
  const formattedAmount = computed(() => {
    const prefix = isNegative.value ? '-' : '';
    const absAmount = Math.abs(props.totalAmount);
    
    // Форматирование с разделителями тысяч
    return `${prefix}${props.currency} ${absAmount.toLocaleString('id-ID')}`;
  });
  </script>
  
  <style scoped>
  .transaction-date-group {
    width: 100%;
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
    border-radius: 48px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .date-header {
    width: 100%;
    padding: 0 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .date-label {
    padding: 10px;
    color: white;
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
  }
  
  .date-amount {
    padding: 10px;
    color: white;
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    display: flex;
    align-items: center;
    gap: 3px;
  }
  
  .date-amount.negative {
    color: #A44942;
  }
  
  .transactions-list {
    width: 100%;
    background: #444444;
    border-radius: 32px;
    display: flex;
    flex-direction: column;
  }
  </style>
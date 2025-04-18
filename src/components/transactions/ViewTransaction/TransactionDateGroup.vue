<!-- src/components/transactions/ViewTransaction/TransactionDateGroup.vue -->
<template>
  <div class="transaction-date-group">
    <!-- Заголовок даты с суммой -->
    <div class="date-header">
      <div class="date-label en-small">{{ formattedDate }}</div>
      <div class="date-amount en-small" :class="{ 'color-warning': isNegative, 'color-success': !isNegative }">
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
  border-radius: var(--border-radius-xl);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.date-header {
  width: 100%;
  padding: 0 var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-label {
  padding: var(--spacing-sm);
  color: var(--text-header);
}

.date-amount {
  padding: var(--spacing-sm);
  padding-right: var(--spacing-xl);
  color: var(--text-header);
  display: flex;
  align-items: center;
  gap: 3px;
  text-align: right;
  min-width: 120px;
  justify-content: flex-end;
}

.transactions-list {
  width: 100%;
  background: var(--bg-dropdown);
  border-radius: var(--border-radius-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Добавляем, чтобы дочерние элементы не выходили за скругление */
}
</style>
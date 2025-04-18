<!-- src/views/book/page/components/BookTransactionGroup.vue -->
<template>
    <BaseTransactionGroup 
      :title="formatDate(date)" 
      :amount="totalAmount"
      :showEmptyState="transactions.length === 0"
      emptyMessage="No transactions for this date"
    >
      <BookTransactionItem 
        v-for="transaction in transactions" 
        :key="transaction.id" 
        :transaction="transaction"
        @click="$emit('transaction-click', transaction)"
      />
    </BaseTransactionGroup>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import BaseTransactionGroup from '@/components/ui/views/BaseTransactionGroup.vue';
  import BookTransactionItem from './BookTransactionItem.vue';
  
  const props = defineProps({
    date: {
      type: Date,
      required: true
    },
    transactions: {
      type: Array,
      default: () => []
    }
  });
  
  const emit = defineEmits(['transaction-click']);
  
  // Форматирование даты в формате "25 Mar, 2025"
  const formatDate = (date) => {
    if (!date) return '';
    
    const options = { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    };
    
    return new Date(date).toLocaleDateString('en-US', options);
  };
  
  // Вычисление общей суммы транзакций в группе
  const totalAmount = computed(() => {
    return props.transactions.reduce((sum, transaction) => {
      return sum + (transaction.amount || 0);
    }, 0);
  });
  </script>
  
  <style scoped>
  /* Дополнительные стили при необходимости */
  </style>
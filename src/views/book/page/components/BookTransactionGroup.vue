<!-- src/views/book/page/components/BookTransactionGroup.vue -->
<template>
  <BaseTransactionGroup 
    :title="formatDate(date)" 
    :amount="totalAmount"
    :currency="groupCurrency"
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
import { useBookContext } from '../composables/useBookContext';

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

// Получаем контекст книги для доступа к валюте
const { currentBook } = useBookContext();

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

// Получаем валюту для группы транзакций
const groupCurrency = computed(() => {
  // Если есть хотя бы одна транзакция, берем валюту из первой транзакции
  if (props.transactions.length > 0 && props.transactions[0].bookCurrency) {
    return props.transactions[0].bookCurrency;
  }
  
  // Иначе используем валюту текущей книги
  return currentBook.value?.currency || '';
});

// Вычисление общей суммы транзакций в группе с использованием bookAmount
const totalAmount = computed(() => {
  return props.transactions.reduce((sum, transaction) => {
    return sum + (transaction.bookAmount || 0);
  }, 0);
});
</script>

<style scoped>
/* Дополнительные стили при необходимости */
</style>
<template>
  <div class="dashboard-book">
    <BookFinanceSummary />
    <div class="transactions-container">
      <BookTransactionsList @transaction-click="handleTransactionClick" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import BookFinanceSummary from './BookFinanceSummary.vue';
import BookTransactionsList from './BookTransactionsList.vue';
import { useBookContext } from '../composables/useBookContext';

// Используем контекст напрямую вместо props
const { refreshData } = useBookContext();

// Обработчик клика по транзакции
const handleTransactionClick = (transaction) => {
  console.log('Transaction clicked:', transaction);
};

// Инициализация компонента
onMounted(() => {
  // Вызываем refreshData только при монтировании
  refreshData();
});
</script>
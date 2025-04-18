<!-- src/views/book/page/components/DashBoardBook.vue -->
<template>
  <div class="dashboard-book">
    <!-- Финансовая информация (верхнее поле) - передаем ключ для форсированного обновления -->
    <BookFinanceSummary 
      :key="`summary-${bookId}-${lastBookChange}`"
      :bookId="bookId" 
      @update:dateFilter="dateFilter = $event" 
    />
    
    <!-- Список транзакций - передаем ключ для форсированного обновления -->
    <div class="transactions-container">
      <BookTransactionsList 
        :key="`transactions-${bookId}-${lastBookChange}`"
        :bookId="bookId" 
        :dateFilter="dateFilter" 
        @transaction-click="handleTransactionClick" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import BookFinanceSummary from './BookFinanceSummary.vue';
import BookTransactionsList from './BookTransactionsList.vue';
import { useTransactionStore } from '@/stores/transaction';

const props = defineProps({
bookId: {
  type: String,
  required: true
}
});

// Получаем хранилище транзакций
const transactionStore = useTransactionStore();

// Состояние компонента
const dateFilter = ref({
period: 'monthly',
date: new Date(),
dateRange: [
  new Date(new Date().setDate(new Date().getDate() - 7)), 
  new Date()
]
});

// Реактивный трекер последней смены книги для принудительного обновления
const lastBookChange = ref(Date.now());

// Обработчик клика по транзакции
const handleTransactionClick = (transaction) => {
console.log('Transaction clicked:', transaction);
// Здесь можно добавить логику для просмотра деталей транзакции
};

// Обновление данных при изменении фильтра дат
watch(dateFilter, () => {
console.log('[DashBoardBook] Date filter changed, refreshing data');
transactionStore.refreshTransactions();
}, { deep: true });

// Отслеживание изменений bookId - при смене книги сбрасываем к текущему месяцу
watch(() => props.bookId, (newBookId) => {
console.log(`[DashBoardBook] Book ID changed to: ${newBookId}`);

// При смене книги переходим на текущий месяц
dateFilter.value = {
  period: 'monthly',
  date: new Date(),
  dateRange: [
    new Date(new Date().setDate(new Date().getDate() - 7)), 
    new Date()
  ]
};

// Обновляем трекер для принудительного обновления дочерних компонентов
lastBookChange.value = Date.now();

// Принудительно обновляем транзакции
transactionStore.refreshTransactions();
});

// При монтировании компонента обновляем данные
onMounted(() => {
transactionStore.refreshTransactions();
});
</script>

<style scoped>
.dashboard-book {
display: flex;
flex-direction: column;
gap: var(--spacing-md);
}

.transactions-container {
background-color: var(--bg-contrast);
border-radius: var(--border-radius-md);
padding: var(--spacing-md);
}
</style>
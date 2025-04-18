<!-- src/views/book/page/components/DashBoardBook.vue -->
<template>
    <div class="dashboard-book">
      <!-- Финансовая информация (верхнее поле) -->
      <BookFinanceSummary 
        :bookId="bookId" 
        @update:dateFilter="dateFilter = $event" 
      />
      
      <!-- Список транзакций -->
      <div class="transactions-container">
        <BookTransactionsList 
          :bookId="bookId" 
          :dateFilter="dateFilter" 
          @transaction-click="handleTransactionClick" 
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue';
  import BookFinanceSummary from './BookFinanceSummary.vue';
  import BookTransactionsList from './BookTransactionsList.vue';
  
  const props = defineProps({
    bookId: {
      type: String,
      required: true
    }
  });
  
  // Состояние компонента
  const dateFilter = ref({
    period: 'monthly',
    date: new Date(),
    dateRange: [
      new Date(new Date().setDate(new Date().getDate() - 7)), 
      new Date()
    ]
  });
  
  // Обработчик клика по транзакции
  const handleTransactionClick = (transaction) => {
    console.log('Transaction clicked:', transaction);
    // Здесь можно добавить логику для просмотра деталей транзакции
  };
  
  // Отслеживание изменений bookId - при смене книги сбрасываем к текущему месяцу
  watch(() => props.bookId, () => {
    // При смене книги переходим на текущий месяц
    dateFilter.value = {
      period: 'monthly',
      date: new Date(),
      dateRange: [
        new Date(new Date().setDate(new Date().getDate() - 7)), 
        new Date()
      ]
    };
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
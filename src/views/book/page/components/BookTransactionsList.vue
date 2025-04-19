<!-- src/views/book/page/components/BookTransactionsList.vue -->
<template>
  <div class="book-transactions-list">
    <div class="list-header">
      <h3 class="en-subheading text-header">Recent Transactions</h3>
    </div>
    
    <div v-if="isLoading" class="loading-state">
      <p class="text-grey">Loading transactions...</p>
    </div>
    
    <div v-else-if="groupedTransactions.length === 0" class="empty-state">
      <p class="text-grey">No transactions found for this period</p>
    </div>
    
    <div v-else class="transaction-groups">
      <BookTransactionGroup 
        v-for="group in groupedTransactions" 
        :key="group.date" 
        :date="group.date"
        :transactions="group.transactions"
        @transaction-click="handleTransactionClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import BookTransactionGroup from './BookTransactionGroup.vue';
import { useBookTransactions } from '../composables/useBookTransactions';

console.log('[BookTransactionsList] Component setup started');

const emit = defineEmits(['transaction-click']);

// Используем composable для транзакций
const { 
  groupedTransactions, 
  isLoading, 
  formatDate,
  handleTransactionClick: internalHandleClick 
} = useBookTransactions();

// Передаем клик по транзакции родителю
const handleTransactionClick = (transaction) => {
  internalHandleClick(transaction);
  emit('transaction-click', transaction);
};

onMounted(() => {
  console.log('[BookTransactionsList] Component mounted');
});
</script>
  
  <style scoped>
  .book-transactions-list {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  
  .list-header {
    margin-bottom: var(--spacing-md);
  }
  
  .loading-state, .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    padding: var(--spacing-md);
    text-align: center;
  }
  
  .transaction-groups {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }
  </style>
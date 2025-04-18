<!-- src/views/book/page/components/BookTransactionsList.vue -->
<template>
    <div class="book-transactions-list">
      <div class="list-header">
        <h3 class="en-subheading text-header">Recent Transactions</h3>
      </div>
      
      <div v-if="loading" class="loading-state">
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
  import { ref, computed, watch, onMounted } from 'vue';
  import { useTransactionStore } from '@/stores/transaction';
  import BookTransactionGroup from './BookTransactionGroup.vue';
  
  const props = defineProps({
    bookId: {
      type: String,
      required: true
    },
    dateFilter: {
      type: Object,
      default: () => ({
        period: 'monthly',
        date: new Date()
      })
    }
  });
  
  const emit = defineEmits(['transaction-click']);
  
  // Хранилище транзакций
  const transactionStore = useTransactionStore();
  
  // Состояние компонента
  const loading = ref(true);
  
  // Функция для получения транзакций с применением фильтров
  const getFilteredTransactions = () => {
    // Получаем все транзакции текущей книги
    const bookTransactions = transactionStore.transactions.filter(
      transaction => transaction.bookId === props.bookId
    );
    
    // Применяем фильтр даты
    if (props.dateFilter.period === 'daily' && props.dateFilter.dateRange) {
      const [startDate, endDate] = props.dateFilter.dateRange;
      return bookTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    } else if (props.dateFilter.period === 'monthly' && props.dateFilter.date) {
      const filterDate = new Date(props.dateFilter.date);
      const month = filterDate.getMonth();
      const year = filterDate.getFullYear();
      
      return bookTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getMonth() === month && 
               transactionDate.getFullYear() === year;
      });
    } else if (props.dateFilter.period === 'yearly' && props.dateFilter.date) {
      const filterDate = new Date(props.dateFilter.date);
      const year = filterDate.getFullYear();
      
      return bookTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getFullYear() === year;
      });
    }
    
    // Если фильтр не задан, возвращаем все транзакции книги
    return bookTransactions;
  };
  
  // Группируем транзакции по дате
  const groupedTransactions = computed(() => {
    const transactions = getFilteredTransactions();
    
    // Группировка по дате (без времени)
    const groups = new Map();
    
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      // Получаем дату без времени для группировки
      const dateKey = new Date(
        transactionDate.getFullYear(),
        transactionDate.getMonth(),
        transactionDate.getDate()
      ).toISOString();
      
      if (!groups.has(dateKey)) {
        groups.set(dateKey, {
          date: new Date(dateKey),
          transactions: []
        });
      }
      
      groups.get(dateKey).transactions.push(transaction);
    });
    
    // Преобразуем Map в массив и сортируем по дате (от новых к старым)
    return Array.from(groups.values()).sort((a, b) => b.date - a.date);
  });
  
  // Обработчик клика по транзакции
  const handleTransactionClick = (transaction) => {
    emit('transaction-click', transaction);
  };
  
  // Следим за изменениями фильтра и книги
  watch([() => props.bookId, () => props.dateFilter], () => {
    loading.value = true;
    
    // Имитация загрузки данных
    setTimeout(() => {
      loading.value = false;
    }, 300);
  }, { deep: true });
  
  // Инициализация компонента
  onMounted(async () => {
    if (!transactionStore.isInitialized) {
      await transactionStore.init();
    }
    
    loading.value = false;
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
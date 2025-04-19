// src/views/book/page/composables/useBookTransactions.ts
import { computed } from 'vue';
import { useBookContext } from './useBookContext';

export function useBookTransactions() {
  console.log('[useBookTransactions] Initializing...');
  
  const { getFilteredTransactions, dateFilter, isLoading } = useBookContext();
  
  // Группировка транзакций по дате
  const groupedTransactions = computed(() => {
    const transactions = getFilteredTransactions();
    console.log(`[useBookTransactions] Processing ${transactions.length} transactions`);
    
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
    const result = Array.from(groups.values()).sort((a, b) => b.date - a.date);
    console.log(`[useBookTransactions] Grouped into ${result.length} date groups`);
    return result;
  });
  
  // Форматирование даты для отображения
  const formatDate = (date) => {
    if (!date) return '';
    
    const options = { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    };
    
    return new Date(date).toLocaleDateString('en-US', options);
  };
  
  // Обработчик клика по транзакции
  const handleTransactionClick = (transaction) => {
    console.log('[useBookTransactions] Transaction clicked:', transaction.id);
    // Дополнительная логика для обработки клика по транзакции
  };
  
  return {
    groupedTransactions,
    isLoading,
    dateFilter,
    formatDate,
    handleTransactionClick
  };
}
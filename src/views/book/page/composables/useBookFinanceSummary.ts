// src/views/book/page/composables/useBookFinanceSummary.ts
import { computed } from 'vue';
import { useBookContext } from './useBookContext';
import { useUserStore } from '@/stores/user';
import { useCurrencyStore } from '@/stores/currency';

export function useBookFinanceSummary() {
  console.log('[useBookFinanceSummary] Initializing...');
  
  const { 
    currentBook, 
    isLoading, 
    dateFilter, 
    hasDistributionRules,
    getBookFinancialData,
    setDateFilter
  } = useBookContext();
  
  const userStore = useUserStore();
  const currencyStore = useCurrencyStore();
  
  // Получаем финансовые данные
  const bookData = computed(() => {
    return getBookFinancialData();
  });
  
  // Форматирование суммы с валютой
  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return '0';
    
    try {
      const currencyCode = bookData.value.currency;
      return currencyStore.formatCurrency(amount, currencyCode);
    } catch (error) {
      console.error('[useBookFinanceSummary] Error formatting amount:', error);
      return amount.toString();
    }
  };
  
  // Форматирование только валюты
  const formatCurrency = (value) => {
    try {
      const currencyCode = bookData.value.currency;
      return currencyStore.formatCurrency(value || 0, currencyCode);
    } catch (error) {
      console.error('[useBookFinanceSummary] Error formatting currency:', error);
      return (value || 0).toString();
    }
  };
  
  // Получение CSS класса для общей суммы
  const getTotalClass = (amount) => {
    try {
      if (amount > 0) return 'amount-positive';
      if (amount < 0) return 'amount-negative';
      return '';
    } catch (error) {
      console.error('[useBookFinanceSummary] Error getting total class:', error);
      return '';
    }
  };
  
  // Обработчик изменения видимости календаря
  const onCalendarVisibilityChange = (isVisible) => {
    console.log('[useBookFinanceSummary] Calendar visibility changed:', isVisible);
    // Дополнительная логика, если нужна
  };
  
  // Обновление фильтра даты
  const updateDateFilter = (filter) => {
    // Проверка на реальное изменение перед обновлением
    const currentFilterJson = JSON.stringify(dateFilter.value);
    const newFilterJson = JSON.stringify(filter);
    
    if (currentFilterJson !== newFilterJson) {
      console.log('[useBookFinanceSummary] Updating date filter:', filter);
      setDateFilter(filter);
    } else {
      console.log('[useBookFinanceSummary] Skipping update, filter not changed');
    }
  };
  
  console.log('[useBookFinanceSummary] Initialized with book:', currentBook.value?.name || 'None');
  
  return {
    bookData,
    isLoading,
    dateFilter,
    formatAmount,
    formatCurrency,
    getTotalClass,
    onCalendarVisibilityChange,
    hasDistributionRules,
    updateDateFilter
  };
}
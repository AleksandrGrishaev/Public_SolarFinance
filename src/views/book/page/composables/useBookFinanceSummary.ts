// src/views/book/page/composables/useBookFinanceSummary.ts
import { computed } from 'vue';
import { useBookContext } from './useBookContext';
import { useUserStore } from '@/stores/user';
import { useCurrencyStore } from '@/stores/currency';
import { format, isEqual, isValid, parseISO } from 'date-fns';

// Вспомогательная функция для нормализации даты
const normalizeDate = (date) => {
  if (!date) return null;
  if (typeof date === 'string') return parseISO(date);
  return new Date(date);
};

// Вспомогательная функция для глубокого сравнения объектов даты в фильтре
const areDateFiltersEqual = (filter1, filter2) => {
  // Проверка типа периода
  if (filter1.period !== filter2.period) return false;
  
  // Проверка даты для ежемесячного и годового периодов
  if (filter1.period === 'monthly' || filter1.period === 'yearly') {
    if (!filter1.date && !filter2.date) return true;
    if (!filter1.date || !filter2.date) return false;
    
    const date1 = normalizeDate(filter1.date);
    const date2 = normalizeDate(filter2.date);
    
    if (!isValid(date1) || !isValid(date2)) return false;
    
    if (filter1.period === 'monthly') {
      // Для месячного фильтра сравниваем только месяц и год
      return date1.getMonth() === date2.getMonth() && 
             date1.getFullYear() === date2.getFullYear();
    } else {
      // Для годового фильтра сравниваем только год
      return date1.getFullYear() === date2.getFullYear();
    }
  }
  
  // Проверка диапазона дат для ежедневного периода
  if (filter1.period === 'daily') {
    if (!filter1.dateRange || !filter2.dateRange) return false;
    if (!Array.isArray(filter1.dateRange) || !Array.isArray(filter2.dateRange)) return false;
    if (filter1.dateRange.length !== 2 || filter2.dateRange.length !== 2) return false;
    
    const startDate1 = normalizeDate(filter1.dateRange[0]);
    const endDate1 = normalizeDate(filter1.dateRange[1]);
    const startDate2 = normalizeDate(filter2.dateRange[0]);
    const endDate2 = normalizeDate(filter2.dateRange[1]);
    
    if (!isValid(startDate1) || !isValid(endDate1) || 
        !isValid(startDate2) || !isValid(endDate2)) return false;
    
    // Сравниваем начальную и конечную даты диапазона
    const startEqual = isEqual(
      new Date(startDate1.getFullYear(), startDate1.getMonth(), startDate1.getDate()),
      new Date(startDate2.getFullYear(), startDate2.getMonth(), startDate2.getDate())
    );
    
    const endEqual = isEqual(
      new Date(endDate1.getFullYear(), endDate1.getMonth(), endDate1.getDate()),
      new Date(endDate2.getFullYear(), endDate2.getMonth(), endDate2.getDate())
    );
    
    return startEqual && endEqual;
  }
  
  return false;
};

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
    // Используем глубокое сравнение фильтров даты вместо JSON.stringify
    const isEqual = areDateFiltersEqual(dateFilter.value, filter);
    
    if (!isEqual) {
      console.log('[useBookFinanceSummary] Updating date filter:', filter);
      
      // Нормализуем даты перед обновлением фильтра
      const normalizedFilter = { ...filter };
      
      // Нормализуем дату для месячного и годового фильтров
      if (filter.period === 'monthly' || filter.period === 'yearly') {
        if (filter.date) {
          normalizedFilter.date = normalizeDate(filter.date);
        }
      }
      
      // Нормализуем диапазон дат для дневного фильтра
      if (filter.period === 'daily' && filter.dateRange) {
        normalizedFilter.dateRange = [
          normalizeDate(filter.dateRange[0]), 
          normalizeDate(filter.dateRange[1])
        ];
        
        // Также нормализуем dateFrom и dateTo, если они есть
        if (filter.dateFrom) normalizedFilter.dateFrom = normalizeDate(filter.dateFrom);
        if (filter.dateTo) normalizedFilter.dateTo = normalizeDate(filter.dateTo);
      }
      
      setDateFilter(normalizedFilter);
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
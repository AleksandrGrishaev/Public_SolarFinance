// src/views/book/page/composables/useBookFinanceSummary.ts
import useBookData from './useBookData';
import useOwnerDistribution from './useOwnerDistribution';
import useFormatting from './useFormatting';

/**
 * Основной композабл для финансовой сводки книги, объединяющий все три компонента
 * и обеспечивающий обратную совместимость с исходным кодом
 */
export default function useBookFinanceSummary(bookIdProp: string, emit: any) {
  // Получаем данные о книге и транзакциях
  const {
    dateFilter,
    bookData,
    isAllBooks,
    refreshData,
    initStores,
    isLoading,
    onCalendarVisibilityChange
  } = useBookData(bookIdProp, emit);
  
  // Получаем данные о распределении между владельцами
  const {
    ownerSides,
    actualOwnerDistribution,
    getParticipantAmount,
    updateOwnerDistribution,
    hasDistributionRules
  } = useOwnerDistribution(bookIdProp, emit);
  
  // Получаем функции форматирования для отображения
  const {
    formatAmount,
    formatCurrency,
    getTotalClass,
    getSliderStyle,
    getParticipantStyle
  } = useFormatting(bookIdProp, emit);
  
  return {
    // Из useBookData
    dateFilter,
    bookData,
    isAllBooks,
    refreshData,
    initStores,
    isLoading,
    onCalendarVisibilityChange,
    
    // Из useOwnerDistribution
    ownerSides,
    actualOwnerDistribution,
    getParticipantAmount,
    updateOwnerDistribution,
    hasDistributionRules,
    
    // Из useFormatting
    formatAmount,
    formatCurrency,
    getTotalClass,
    getSliderStyle,
    getParticipantStyle
  };
}
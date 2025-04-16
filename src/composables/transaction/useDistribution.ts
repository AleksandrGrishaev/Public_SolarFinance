// src/composables/transaction/useDistribution.ts
import { ref, computed, watch } from 'vue';
import { useBookStore } from '../../stores/book';
import { useSystemStore } from '../../stores/system';

/**
 * Хук для управления распределением транзакций между владельцами
 */
export function useDistribution(selectedBookRef, selectedTypeRef) {
  const bookStore = useBookStore();
  const systemStore = useSystemStore();
  
  // State
  const distributionPercentage = ref(50);

  // Вычисляемое свойство для определения показывать ли слайдер распределения
  const shouldShowDistribution = computed(() => {
    // Для переводов не показываем
    if (selectedTypeRef.value === 'transfer') return false;
    
    // Проверяем наличие правил распределения в выбранной книге
    const book = bookStore.getBookById(selectedBookRef.value);
    return book && book.distributionRules && book.distributionRules.length > 0;
  });

  // Получение данных владельцев для распределения
  const distributionOwners = computed(() => {
    const book = bookStore.getBookById(selectedBookRef.value);
    if (!book || !book.distributionRules) return [];
    
    // Получаем данные пользователей для слайдера на основе правил распределения
    return book.distributionRules.map(rule => {
      const owner = systemStore.getOwnerById(rule.ownerId);
      return {
        id: rule.ownerId,
        name: owner ? owner.name : 'Unknown',
        percentage: rule.percentage
      };
    });
  });

  // Обновление процента распределения при изменении книги
  watch(selectedBookRef, (newBookId) => {
    const book = bookStore.getBookById(newBookId);
    if (book && book.distributionRules && book.distributionRules.length >= 2) {
      // Устанавливаем процент первого владельца из правил
      distributionPercentage.value = book.distributionRules[0].percentage;
    }
  });

  return {
    distributionPercentage,
    shouldShowDistribution,
    distributionOwners
  };
}
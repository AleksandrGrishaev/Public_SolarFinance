// src/composables/transaction/useDistribution.ts
import { ref, computed, watch } from 'vue';
import { useBookStore } from '../../stores/book';
import { useUserStore } from '../../stores/user';

/**
 * Хук для управления распределением транзакций между владельцами
 */
export function useDistribution(selectedBookRef, selectedTypeRef) {
  const bookStore = useBookStore();
  const userStore = useUserStore(); // Используем userStore вместо systemStore
  
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
      // Пытаемся получить пользователя из currentUser
      let userName = 'Unknown';
      
      // Проверяем, является ли пользователь текущим
      if (userStore.currentUser && userStore.currentUser.id === rule.ownerId) {
        userName = userStore.currentUser.name;
      } else {
        // Для других пользователей используем имя по умолчанию
        // или пытаемся найти в другом месте
        switch(rule.ownerId) {
          case 'user_1':
            userName = 'Alex';
            break;
          case 'user_2':
            userName = 'Sasha';
            break;
          default:
            userName = `User ${rule.ownerId.replace('user_', '')}`;
        }
      }
      
      // Ограничиваем длину имени до 10 символов
      if (userName.length > 10) {
        userName = userName.substring(0, 9) + '…';
      }
      
      return {
        id: rule.ownerId,
        name: userName,
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
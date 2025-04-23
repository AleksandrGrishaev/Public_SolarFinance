// src/composables/transaction/useAdvancedDistribution.ts

import { computed, ref, watch } from 'vue';
import { useDistribution } from './useDistribution';
import { useBookStore } from '@/stores/book';
import { useAccountStore } from '@/stores/account';
import { useCategoryStore } from '@/stores/category';

export function useAdvancedDistribution(selectedBookRef, selectedTypeRef, selectedAccountRef, selectedCategoryRef) {
  const bookStore = useBookStore();
  const accountStore = useAccountStore();
  const categoryStore = useCategoryStore();
  
  // Локальное хранилище для настроек распределения
  const distributionSettings = ref({});
  
  // Используем базовую функциональность
  const {
    distributionPercentage,
    shouldShowDistribution,
    distributionOwners
  } = useDistribution(selectedBookRef, selectedTypeRef);
  
  // Определение стандартного значения распределения
  const getStandardDistributionValue = computed(() => {
    const book = bookStore.getBookById(selectedBookRef.value);
    const account = accountStore.getAccountById(selectedAccountRef.value);
    const category = selectedCategoryRef.value;
    
    if (!book) return 50;
    
    // Если у категории есть стандартное распределение, используем его
    if (category && category.defaultDistribution !== undefined) {
      return category.defaultDistribution;
    }
    
    // Проверяем настройки для комбинации книга-категория
    if (category && distributionSettings.value[`${book.id}-${category.id}`]) {
      return distributionSettings.value[`${book.id}-${category.id}`];
    }
    
    // Если категория не указана или настройки не найдены, используем стандартные правила
    if (book.type === 'family') {
      // Для семейной книги используем правила из самой книги
      if (book.distributionRules && book.distributionRules.length > 0) {
        return book.distributionRules[0].percentage;
      }
      return 50; // По умолчанию 50/50
    }
    
    // Для личной книги определяем владельца
    if (book.type === 'personal') {
      if (book.ownerIds[0] === 'user_1') return 100; // Первый владелец
      if (book.ownerIds[0] === 'user_2') return 0; // Второй владелец
    }
    
    return 50; // По умолчанию 50/50
  });
  
  // Проверка, является ли текущее распределение нестандартным
  const isNonStandardDistribution = computed(() => {
    return Math.abs(distributionPercentage.value - getStandardDistributionValue.value) > 1;
  });
  
  // Проверка для автоматического отображения слайдера
  const shouldAutoShowSlider = computed(() => {
    // Если это перевод, не показываем слайдер
    if (selectedTypeRef.value === 'transfer') return false;
    
    // Если это долг или обмен валют, всегда показываем слайдер
    if (['debt', 'exchange'].includes(selectedTypeRef.value)) return true;
    
    const book = bookStore.getBookById(selectedBookRef.value);
    const account = accountStore.getAccountById(selectedAccountRef.value);
    
    if (!book || !account) return false;
    
    // Семейная книга + любой счет = показываем слайдер
    if (book.type === 'family') return true;
    
    // Личная книга + общий счет = показываем слайдер
    if (book.type === 'personal' && account.ownerIds && account.ownerIds.length > 1) {
      return true;
    }
    
    // Показываем, если распределение отличается от стандартного
    if (isNonStandardDistribution.value) return true;
    
    return false;
  });
  
  // Сохранение настроек распределения
  const saveDistributionSetting = (bookId, categoryId, percentage) => {
    if (!bookId || !categoryId) return;
    
    const key = `${bookId}-${categoryId}`;
    distributionSettings.value[key] = percentage || distributionPercentage.value;
    
    // Можно добавить сохранение в localStorage для персистентности
    try {
      const savedSettings = JSON.parse(localStorage.getItem('distributionSettings') || '{}');
      savedSettings[key] = percentage || distributionPercentage.value;
      localStorage.setItem('distributionSettings', JSON.stringify(savedSettings));
    } catch (error) {
      console.error('[useAdvancedDistribution] Error saving settings to localStorage:', error);
    }
  };
  
  // Загрузка настроек распределения
  const loadDistributionSetting = (bookId, categoryId) => {
    if (!bookId || !categoryId) return false;
    
    const key = `${bookId}-${categoryId}`;
    
    // Проверяем локальное хранилище
    if (distributionSettings.value[key] !== undefined) {
      distributionPercentage.value = distributionSettings.value[key];
      return true;
    }
    
    // Пробуем загрузить из localStorage
    try {
      const savedSettings = JSON.parse(localStorage.getItem('distributionSettings') || '{}');
      if (savedSettings[key] !== undefined) {
        distributionPercentage.value = savedSettings[key];
        distributionSettings.value[key] = savedSettings[key];
        return true;
      }
    } catch (error) {
      console.error('[useAdvancedDistribution] Error loading settings from localStorage:', error);
    }
    
    return false;
  };
  
  // Проверка на конфликт распределения с категорией
  const checkCategoryDistributionConflict = (category) => {
    if (!category || category.defaultDistribution === undefined) return false;
    
    const categoryDistribution = category.defaultDistribution;
    return Math.abs(distributionPercentage.value - categoryDistribution) > 5;
  };
  
  // Инициализация - загрузка сохраненных настроек
  const initDistributionSettings = () => {
    try {
      const savedSettings = JSON.parse(localStorage.getItem('distributionSettings') || '{}');
      distributionSettings.value = savedSettings;
    } catch (error) {
      console.error('[useAdvancedDistribution] Error loading settings from localStorage:', error);
    }
  };
  
  // Инициализируем при создании composable
  initDistributionSettings();
  
  // При изменении книги или типа транзакции обновляем распределение
  watch([selectedBookRef, selectedTypeRef], () => {
    distributionPercentage.value = getStandardDistributionValue.value;
  });
  
  // При изменении категории пытаемся загрузить сохраненное распределение
  watch(selectedCategoryRef, (newCategory) => {
    if (newCategory) {
      // Приоритет 1: Стандартное распределение категории
      if (newCategory.defaultDistribution !== undefined) {
        distributionPercentage.value = newCategory.defaultDistribution;
        return;
      }
      
      // Приоритет 2: Сохраненные настройки для пары книга-категория
      loadDistributionSetting(selectedBookRef.value, newCategory.id);
    }
  });
  
  return {
    distributionPercentage,
    distributionOwners,
    shouldShowDistribution,
    shouldAutoShowSlider,
    isNonStandardDistribution,
    getStandardDistributionValue,
    saveDistributionSetting,
    loadDistributionSetting,
    checkCategoryDistributionConflict
  };
}
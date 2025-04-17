// src/composables/transaction/useCategory.ts
import { ref, computed } from 'vue';
import { useCategoryStore } from '../../../stores/category';

/**
 * Хук для управления категориями в контексте транзакций
 */
export function useCategory(selectedBookRef, selectedTypeRef) {
  const categoryStore = useCategoryStore();
  
  // State
  const showCategorySelector = ref(false);
  const showCategoryList = ref(false);
  const selectedCategory = ref(null);

  // Вычисляемое свойство для получения отфильтрованных категорий
  const filteredCategories = computed(() => {
    if (selectedTypeRef.value === 'transfer') {
      return [];
    }
    
    // Получаем категории для выбранной книги и типа транзакции
    return categoryStore.getCategoriesForBookAndType(selectedBookRef.value, selectedTypeRef.value);
  });

  // Обработчики событий для категорий
  const handleCategorySelect = (category) => {
    if (category) {
      selectedCategory.value = category;
      return true; // Категория успешно выбрана
    } else {
      console.warn('[useCategory] Attempted to select null category');
      return false;
    }
  };

  const handleAddCategory = () => {
    // Закрываем селектор категорий и открываем список категорий
    showCategorySelector.value = false;
    showCategoryList.value = true;
  };

  const handleOpenCategoryList = () => {
    // Закрываем селектор категорий и открываем список категорий
    showCategorySelector.value = false;
    showCategoryList.value = true;
  };

  const handleCategoryListSelect = (category) => {
    // Выбор категории из списка возвращает нас к первому попапу
    if (category) {
      selectedCategory.value = category;
      showCategoryList.value = false;
      showCategorySelector.value = true;
    }
  };

  const handleAddCategoryFromList = (data) => {
    // Здесь должен быть код для добавления новой категории
    console.log('[useCategory] Adding new category with data:', data);
    // Потенциально здесь можно открыть третий попап для добавления категории
    // или реализовать эту логику в самом списке категорий
  };

  const handleCategoriesReordered = (reorderedCategories) => {
    console.log('[useCategory] Categories reordered:', reorderedCategories);
    // Здесь мы должны обновить порядок категорий в хранилище
    // Но для демонстрации просто логируем новый порядок
    
    // В реальном приложении это могло бы выглядеть так:
    // categoryStore.updateCategoriesOrder(reorderedCategories);
  };

  // Обработка изменения активности категории
  const handleToggleActiveCategory = ({ category, isActive, bookId }) => {
    if (!category || !bookId) {
      console.warn('[useCategory] Invalid category toggle parameters', { category, isActive, bookId });
      return;
    }
    
    console.log(`[useCategory] Category ${category.name} is now ${isActive ? 'active' : 'inactive'} in book ${bookId}`);
    
    // Используем методы store для обновления
    if (isActive) {
      categoryStore.addCategoryToBook(category.id, bookId);
    }
    
    // Обновляем статус активности
    categoryStore.toggleCategoryActive(category.id, isActive);
  };

  // Сбросить категорию при изменении типа транзакции
  const resetCategoryIfNeeded = (newType) => {
    if (newType !== 'transfer' && selectedCategory.value && selectedCategory.value.type !== newType) {
      selectedCategory.value = null;
    }
  };

  return {
    showCategorySelector,
    showCategoryList,
    selectedCategory,
    filteredCategories,
    handleCategorySelect,
    handleAddCategory,
    handleOpenCategoryList,
    handleCategoryListSelect,
    handleAddCategoryFromList,
    handleCategoriesReordered,
    handleToggleActiveCategory,
    resetCategoryIfNeeded
  };
}
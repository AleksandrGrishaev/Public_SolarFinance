// src/views/transaction/composables/useDistribution.ts
import { ref, computed, watch } from 'vue';
import { useBookStore } from '@/stores/book';
import { useUserStore } from '@/stores/user';
import { useCategoryStore } from '@/stores/category';

/**
 * Объединенный composable для логики распределения транзакций
 */
export function useDistribution(
  selectedBookRef,
  selectedTypeRef,
  selectedAccountRef = null,
  selectedCategoryRef = null
) {
  // Stores
  const bookStore = useBookStore();
  const userStore = useUserStore();
  const categoryStore = useCategoryStore();
  
  // State
  const distributionPercentage = ref(50);
  const isSliderManuallyVisible = ref(false);
  const isManuallyHidden = ref(false);
  const distributionSettings = ref({});
  
  // ---- БАЗОВАЯ ФУНКЦИОНАЛЬНОСТЬ ----
  
  /**
   * Определяет, должны ли отображаться элементы распределения по бизнес-правилам
   */
  const shouldShowDistribution = computed(() => {
    // Для переводов не показываем
    if (selectedTypeRef.value === 'transfer') return false;
    
    // Проверяем наличие правил распределения в выбранной книге
    const book = bookStore.getBookById(selectedBookRef.value);
    return book && book.distributionRules && book.distributionRules.length > 0;
  });
  
  /**
   * Получение данных владельцев для распределения
   */
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
  
  // ---- РАСШИРЕННАЯ ФУНКЦИОНАЛЬНОСТЬ ----
  
  /**
   * Инициализация - загрузка сохраненных настроек
   */
  const initDistributionSettings = () => {
    try {
      const savedSettings = JSON.parse(localStorage.getItem('distributionSettings') || '{}');
      distributionSettings.value = savedSettings;
    } catch (error) {
      console.error('[useDistribution] Error loading settings from localStorage:', error);
    }
  };
  
  /**
   * Определение стандартного значения распределения
   */
  const getStandardDistributionValue = computed(() => {
    const book = bookStore.getBookById(selectedBookRef.value);
    
    if (!book) return 50;
    
    // Если у категории есть стандартное распределение, используем его
    if (selectedCategoryRef?.value && selectedCategoryRef.value.defaultDistribution !== undefined) {
      return selectedCategoryRef.value.defaultDistribution;
    }
    
    // Проверяем настройки для комбинации книга-категория
    if (selectedCategoryRef?.value && 
        distributionSettings.value[`${book.id}-${selectedCategoryRef.value.id}`]) {
      return distributionSettings.value[`${book.id}-${selectedCategoryRef.value.id}`];
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
  
  /**
   * Проверка, является ли текущее распределение нестандартным
   */
  const isNonStandardDistribution = computed(() => {
    return Math.abs(distributionPercentage.value - getStandardDistributionValue.value) > 1;
  });
  
  /**
   * Проверка для автоматического отображения слайдера
   */
  const shouldAutoShowSlider = computed(() => {
    // Если это перевод, не показываем слайдер
    if (selectedTypeRef.value === 'transfer') return false;
    
    // Если это долг или обмен валют, всегда показываем слайдер
    if (['debt', 'exchange'].includes(selectedTypeRef.value)) return true;
    
    const book = bookStore.getBookById(selectedBookRef.value);
    if (!book) return false;
    
    // Семейная книга - показываем слайдер
    if (book.type === 'family') return true;
    
    // Показываем, если распределение отличается от стандартного
    if (isNonStandardDistribution.value) return true;
    
    return false;
  });
  
  /**
   * Сохранение настроек распределения
   */
  const saveDistributionSetting = (bookId, categoryId, percentage) => {
    if (!bookId || !categoryId) return;
    
    const key = `${bookId}-${categoryId}`;
    distributionSettings.value[key] = percentage || distributionPercentage.value;
    
    // Сохраняем в localStorage для персистентности
    try {
      const savedSettings = JSON.parse(localStorage.getItem('distributionSettings') || '{}');
      savedSettings[key] = percentage || distributionPercentage.value;
      localStorage.setItem('distributionSettings', JSON.stringify(savedSettings));
    } catch (error) {
      console.error('[useDistribution] Error saving settings to localStorage:', error);
    }
  };
  
  /**
   * Загрузка настроек распределения
   */
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
      console.error('[useDistribution] Error loading settings from localStorage:', error);
    }
    
    return false;
  };
  
  /**
   * Проверка на конфликт распределения с категорией
   */
  const checkCategoryDistributionConflict = (category) => {
    if (!category || category.defaultDistribution === undefined) return false;
    
    const categoryDistribution = category.defaultDistribution;
    return Math.abs(distributionPercentage.value - categoryDistribution) > 5;
  };
  
  // ---- УПРАВЛЕНИЕ ВИДИМОСТЬЮ СЛАЙДЕРА ----
  
  /**
   * Флаг, указывающий, нужно ли показывать иконку переключения
   */
  const showDistributionToggle = computed(() => {
    // Показываем иконку переключения только для доходов и расходов, но не для переводов
    return selectedTypeRef.value !== 'transfer';
  });
  
  /**
   * Проверяем, есть ли данные для распределения
   */
  const hasDistributionData = computed(() => {
    return distributionOwners.value && 
           Array.isArray(distributionOwners.value) && 
           distributionOwners.value.length >= 2;
  });
  
  /**
   * Конечная видимость слайдера
   */
  const isSliderVisible = computed(() => {
    // Если это перевод, всегда скрываем слайдер
    if (selectedTypeRef.value === 'transfer') return false;
    
    // Если у нас нет данных для распределения, скрываем слайдер
    if (!hasDistributionData.value) return false;
    
    // Если пользователь явно переключил состояние слайдера, 
    // уважаем его выбор (isSliderManuallyVisible)
    if (isManuallyHidden.value || isSliderManuallyVisible.value) {
      return isSliderManuallyVisible.value;
    }
    
    // В остальных случаях используем автоматическое поведение
    return shouldAutoShowSlider.value;
  });
  
  /**
   * Обработчик переключения отображения слайдера
   */
  const toggleDistributionVisibility = () => {
    // Если у нас нет данных для распределения, не разрешаем включать слайдер
    if (!hasDistributionData.value && !isSliderManuallyVisible.value) {
      console.log('[useDistribution] Cannot show slider: no distribution data available');
      return;
    }
    
    // Когда пользователь впервые нажимает на кнопку, если слайдер виден,
    // то мы просто скрываем его, запоминая что это было ручное действие
    if (isSliderVisible.value && !isManuallyHidden.value && !isSliderManuallyVisible.value) {
      isManuallyHidden.value = true;
      isSliderManuallyVisible.value = false;
    } else {
      // После первого переключения, просто меняем значение
      isSliderManuallyVisible.value = !isSliderManuallyVisible.value;
      isManuallyHidden.value = !isSliderManuallyVisible.value;
    }
  };
  
  // ---- WATCHES И LIFECYCLE ----
  
  // Обновление процента распределения при изменении книги
  watch(selectedBookRef, (newBookId) => {
    const book = bookStore.getBookById(newBookId);
    if (book && book.distributionRules && book.distributionRules.length >= 2) {
      // Устанавливаем процент первого владельца из правил
      distributionPercentage.value = book.distributionRules[0].percentage;
    }
    
    // Сбрасываем ручные настройки при смене книги
    isSliderManuallyVisible.value = false;
    isManuallyHidden.value = false;
  });
  
  // Сбрасываем ручную видимость при изменении типа транзакции
  watch(selectedTypeRef, (newType) => {
    isSliderManuallyVisible.value = false;
    isManuallyHidden.value = false;
    
    // При изменении типа транзакции обновляем распределение
    distributionPercentage.value = getStandardDistributionValue.value;
  });
  
  // При изменении категории пытаемся загрузить сохраненное распределение
  if (selectedCategoryRef) {
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
  }
  
  // Инициализируем при создании composable
  initDistributionSettings();
  
  return {
    // State
    distributionPercentage,
    
    // Computed
    distributionOwners,
    shouldShowDistribution,
    shouldAutoShowSlider,
    isNonStandardDistribution,
    getStandardDistributionValue,
    isSliderVisible,
    showDistributionToggle,
    hasDistributionData,
    
    // Methods
    saveDistributionSetting,
    loadDistributionSetting,
    checkCategoryDistributionConflict,
    toggleDistributionVisibility
  };
}
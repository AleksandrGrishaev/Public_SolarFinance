// src/views/transaction/composables/useDistribution.ts
import { ref, computed, watch } from 'vue';
import { useBookStore } from '@/stores/book';
import { useUserStore } from '@/stores/user';
import { useCategoryStore } from '@/stores/category';

/**
 * Composable для логики распределения транзакций между участниками
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
  
  // State для распределения
  const distributionPercentage = ref(100); // По умолчанию 100% для текущего пользователя
  const isSliderManuallyVisible = ref(false);
  const isManuallyHidden = ref(false);
  const distributionSettings = ref({});
  
  // State для выбора пользователей
  const secondUserId = ref(null); // ID второго участника (null означает, что не выбран)
  const personSelectionPopupVisible = ref(false);
  const currentSlotIndex = ref(1); // Индекс слота для добавления пользователя (всегда 1 для второго)
  
  // ---- БАЗОВАЯ ФУНКЦИОНАЛЬНОСТЬ РАСПРЕДЕЛЕНИЯ ----
  
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
   * Получение данных о распределении из книги
   */
  const getBookDistributionData = (bookId) => {
    const book = bookStore.getBookById(bookId);
    if (!book || !book.distributionRules || book.distributionRules.length === 0) {
      return null;
    }
    
    // Находим правила распределения, где текущий пользователь не является владельцем
    const currentUserId = userStore.currentUser?.id || 'user_1';
    const otherOwnerRule = book.distributionRules.find(rule => rule.ownerId !== currentUserId);
    
    if (otherOwnerRule) {
      return {
        ownerId: otherOwnerRule.ownerId,
        percentage: otherOwnerRule.percentage
      };
    }
    
    return null;
  };
  
  /**
   * Получение данных владельцев для распределения
   */
  const distributionOwners = computed(() => {
    // Текущий пользователь всегда первый (слева)
    const currentUserId = userStore.currentUser?.id || 'user_1';
    const allUsers = userStore.getAllUsers();
    
    // Используем цвет из настроек пользователя, если он есть
    const userColor = userStore.currentUser?.settings?.color || '#53B794';
    
    const leftSide = {
      id: currentUserId,
      name: userStore.currentUser?.name || 'You',
      color: userColor,
      percentage: distributionPercentage.value
    };
    
    // Если у нас нет второго выбранного пользователя, то возвращаем только первого
    if (!secondUserId.value) {
      return [leftSide];
    }
    
    // Находим второго пользователя и его настройки цвета
    const secondUser = allUsers.find(user => user.id === secondUserId.value);
    const secondUserColor = secondUser?.settings?.color || '#DB9894';
    
    const rightSide = {
      id: secondUserId.value,
      name: secondUser?.name || (secondUserId.value === 'user_2' ? 'Sasha' : 'Unknown'),
      color: secondUserColor,
      percentage: 100 - distributionPercentage.value
    };
    
    return [leftSide, rightSide];
  });
  
  // ---- РАСШИРЕННАЯ ФУНКЦИОНАЛЬНОСТЬ РАСПРЕДЕЛЕНИЯ ----
  
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
    
    if (!book) return 100; // По умолчанию 100% для текущего пользователя
    
    // Если у категории есть стандартное распределение, используем его
    if (selectedCategoryRef?.value && selectedCategoryRef.value.defaultDistribution !== undefined) {
      return selectedCategoryRef.value.defaultDistribution;
    }
    
    // Проверяем настройки для комбинации книга-категория
    if (selectedCategoryRef?.value && 
        distributionSettings.value[`${book.id}-${selectedCategoryRef.value.id}`]) {
      return distributionSettings.value[`${book.id}-${selectedCategoryRef.value.id}`];
    }
    
    // Если есть распределение по книге, используем его
    if (book.distributionRules && book.distributionRules.length > 0) {
      // Находим правило для текущего пользователя
      const currentUserId = userStore.currentUser?.id || 'user_1';
      const userRule = book.distributionRules.find(rule => rule.ownerId === currentUserId);
      
      if (userRule) {
        return userRule.percentage;
      }
      
      // Если нет правила для текущего пользователя, возвращаем обратное значение
      // от первого правила (предполагая, что есть только 2 правила)
      return 100 - book.distributionRules[0].percentage;
    }
    
    return 100; // Если нет правил, 100% для текущего пользователя
  });
  
  /**
   * Проверка, является ли текущее распределение нестандартным
   */
  const isNonStandardDistribution = computed(() => {
    if (distributionOwners.value.length < 2) {
      // Если нет второго участника, распределение всегда стандартное
      return false;
    }
    
    return Math.abs(distributionPercentage.value - getStandardDistributionValue.value) > 1;
  });
  
  /**
   * Проверка, есть ли правила распределения в книге
   */
  const hasBookDistribution = computed(() => {
    const book = bookStore.getBookById(selectedBookRef.value);
    return book && book.distributionRules && book.distributionRules.length > 0;
  });
  
  /**
   * Проверка для автоматического отображения слайдера
   */
  const shouldAutoShowSlider = computed(() => {
    // Если это перевод, не показываем слайдер
    if (selectedTypeRef.value === 'transfer') return false;
    
    // Если это долг или обмен валют, всегда показываем слайдер
    if (['debt', 'exchange'].includes(selectedTypeRef.value)) return true;
    
    // Если в книге есть распределение, показываем слайдер
    if (hasBookDistribution.value) return true;
    
    // Если уже выбран второй участник, показываем слайдер
    if (secondUserId.value) return true;
    
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
   * Конечная видимость слайдера
   */
  const isSliderVisible = computed(() => {
    // Если это перевод, всегда скрываем слайдер
    if (selectedTypeRef.value === 'transfer') return false;
    
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
    
    // Если слайдер становится видимым и нет второго участника, 
    // но в книге есть распределение, добавляем участника из распределения
    if (isSliderManuallyVisible.value && 
        !secondUserId.value && 
        hasBookDistribution.value) {
      
      const bookDistributionData = getBookDistributionData(selectedBookRef.value);
      if (bookDistributionData) {
        // Устанавливаем второго участника из распределения книги
        secondUserId.value = bookDistributionData.ownerId;
        
        // Устанавливаем процент из распределения книги
        distributionPercentage.value = 100 - bookDistributionData.percentage;
      }
    }
  };
  
  // ---- УПРАВЛЕНИЕ ВЫБОРОМ УЧАСТНИКОВ ----
  
  /**
   * Обработчик клика на участника распределения
   */
  const handlePersonClick = (index) => {
    if (index === 0) {
      // Клик по текущему пользователю - игнорируем
      return;
    }
    
    // Открываем попап выбора пользователя для второй стороны
    personSelectionPopupVisible.value = true;
    currentSlotIndex.value = index;
  };
  
  /**
   * Обработчик добавления участника
   */
  const handleAddPerson = () => {
    // Открываем попап выбора пользователя
    personSelectionPopupVisible.value = true;
    currentSlotIndex.value = 1; // 1 - индекс слота для второго участника
  };
  
  /**
   * Обработчик выбора участника из попапа
   */
  const handlePersonSelect = (data) => {
    // Добавляем выбранного участника как второго
    secondUserId.value = data.person.id;
    
    // Определяем процент распределения для нового участника
    let newPercentage = 50; // По умолчанию 50/50
    
    // Если распределение книги содержит этого участника, используем его процент
    const book = bookStore.getBookById(selectedBookRef.value);
    if (book && book.distributionRules) {
      const userRule = book.distributionRules.find(rule => rule.ownerId === data.person.id);
      if (userRule) {
        newPercentage = 100 - userRule.percentage;
      }
    }
    
    // Обновляем процент
    distributionPercentage.value = newPercentage;
    
    // Закрываем попап
    personSelectionPopupVisible.value = false;
  };
  
  /**
   * Удаление второго участника из распределения
   */
  const removeSecondPerson = () => {
    secondUserId.value = null;
    distributionPercentage.value = 100; // 100% для текущего пользователя
  };
  
  /**
   * Программное обновление видимости попапа
   */
  const setPopupVisibility = (visible) => {
    personSelectionPopupVisible.value = visible;
  };
  
  // ---- ОБРАБОТЧИКИ ДЛЯ РАЗНЫХ ТИПОВ ТРАНЗАКЦИЙ ----
  
  /**
   * Настройка распределения для конкретного типа транзакции
   */
  const setupDistributionForTransactionType = (type) => {
    // Если меняется тип транзакции
    if (type !== selectedTypeRef.value) {
      // Сбрасываем ручную видимость слайдера
      isSliderManuallyVisible.value = false;
      isManuallyHidden.value = false;
      
      // Для некоторых типов применяем специальные правила
      switch (type) {
        case 'transfer':
          // Для переводов скрываем слайдер и сбрасываем второго участника
          removeSecondPerson();
          break;
          
        case 'debt':
          // Для долгов, если слайдер не виден, показываем его
          if (!isSliderVisible.value) {
            isSliderManuallyVisible.value = true;
            isManuallyHidden.value = false;
          }
          
          // Если нет второго участника, но есть распределение в книге, добавляем участника
          if (!secondUserId.value && hasBookDistribution.value) {
            const bookDistData = getBookDistributionData(selectedBookRef.value);
            if (bookDistData) {
              secondUserId.value = bookDistData.ownerId;
              distributionPercentage.value = 100 - bookDistData.percentage;
            }
          }
          break;
          
        default:
          // Для обычных транзакций используем стандартное значение
          if (!secondUserId.value) {
            distributionPercentage.value = 100; // Устанавливаем 100% для текущего пользователя
          } else {
            distributionPercentage.value = getStandardDistributionValue.value;
          }
      }
    }
  };
  
  // ---- WATCHES И LIFECYCLE ----
  
  // Обновление при изменении книги
  watch(selectedBookRef, (newBookId) => {
    console.log('[useDistribution] Selected book changed:', newBookId);
    
    if (!newBookId) return;
    
    // Сбрасываем ручные настройки при смене книги
    isSliderManuallyVisible.value = false;
    isManuallyHidden.value = false;
    
    // Проверяем распределение в новой книге
    const bookDistributionData = getBookDistributionData(newBookId);
    
    if (bookDistributionData) {
      // Если в книге есть распределение, устанавливаем второго участника
      secondUserId.value = bookDistributionData.ownerId;
      distributionPercentage.value = 100 - bookDistributionData.percentage;
    } else {
      // Иначе сбрасываем участников и устанавливаем 100% для текущего пользователя
      secondUserId.value = null;
      distributionPercentage.value = 100;
    }
  }, { immediate: true });
  
  // Отслеживаем изменение типа транзакции
  watch(selectedTypeRef, (newType) => {
    // Вызываем настройку распределения для нового типа
    setupDistributionForTransactionType(newType);
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
    // State для распределения
    distributionPercentage,
    shouldShowDistribution,
    distributionOwners,
    isNonStandardDistribution,
    getStandardDistributionValue,
    hasBookDistribution,
    
    // Управление видимостью
    isSliderVisible,
    showDistributionToggle,
    toggleDistributionVisibility,
    
    // Управление участниками
    secondUserId,
    personSelectionPopupVisible,
    currentSlotIndex,
    handlePersonClick,
    handleAddPerson,
    handlePersonSelect,
    removeSecondPerson,
    setPopupVisibility,
    
    // Работа с типами транзакций
    setupDistributionForTransactionType,
    
    // Вспомогательные функции
    saveDistributionSetting,
    loadDistributionSetting,
    checkCategoryDistributionConflict
  };
}
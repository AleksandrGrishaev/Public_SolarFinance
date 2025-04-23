// src/views/transaction/composables/useTransactionCore.ts
import { ref, computed, watch } from 'vue';
import { useAccount } from './useAccount';
import { useCategory } from './useCategory';
import { useBookStore } from '@/stores/book';
import { useAccountStore } from '@/stores/account';
import { useCurrencyStore } from '@/stores/currency';
import { messageService } from '@/services/system/MessageService';

/**
 * Базовый composable для общей логики транзакций
 * Содержит общее состояние и методы, используемые всеми типами транзакций
 */
export function useTransactionCore(emit) {
  // Stores
  const bookStore = useBookStore();
  const accountStore = useAccountStore();
  const currencyStore = useCurrencyStore();
  
  // Общее состояние
  const isLoading = ref(true);
  const isSaving = ref(false);
  const selectedBook = ref('');
  const selectedType = ref('expense');
  
  // Состояние для суммы
  const amount = ref('0');
  
  // Методы для работы с клавиатурой
  const handleKeypadInput = (value) => {
    // Если уже есть точка, то не добавляем вторую
    if (value === '.' && amount.value.includes('.')) {
      return;
    }
    
    // Если сумма равна нулю и вводится не точка, то заменяем ноль на введенное значение
    if (amount.value === '0' && value !== '.') {
      amount.value = value;
    } else {
      // Иначе добавляем символ к текущему значению
      amount.value += value;
    }
  };

  /**
   * Удаление последнего символа суммы
   */
  const deleteLastDigit = () => {
    if (amount.value.length > 1) {
      amount.value = amount.value.slice(0, -1);
    } else {
      amount.value = '0';
    }
  };

  /**
   * Установка нового значения суммы
   */
  const setAmount = (newAmount) => {
    if (typeof newAmount === 'number') {
      amount.value = newAmount.toString();
    } else {
      amount.value = newAmount;
    }
  };

  /**
   * Сброс суммы на ноль
   */
  const resetAmount = () => {
    amount.value = '0';
  };

  // Инициализация дочерних хуков
  const { 
    selectedAccount, 
    destinationAccount, 
    filteredAccounts, 
    setupInitialAccounts 
  } = useAccount(selectedBook, selectedType);

  const {
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
  } = useCategory(selectedBook, selectedType);

  // Наблюдатель за изменением типа транзакции
  watch(selectedType, (newType) => {
    resetCategoryIfNeeded(newType);
  });

  /**
   * Инициализация хранилищ
   */
  const initAllStores = async () => {
    try {
      isLoading.value = true;
      console.log('[useTransactionCore] Initializing stores...');
      
      // Инициализируем хранилища последовательно для надежности
      if (!bookStore.isInitialized) {
        console.log('[useTransactionCore] Initializing book store...');
        await bookStore.init();
      }
      
      if (!accountStore.isInitialized) {
        console.log('[useTransactionCore] Initializing account store...');
        await accountStore.init();
      }
      
      if (!currencyStore.isInitialized) {
        console.log('[useTransactionCore] Initializing currency store...');
        await currencyStore.init();
      }
      
      // Устанавливаем начальное значение selectedBook
      if (bookStore.books.length > 0) {
        if (!bookStore.books.some(book => book.id === selectedBook.value)) {
          selectedBook.value = bookStore.books[0].id;
        }
      } else {
        console.warn('[useTransactionCore] No books available in store');
      }
      
      // Настраиваем начальные аккаунты на основе книги
      setupInitialAccounts();
      
      console.log('[useTransactionCore] All stores initialized successfully');
      return true;
    } catch (error) {
      console.error('[useTransactionCore] Error initializing stores:', error);
      messageService.error('Ошибка при инициализации хранилищ');
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Базовая валидация общая для всех транзакций
   */
  const validateBaseTransaction = () => {
    const amountValue = parseFloat(amount.value);
    if (isNaN(amountValue) || amountValue === 0) {
      messageService.error('Сумма должна быть больше нуля');
      return false;
    }
    
    if (!selectedAccount.value) {
      messageService.error('Выберите счет для транзакции');
      return false;
    }
    
    if (!selectedBook.value) {
      messageService.error('Выберите книгу для транзакции');
      return false;
    }
    
    return true;
  };

  /**
   * Сброс формы после сохранения
   */
  const resetForm = () => {
    resetAmount();
    selectedCategory.value = null;
    // Не сбрасываем счета и книгу для удобства
  };

  /**
   * Настройка UI компонентов
   */
  const setupUI = () => {
    // Настраиваем интерфейс для страницы транзакций
    emit('update:showMenu', true);
    
    // Обновляем заголовок
    emit('update:header', {
      show: true,
      title: '',
      showBack: false,
      hasNotifications: true,
      showMessageIcon: true,
      showProfileIcon: true,
      background: 'var(--bg-dropdown)'
    });
  };

  return {
    // State
    isLoading,
    isSaving, 
    amount,
    selectedBook,
    selectedType,
    
    // From useAccount
    selectedAccount,
    destinationAccount,
    filteredAccounts,
    
    // From useCategory
    showCategorySelector,
    showCategoryList,
    selectedCategory,
    filteredCategories,
    
    // Методы для работы с клавиатурой
    handleKeypadInput,
    deleteLastDigit,
    setAmount,
    resetAmount,
    
    // Methods
    initAllStores,
    resetForm,
    validateBaseTransaction,
    setupUI,
    
    // Category handlers
    handleCategorySelect,
    handleAddCategory,
    handleOpenCategoryList,
    handleCategoryListSelect,
    handleAddCategoryFromList,
    handleCategoriesReordered,
    handleToggleActiveCategory
  };
}
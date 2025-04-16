// src/composables/transaction/useTransaction.ts
import { ref, watch } from 'vue';
import { useAccount } from './useAccount';
import { useCategory } from './useCategory';
import { useDistribution } from './useDistribution';
import { useKeypad } from './useKeypad';
import { useAccountStore } from '../../stores/account';
import { useBookStore } from '../../stores/book';
import { useCurrencyStore } from '../../stores/currency';

/**
 * Основной хук для работы с транзакциями
 */
export function useTransaction(emit: (event: string, ...args: any[]) => void) {
  // Stores
  const accountStore = useAccountStore();
  const bookStore = useBookStore();
  const currencyStore = useCurrencyStore();
  
  // State
  const isLoading = ref(true);
  const selectedBook = ref('');
  const selectedType = ref('expense');
  
  // Инициализация хука для клавиатуры
  const { amount, handleKeypadInput, deleteLastDigit, resetAmount } = useKeypad();

  // Инициализация дочерних хуков
  const { 
    selectedAccount, 
    destinationAccount, 
    filteredAccounts, 
    currentCurrencySymbol, 
    getAccountCurrencyCode,
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

  const {
    distributionPercentage,
    shouldShowDistribution,
    distributionOwners
  } = useDistribution(selectedBook, selectedType);

  // Инициализируем все хранилища сразу при создании компонента
  const initAllStores = async () => {
    try {
      isLoading.value = true;
      console.log('[useTransaction] Initializing stores...');
      
      // Инициализируем все хранилища последовательно для надежности
      if (!bookStore.isInitialized) {
        console.log('[useTransaction] Initializing book store...');
        await bookStore.init();
        console.log('[useTransaction] Book store initialized:', bookStore.books.map(b => b.id));
      }
      
      if (!accountStore.isInitialized) {
        console.log('[useTransaction] Initializing account store...');
        await accountStore.init();
        console.log('[useTransaction] Account store initialized with', accountStore.accounts.length, 'accounts');
      }
      
      if (currencyStore.init) {
        await currencyStore.init();
      }
      
      // Устанавливаем начальное значение selectedBook, если оно не соответствует ни одной из имеющихся книг
      if (bookStore.books.length > 0) {
        if (!bookStore.books.some(book => book.id === selectedBook.value)) {
          selectedBook.value = bookStore.books[0].id;
          console.log('[useTransaction] Set initial book to:', selectedBook.value);
        }
      } else {
        console.warn('[useTransaction] No books available in store');
      }
      
      // Настраиваем начальные аккаунты на основе книги
      setupInitialAccounts();
      
      console.log('[useTransaction] All stores initialized successfully');
    } catch (error) {
      console.error('[useTransaction] Error initializing stores:', error);
    } finally {
      isLoading.value = false;
    }
  };

  // Методы для обработки клавиатурного ввода уже определены в useKeypad

  // Обработчик добавления транзакции
  const handleAddTransaction = () => {
    // For expenses and incomes, we need to select a category first
    if (selectedType.value !== 'transfer' && !selectedCategory.value) {
      showCategorySelector.value = true;
      return;
    }
    
    saveTransaction();
  };

  // Сохранение транзакции
  const saveTransaction = () => {
    // Here we would save the transaction to the store/backend
    const sourceAccount = accountStore.getAccountById(selectedAccount.value);
    if (!sourceAccount) {
      console.error('[useTransaction] Cannot save transaction: source account not found');
      return;
    }
    
    const transactionData = {
      amount: parseFloat(amount.value),
      book: selectedBook.value,
      type: selectedType.value,
      account: selectedAccount.value,
      currency: sourceAccount.currency
    };
    
    // Добавляем дополнительную информацию в зависимости от типа транзакции
    if (selectedType.value === 'transfer') {
      transactionData.destinationAccount = destinationAccount.value;
      
      // Добавляем информацию о валюте счета-получателя
      const destAccount = accountStore.getAccountById(destinationAccount.value);
      if (destAccount) {
        transactionData.destinationCurrency = destAccount.currency;
      }
    } else {
      // Добавляем информацию о распределении только если оно доступно
      if (shouldShowDistribution.value) {
        transactionData.distribution = distributionPercentage.value;
      }
      transactionData.category = selectedCategory.value;
    }
    
    console.log('[useTransaction] Saving transaction:', transactionData);
    
    // Reset the form or navigate back
    resetAmount();
    selectedCategory.value = null;
  };

  // Наблюдатель за изменением типа транзакции
  watch(selectedType, (newType) => {
    resetCategoryIfNeeded(newType);
  });

  return {
    // State
    isLoading,
    amount,
    selectedBook,
    selectedType,
    
    // From useAccount
    selectedAccount,
    destinationAccount,
    filteredAccounts,
    currentCurrencySymbol,
    
    // From useCategory
    showCategorySelector,
    showCategoryList,
    selectedCategory,
    filteredCategories,
    
    // From useDistribution
    distributionPercentage,
    shouldShowDistribution,
    distributionOwners,
    
    // Methods
    initAllStores,
    handleKeypadInput,
    deleteLastDigit,
    handleAddTransaction,
    saveTransaction,
    
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
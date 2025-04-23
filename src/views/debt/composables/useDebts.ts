// src/views/debt/composables/useDebts.ts
import { computed, ref, onMounted, watch } from 'vue';
import { useDebtStore } from '@/stores/debt';
import { useUserStore } from '@/stores/user';
import { useCurrencyStore } from '@/stores/currency';
import { useBookStore } from '@/stores/book';
import { useTransactionStore } from '@/stores/transaction';
import type { Debt, DebtStatus, DebtPayment, NewDebtPayload } from '@/stores/debt/types';
import { messageService } from '@/services/system/MessageService';

/**
 * Хук для работы с долгами в интерфейсе приложения
 */
export function useDebts() {
  const debtStore = useDebtStore();
  const userStore = useUserStore();
  const currencyStore = useCurrencyStore();
  const bookStore = useBookStore();
  const transactionStore = useTransactionStore();
  
  // Локальное состояние
  const isLoading = ref(false);
  const selectedDebt = ref<Debt | null>(null);
  const selectedStatus = ref<DebtStatus | null>(null);
  const selectedCurrency = ref('');
  const selectedBookId = ref('');
  
  // Состояние диалогов
  const showAddDebtDialog = ref(false);
  const showPaymentDialog = ref(false);
  const showDebtDetailDialog = ref(false);
  const showCancelDebtDialog = ref(false);
  
  // Загрузка данных
  const loadDebts = async () => {
    isLoading.value = true;
    
    try {
      // Проверяем инициализацию хранилища
      if (!debtStore.isInitialized) {
        await debtStore.init();
      }
      
      // Проверяем инициализацию связанных хранилищ
      if (!userStore.isInitialized) await userStore.init();
      if (!currencyStore.isInitialized) await currencyStore.init();
      if (!bookStore.isInitialized) await bookStore.init();
      
      console.log('[useDebts] Debts loaded successfully');
    } catch (error) {
      console.error('[useDebts] Error loading debts:', error);
      messageService.error('Ошибка при загрузке долгов');
    } finally {
      isLoading.value = false;
    }
  };
  
  // Вычисляемые свойства для работы с долгами
  const allDebts = computed(() => debtStore.debts);
  
  const activeDebts = computed(() => debtStore.activeDebts);
  
  const debtsByCurrentUser = computed(() => debtStore.currentUserDebts);
  
  const debtsToCurrentUser = computed(() => debtStore.debtsToCurrentUser);
  
  // Фильтрованные долги
  const filteredDebts = computed(() => {
    let result = activeDebts.value;
    
    // Фильтр по статусу
    if (selectedStatus.value) {
      result = result.filter(debt => debt.status === selectedStatus.value);
    }
    
    // Фильтр по валюте
    if (selectedCurrency.value) {
      result = result.filter(debt => debt.currency === selectedCurrency.value);
    }
    
    // Фильтр по книге
    if (selectedBookId.value) {
      result = result.filter(debt => debt.bookId === selectedBookId.value);
    }
    
    return result;
  });
  
  // Общий баланс долгов по валютам
  const debtBalance = computed(() => debtStore.currentUserDebtBalance);
  
  // Форматированный баланс для отображения
  const formattedDebtBalance = computed(() => debtStore.formattedDebtBalance);
  
  // Валюты, используемые в долгах
  const debtCurrencies = computed(() => {
    const currencies = new Set<string>();
    
    allDebts.value.forEach(debt => {
      currencies.add(debt.currency);
    });
    
    return Array.from(currencies);
  });
  
  // Форматирование суммы с символом валюты
  const formatAmount = (amount: number, currencyCode: string) => {
    return currencyStore.formatCurrency(amount, currencyCode);
  };
  
  // Получение имени пользователя
  const getUserName = (userId: string) => {
    const user = userStore.users.find(u => u.id === userId);
    return user ? user.name : 'Неизвестный пользователь';
  };
  
  // Получение имени книги
  const getBookName = (bookId: string) => {
    const book = bookStore.getBookById(bookId);
    return book ? book.name : 'Неизвестная книга';
  };
  
  // Получение символа валюты
  const getCurrencySymbol = (currencyCode: string) => {
    const currency = currencyStore.getCurrency(currencyCode);
    return currency?.symbol || currencyCode;
  };
  
  // ОПЕРАЦИИ С ДОЛГАМИ
  
  // Выбор долга для просмотра/редактирования
  const selectDebt = (debt: Debt) => {
    selectedDebt.value = debt;
    showDebtDetailDialog.value = true;
  };
  
  const clearSelectedDebt = () => {
    selectedDebt.value = null;
    showDebtDetailDialog.value = false;
  };
  
  // ФИЛЬТРАЦИЯ
  
  // Фильтрация по статусу
  const filterByStatus = (status: DebtStatus | null) => {
    selectedStatus.value = status;
  };
  
  // Фильтрация по валюте
  const filterByCurrency = (currency: string) => {
    selectedCurrency.value = currency;
  };
  
  // Фильтрация по книге
  const filterByBook = (bookId: string) => {
    selectedBookId.value = bookId;
  };
  
  // Сброс всех фильтров
  const resetFilters = () => {
    selectedStatus.value = null;
    selectedCurrency.value = '';
    selectedBookId.value = '';
  };
  
  // УПРАВЛЕНИЕ ДОЛГАМИ
  
  // Добавление нового долга
  const openAddDebtDialog = () => {
    showAddDebtDialog.value = true;
  };
  
  const closeAddDebtDialog = () => {
    showAddDebtDialog.value = false;
  };
  
  const addDebt = async (debtData: NewDebtPayload, createTransaction: boolean = false) => {
    isLoading.value = true;
    
    try {
      const newDebt = await debtStore.addDebt(debtData);
      
      // Создаем транзакцию, если нужно
      if (createTransaction && newDebt) {
        // TODO: Реализовать создание транзакции на основе долга
        console.log('[useDebts] Creating transaction for debt:', newDebt.id);
      }
      
      messageService.success('Долг успешно добавлен');
      closeAddDebtDialog();
      return newDebt;
    } catch (error) {
      console.error('[useDebts] Error adding debt:', error);
      messageService.error('Ошибка при добавлении долга');
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Добавление платежа по долгу
  const openPaymentDialog = (debt: Debt) => {
    selectedDebt.value = debt;
    showPaymentDialog.value = true;
  };
  
  const closePaymentDialog = () => {
    showPaymentDialog.value = false;
  };
  
  const addPayment = async (
    paymentData: Omit<DebtPayment, 'id' | 'debtId'>, 
    createTransaction: boolean = false
  ) => {
    if (!selectedDebt.value) {
      messageService.error('Долг не выбран');
      return false;
    }
    
    isLoading.value = true;
    
    try {
      const success = await debtStore.addPayment(selectedDebt.value.id, paymentData);
      
      if (success) {
        // Создаем транзакцию платежа, если нужно
        if (createTransaction) {
          // TODO: Реализовать создание транзакции платежа
          console.log('[useDebts] Creating payment transaction');
        }
        
        await debtStore.refreshDebts();
        messageService.success('Платеж успешно добавлен');
        closePaymentDialog();
        
        // Если долг полностью оплачен, закрываем диалог деталей
        const updatedDebt = debtStore.debts.find(d => d.id === selectedDebt.value?.id);
        if (updatedDebt?.status === 'paid') {
          closeDebtDetailDialog();
        }
        
        return true;
      }
      
      messageService.error('Ошибка при добавлении платежа');
      return false;
    } catch (error) {
      console.error('[useDebts] Error adding payment:', error);
      messageService.error('Ошибка при добавлении платежа');
      return false;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Отмена долга
  const openCancelDebtDialog = (debt: Debt) => {
    selectedDebt.value = debt;
    showCancelDebtDialog.value = true;
  };
  
  const closeCancelDebtDialog = () => {
    showCancelDebtDialog.value = false;
  };
  
  const cancelDebt = async (debt: Debt, reason: string = '') => {
    isLoading.value = true;
    
    try {
      const success = await debtStore.cancelDebt(debt.id, reason);
      
      if (success) {
        await debtStore.refreshDebts();
        messageService.success('Долг успешно отменен');
        closeCancelDebtDialog();
        closeDebtDetailDialog();
        return true;
      }
      
      messageService.error('Ошибка при отмене долга');
      return false;
    } catch (error) {
      console.error('[useDebts] Error cancelling debt:', error);
      messageService.error('Ошибка при отмене долга');
      return false;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Диалог деталей долга
  const openDebtDetailDialog = (debt: Debt) => {
    selectedDebt.value = debt;
    showDebtDetailDialog.value = true;
  };
  
  const closeDebtDetailDialog = () => {
    showDebtDetailDialog.value = false;
  };
  
  // Создание долга из транзакции
  const createDebtFromTransaction = async (transactionId: string) => {
    isLoading.value = true;
    
    try {
      // Проверяем, существует ли уже долг для этой транзакции
      if (debtStore.hasDebtForTransaction(transactionId)) {
        messageService.warning('Долг для этой транзакции уже существует');
        return null;
      }
      
      const debt = await debtStore.createDebtFromTransaction(transactionId);
      
      if (debt) {
        messageService.success('Долг успешно создан на основе транзакции');
        return debt;
      }
      
      messageService.error('Ошибка при создании долга из транзакции');
      return null;
    } catch (error) {
      console.error('[useDebts] Error creating debt from transaction:', error);
      messageService.error('Ошибка при создании долга из транзакции');
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Взаимозачет долгов между пользователями
  const offsetDebts = async (user1Id: string, user2Id: string, currency: string) => {
    isLoading.value = true;
    
    try {
      const success = await debtStore.offsetDebtsBetweenUsers(user1Id, user2Id, currency);
      
      if (success) {
        await debtStore.refreshDebts();
        messageService.success('Взаимозачет долгов выполнен успешно');
        return true;
      }
      
      messageService.warning('Нет долгов для взаимозачета или они уже зачтены');
      return false;
    } catch (error) {
      console.error('[useDebts] Error offsetting debts:', error);
      messageService.error('Ошибка при взаимозачете долгов');
      return false;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Инициализация при монтировании
  onMounted(async () => {
    await loadDebts();
  });
  
  // Обновляем выбранный долг при изменении долгов
  watch(() => debtStore.debts, () => {
    if (selectedDebt.value) {
      const updatedDebt = debtStore.debts.find(d => d.id === selectedDebt.value?.id);
      selectedDebt.value = updatedDebt || null;
    }
  });
  
  return {
    // Состояние
    isLoading,
    selectedDebt,
    selectedStatus,
    selectedCurrency,
    selectedBookId,
    
    // Диалоги
    showAddDebtDialog,
    showPaymentDialog,
    showDebtDetailDialog,
    showCancelDebtDialog,
    
    // Данные
    allDebts,
    activeDebts,
    debtsByCurrentUser,
    debtsToCurrentUser,
    filteredDebts,
    debtBalance,
    formattedDebtBalance,
    debtCurrencies,
    
    // Функции для работы с долгами
    loadDebts,
    selectDebt,
    clearSelectedDebt,
    
    // Фильтрация
    filterByStatus,
    filterByCurrency,
    filterByBook,
    resetFilters,
    
    // Операции с долгами
    openAddDebtDialog,
    closeAddDebtDialog,
    addDebt,
    openPaymentDialog,
    closePaymentDialog,
    addPayment,
    openCancelDebtDialog,
    closeCancelDebtDialog,
    cancelDebt,
    openDebtDetailDialog,
    closeDebtDetailDialog,
    createDebtFromTransaction,
    offsetDebts,
    
    // Вспомогательные функции
    formatAmount,
    getUserName,
    getBookName,
    getCurrencySymbol
  };
}
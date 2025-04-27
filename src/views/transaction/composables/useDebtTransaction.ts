// src/views/transaction/composables/useDebtTransaction.ts
import { ref, computed } from 'vue';
import { useAccountStore } from '@/stores/account';
import { useBookStore } from '@/stores/book';
import { useCurrencyStore } from '@/stores/currency';
import { useTransactionStore } from '@/stores/transaction';
import { useDebtStore } from '@/stores/debt/debtStore';
import { useUserStore } from '@/stores/user';
import { messageService } from '@/services/system/MessageService';

/**
 * Composable для работы с долговыми транзакциями
 * @param amount - Сумма транзакции
 * @param selectedBook - ID выбранной книги
 * @param selectedAccount - ID выбранного счета
 * @param selectedCategory - Выбранная категория
 * @param distributionPercentage - Процент распределения
 * @param distributionOwners - Владельцы для распределения
 * @param isSaving - Флаг состояния сохранения
 * @param resetForm - Функция сброса формы
 * @param validateBaseTransaction - Функция базовой валидации
 */
export function useDebtTransaction(
  amount,
  selectedBook,
  selectedAccount,
  selectedCategory,
  distributionPercentage,
  distributionOwners,
  isSaving,
  resetForm,
  validateBaseTransaction
) {
  // Stores
  const accountStore = useAccountStore();
  const bookStore = useBookStore();
  const currencyStore = useCurrencyStore();
  const transactionStore = useTransactionStore();
  const debtStore = useDebtStore();
  const userStore = useUserStore();
  
  // State
  const debtorDialog = ref({
    show: false
  });

  /**
   * Доступные должники (другие пользователи)
   */
  const availableDebtors = computed(() => {
    const currentUserId = userStore.currentUser?.id || 'user_1';
    if (!selectedBook.value) return [];
    
    const book = bookStore.getBookById(selectedBook.value);
    if (!book || !book.ownerIds) return [];
    
    return book.ownerIds
      .filter(id => id !== currentUserId)
      .map(id => {
        const user = userStore.users.find(u => u.id === id);
        if (!user) {
          // Если пользователь не найден, создаем плейсхолдер
          return {
            id,
            name: id === 'user_1' ? 'Alex' : 'Sasha',
            color: id === 'user_1' ? '#4CAF50' : '#9C27B0'
          };
        }
        return {
          id: user.id,
          name: user.name,
          color: user.settings?.color
        };
      });
  });

  // ID текущего пользователя
  const currentUserId = computed(() => userStore.currentUser?.id || 'user_1');

  /**
   * Валидация транзакции долга
   * @returns {boolean} - Валидна ли транзакция
   */
  const validateDebtTransaction = () => {
    if (!validateBaseTransaction()) {
      return false;
    }
    
    if (availableDebtors.value.length === 0) {
      messageService.error('Нет доступных пользователей для создания долга');
      return false;
    }
    
    return true;
  };

  /**
   * Сохранение долговой транзакции
   * @param {string} debtorId - ID пользователя-должника
   * @returns {Promise<boolean>} - Успешно ли сохранена транзакция
   */
  const saveDebtTransaction = async (debtorId) => {
    try {
      isSaving.value = true;
      
      // Конвертируем сумму в число
      const amountValue = parseFloat(amount.value);
      const finalAmount = -Math.abs(amountValue); // Долги всегда отрицательные для плательщика
      
      // Получаем данные о выбранном счете
      const account = accountStore.getAccountById(selectedAccount.value);
      if (!account) {
        throw new Error(`Счет с ID ${selectedAccount.value} не найден`);
      }
      
      // Получаем данные о выбранной книге
      const book = bookStore.getBookById(selectedBook.value);
      if (!book) {
        throw new Error(`Книга с ID ${selectedBook.value} не найдена`);
      }
      
      // Определяем описание транзакции
      let description = 'Транзакция с долгом';
      if (selectedCategory.value) {
        description = `Долг: ${selectedCategory.value.name}`;
      }
      
      // Определяем курс конвертации и сумму в валюте книги
      let bookRate = 1;
      let bookAmount = finalAmount;
      
      if (account.currency !== book.currency) {
        bookRate = currencyStore.getExchangeRate(account.currency, book.currency);
        bookAmount = finalAmount * bookRate;
      }
      
      // Формируем данные транзакции
      const transactionData = {
        date: new Date(),
        amount: finalAmount,
        currency: account.currency,
        bookCurrency: book.currency,
        bookRate: bookRate,
        bookAmount: bookAmount,
        type: 'debt', // Специальный тип для долгов
        categoryId: selectedCategory.value?.id,
        description,
        sourceEntityId: selectedAccount.value,
        sourceEntityType: 'account',
        executedByOwnerId: currentUserId.value,
        responsibleOwnerIds: [debtorId || distributionOwners.value[1]?.id], // По умолчанию второй владелец
        bookId: selectedBook.value
      };
      
      // Сохраняем транзакцию
      const savedTransaction = await transactionStore.addTransaction(transactionData);
      
      // Обновляем баланс счета
      if (savedTransaction) {
        // Обновляем баланс выбранного счета
        const newBalance = account.currentBalance + finalAmount;
        await accountStore.updateAccountBalance(selectedAccount.value, newBalance);
        
        // Создаем новый долг на основе транзакции
        const debtData = {
          amount: Math.abs(amountValue),
          currency: account.currency,
          type: 'internal',
          source: 'transaction',
          bookId: selectedBook.value,
          fromUserId: debtorId || distributionOwners.value[1]?.id, // Кто должен (выбранный в диалоге или второй владелец)
          toUserId: currentUserId.value, // Кому должен (текущий пользователь)
          sourceTransactionId: savedTransaction.id,
          description: description || 'Долг по транзакции',
          // Дополнительные поля
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'active'
        };
        
        // Создаем долг в хранилище долгов
        const savedDebt = await debtStore.addDebt(debtData);
        console.log('[useDebtTransaction] Добавлен новый долг:', savedDebt);
        
        // Связываем транзакцию с долгом
        if (savedDebt) {
          await transactionStore.updateTransaction(savedTransaction.id, {
            debtId: savedDebt.id
          });
        }
      }
      
      // Показываем уведомление
      messageService.success('Транзакция с долгом успешно добавлена');
      
      // Сбрасываем форму
      resetForm();
      
      return true;
    } catch (error) {
      console.error('[useDebtTransaction] Ошибка при сохранении долга:', error);
      messageService.error('Произошла ошибка при сохранении долга');
      throw error;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Показать диалог выбора должника
   */
  const showDebtorSelectionDialog = () => {
    debtorDialog.value.show = true;
  };

  /**
   * Скрыть диалог выбора должника
   */
  const hideDebtorDialog = () => {
    debtorDialog.value.show = false;
  };

  /**
   * Обработчик выбора должника
   * @param {string} debtorId - ID выбранного должника
   */
  const onDebtorSelected = (debtorId) => {
    // Сохраняем транзакцию долга с выбранным должником
    saveDebtTransaction(debtorId);
  };

  /**
   * Обработчик добавления долговой транзакции
   * @returns {Promise<boolean>} - Успешность операции
   */
  const handleAddDebtTransaction = async () => {
    if (validateDebtTransaction()) {
      showDebtorSelectionDialog();
      return true;
    }
    return false;
  };

  /**
   * Создание долга для существующей транзакции
   * @param {string} transactionId - ID существующей транзакции
   * @param {string} debtorId - ID должника
   * @returns {Promise<boolean>} - Успешность операции
   */
  const createDebtForTransaction = async (transactionId, debtorId) => {
    try {
      isSaving.value = true;
      
      // Получаем транзакцию по ID
      const transaction = await transactionStore.getTransactionById(transactionId);
      if (!transaction) {
        throw new Error(`Транзакция с ID ${transactionId} не найдена`);
      }
      
      // Создаем долг на основе существующей транзакции
      const debtData = {
        amount: Math.abs(transaction.amount),
        currency: transaction.currency,
        type: 'internal',
        source: 'transaction',
        bookId: transaction.bookId,
        fromUserId: debtorId,
        toUserId: currentUserId.value,
        sourceTransactionId: transactionId,
        description: transaction.description || 'Долг по транзакции',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active'
      };
      
      // Сохраняем долг
      const savedDebt = await debtStore.addDebt(debtData);
      
      // Связываем долг с транзакцией
      if (savedDebt) {
        await transactionStore.updateTransaction(transactionId, {
          debtId: savedDebt.id,
          type: 'debt' // Меняем тип на долг
        });
        
        messageService.success('Долг успешно создан для транзакции');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[useDebtTransaction] Ошибка при создании долга для транзакции:', error);
      messageService.error('Ошибка при создании долга');
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Получение списка долгов пользователя
   * @param {string} userId - ID пользователя (опционально)
   * @returns {Array} - Список долгов
   */
  const getUserDebts = (userId = null) => {
    const targetUserId = userId || currentUserId.value;
    
    // Фильтруем долги, где пользователь либо должник, либо кредитор
    return debtStore.debts.filter(debt => 
      debt.fromUserId === targetUserId || debt.toUserId === targetUserId
    );
  };

  /**
   * Погашение долга
   * @param {string} debtId - ID долга
   * @returns {Promise<boolean>} - Успешность операции
   */
  const repayDebt = async (debtId) => {
    try {
      isSaving.value = true;
      
      // Получаем долг по ID
      const debt = debtStore.getDebtById(debtId);
      if (!debt) {
        throw new Error(`Долг с ID ${debtId} не найден`);
      }
      
      // Создаем транзакцию погашения долга
      const repaymentData = {
        date: new Date(),
        amount: debt.amount,
        currency: debt.currency,
        type: 'debt_repayment',
        description: `Погашение долга: ${debt.description}`,
        sourceEntityId: selectedAccount.value, // Используем выбранный счет
        sourceEntityType: 'account',
        executedByOwnerId: currentUserId.value,
        responsibleOwnerIds: [debt.fromUserId, debt.toUserId],
        bookId: debt.bookId,
        debtId: debt.id
      };
      
      // Сохраняем транзакцию
      const savedTransaction = await transactionStore.addTransaction(repaymentData);
      
      if (savedTransaction) {
        // Обновляем статус долга
        await debtStore.updateDebt(debtId, {
          status: 'repaid',
          repaidAt: new Date(),
          repaymentTransactionId: savedTransaction.id
        });
        
        messageService.success('Долг успешно погашен');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[useDebtTransaction] Ошибка при погашении долга:', error);
      messageService.error('Ошибка при погашении долга');
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  return {
    // State
    debtorDialog,
    availableDebtors,
    currentUserId,
    
    // Методы валидации и сохранения
    validateDebtTransaction,
    saveDebtTransaction,
    showDebtorSelectionDialog,
    hideDebtorDialog,
    onDebtorSelected,
    handleAddDebtTransaction,
    
    // Дополнительные методы для работы с долгами
    createDebtForTransaction,
    getUserDebts,
    repayDebt
  };
}
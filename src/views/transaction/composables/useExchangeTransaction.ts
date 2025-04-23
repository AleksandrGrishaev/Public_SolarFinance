// src/views/transaction/composables/useExchangeTransaction.ts
import { ref } from 'vue';
import { useAccountStore } from '@/stores/account';
import { useCurrencyStore } from '@/stores/currency';
import { useTransactionStore } from '@/stores/transaction';
import { messageService } from '@/services/system/MessageService';

/**
 * Composable для работы с транзакциями обмена валют
 */
export function useExchangeTransaction(
  amount,
  selectedBook,
  selectedAccount,
  destinationAccount,
  isSaving,
  resetForm,
  validateBaseTransaction,
  isTransferWithDifferentCurrencies,
  convertedAmount
) {
  // Stores
  const accountStore = useAccountStore();
  const currencyStore = useCurrencyStore();
  const transactionStore = useTransactionStore();
  
  // UI state for multiple currency inputs
  const isSourceAmountActive = ref(true);
  const manualDestinationAmount = ref('0');
  
  /**
   * Обновление manual amount
   */
  const updateManualDestinationAmount = (value) => {
    manualDestinationAmount.value = value;
  };

  /**
   * Переключение на ввод исходной суммы
   */
  const handleSourceAmountActive = () => {
    isSourceAmountActive.value = true;
  };

  /**
   * Переключение на ввод суммы назначения
   */
  const handleDestinationAmountActive = (value) => {
    isSourceAmountActive.value = false;
    manualDestinationAmount.value = value || convertedAmount.value;
  };

  /**
   * Сброс состояния при смене типа
   */
  const resetExchangeState = () => {
    isSourceAmountActive.value = true;
    manualDestinationAmount.value = '0';
  };

  /**
   * Валидация обмена валют
   */
  const validateExchangeTransaction = () => {
    if (!validateBaseTransaction()) {
      return false;
    }
    
    if (!destinationAccount.value) {
      messageService.error('Выберите счет назначения для обмена валют');
      return false;
    }
    
    if (selectedAccount.value === destinationAccount.value) {
      messageService.error('Счета отправления и назначения не могут совпадать');
      return false;
    }
    
    // Проверяем, что счета имеют разные валюты
    const sourceAccount = accountStore.getAccountById(selectedAccount.value);
    const destAccount = accountStore.getAccountById(destinationAccount.value);
    
    if (!sourceAccount || !destAccount) {
      messageService.error('Выберите корректные счета для обмена валют');
      return false;
    }
    
    if (sourceAccount.currency === destAccount.currency) {
      messageService.warning('Для обмена валют выберите счета с разными валютами');
      return false;
    }
    
    return true;
  };

  /**
   * Сохранение транзакции обмена валют
   */
  const saveExchangeTransaction = async () => {
    try {
      isSaving.value = true;
      
      // Получаем текущего пользователя (TODO: заменить на реальное получение)
      const currentUserId = 'user_1';

      // Конвертируем сумму в число
      const amountValue = Math.abs(parseFloat(amount.value));
      
      // Получаем данные о выбранных счетах
      const sourceAccount = accountStore.getAccountById(selectedAccount.value);
      const destAccount = accountStore.getAccountById(destinationAccount.value);
      
      if (!sourceAccount || !destAccount) {
        throw new Error('Исходный или целевой счет не найден');
      }
      
      // Используем введенную вручную сумму или расчетную по курсу
      let destAmount = amountValue;
      if (sourceAccount.currency !== destAccount.currency) {
        if (!isSourceAmountActive.value && manualDestinationAmount.value !== '0') {
          // Используем ручной ввод суммы назначения
          destAmount = Math.abs(parseFloat(manualDestinationAmount.value));
        } else {
          // Автоматическая конвертация
          const { convertedAmount } = currencyStore.convertAmount(
            amountValue, 
            sourceAccount.currency, 
            destAccount.currency
          );
          destAmount = convertedAmount;
        }
      }
      
      // Расчет фактического курса обмена
      const actualRate = destAmount / amountValue;
      
      // 1. Создаем транзакцию списания со счета-источника
      const withdrawalData = {
        date: new Date(),
        amount: -amountValue,
        currency: sourceAccount.currency,
        type: 'exchange',
        description: `Обмен ${sourceAccount.currency} на ${destAccount.currency} (курс: ${actualRate.toFixed(6)})`,
        sourceEntityId: sourceAccount.id,
        sourceEntityType: 'account',
        destinationEntityId: destAccount.id,
        destinationEntityType: 'account',
        executedByOwnerId: currentUserId,
        responsibleOwnerIds: [currentUserId],
        bookId: selectedBook.value
      };
      
      // 2. Создаем транзакцию пополнения счета-назначения
      const depositData = {
        date: new Date(),
        amount: destAmount,
        currency: destAccount.currency,
        type: 'exchange',
        description: `Обмен ${sourceAccount.currency} на ${destAccount.currency} (курс: ${actualRate.toFixed(6)})`,
        sourceEntityId: sourceAccount.id,
        sourceEntityType: 'account',
        destinationEntityId: destAccount.id,
        destinationEntityType: 'account',
        executedByOwnerId: currentUserId,
        responsibleOwnerIds: [currentUserId],
        bookId: selectedBook.value
      };
      
      // Добавляем транзакции через хранилище
      const withdrawal = await transactionStore.addTransaction(withdrawalData);
      const deposit = await transactionStore.addTransaction(depositData);
      
      // Обновляем балансы счетов
      if (withdrawal && deposit) {
        // Обновляем баланс счета-источника
        const newSourceBalance = sourceAccount.currentBalance - amountValue;
        await accountStore.updateAccountBalance(selectedAccount.value, newSourceBalance);
        
        // Обновляем баланс счета-назначения
        const newDestBalance = destAccount.currentBalance + destAmount;
        await accountStore.updateAccountBalance(destinationAccount.value, newDestBalance);
      }
      
      // Показываем уведомление об успехе
      messageService.success('Обмен валюты успешно выполнен');
      
      // Сбрасываем форму
      resetForm();
      
      return { withdrawal, deposit };
    } catch (error) {
      console.error('[useExchangeTransaction] Ошибка при выполнении обмена валюты:', error);
      messageService.error('Произошла ошибка при выполнении обмена валюты');
      throw error;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Обработчик добавления обмена валют
   */
  const handleAddExchangeTransaction = async () => {
    if (validateExchangeTransaction()) {
      await saveExchangeTransaction();
      return true;
    }
    return false;
  };

  return {
    isSourceAmountActive,
    manualDestinationAmount,
    validateExchangeTransaction,
    saveExchangeTransaction,
    handleAddExchangeTransaction,
    updateManualDestinationAmount,
    handleSourceAmountActive,
    handleDestinationAmountActive,
    resetExchangeState
  };
}
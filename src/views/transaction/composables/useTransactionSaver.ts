// src/composables/transaction/useTransactionSaver.ts

import { inject } from 'vue';
import { useAccountStore } from '@/stores/account';
import { useBookStore } from '@/stores/book';
import { useUserStore } from '@/stores/user';
import { useTransactionStore } from '@/stores/transaction';
import { useCurrencyStore } from '@/stores/currency';
import { useDebtStore } from '@/stores/debt'; // Импортируем DebtStore
import { messageService } from '@/services/system/MessageService';

export function useTransactionSaver() {
  // Инициализируем хранилища
  const accountStore = useAccountStore();
  const bookStore = useBookStore();
  const userStore = useUserStore();
  const transactionStore = useTransactionStore();
  const currencyStore = useCurrencyStore();
  const debtStore = useDebtStore(); // Добавляем хранилище долгов

  /**
   * Сохранение обычной транзакции (доход/расход)
   */
  const saveRegularTransaction = async (data) => {
    const {
      amount,
      selectedType,
      selectedBook,
      selectedAccount,
      selectedCategory,
      distributionPercentage,
      distributionOwners,
      shouldShowDistribution
    } = data;

    try {
      // Конвертируем сумму в число
      const amountValue = parseFloat(amount);
      const finalAmount = selectedType === 'expense' 
        ? -Math.abs(amountValue) 
        : Math.abs(amountValue);
      
      // Получаем данные о выбранном счете
      const account = accountStore.getAccountById(selectedAccount);
      if (!account) {
        throw new Error(`Счет с ID ${selectedAccount} не найден`);
      }
      
      // Получаем данные о выбранной книге
      const book = bookStore.getBookById(selectedBook);
      if (!book) {
        throw new Error(`Книга с ID ${selectedBook} не найдена`);
      }
      
      // Получаем текущего пользователя
      const currentUser = userStore.currentUser;
      if (!currentUser) {
        throw new Error('Не найден авторизованный пользователь');
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
        type: selectedType,
        categoryId: selectedCategory?.id,
        description: selectedCategory?.name || `${selectedType === 'income' ? 'Доход' : 'Расход'}`,
        sourceEntityId: selectedAccount,
        sourceEntityType: 'account',
        executedByOwnerId: currentUser.id,
        responsibleOwnerIds: [currentUser.id],
        bookId: selectedBook
      };
      
      // Добавляем правила распределения
      if (shouldShowDistribution && distributionOwners?.length > 0) {
        transactionData.distributionRules = [
          {
            ownerId: distributionOwners[0].id,
            percentage: distributionPercentage
          },
          {
            ownerId: distributionOwners[1].id,
            percentage: 100 - distributionPercentage
          }
        ];
      }
      
      // Сохраняем транзакцию
      const savedTransaction = await transactionStore.addTransaction(transactionData);
      
      // Обновляем баланс счета
      if (savedTransaction) {
        // Обновляем баланс выбранного счета
        const newBalance = account.currentBalance + finalAmount;
        await accountStore.updateAccountBalance(selectedAccount, newBalance);
      }
      
      // Показываем уведомление
      messageService.success('Транзакция успешно добавлена');
      
      return savedTransaction;
    } catch (error) {
      console.error('[useTransactionSaver] Ошибка при сохранении транзакции:', error);
      messageService.error('Произошла ошибка при сохранении транзакции');
      throw error;
    }
  };

  /**
   * Сохранение транзакции перевода между счетами
   */
  const saveTransferTransaction = async (data) => {
    const {
      amount,
      selectedBook,
      selectedAccount,
      destinationAccount,
      manualDestinationAmount
    } = data;

    try {
      // Получаем текущего пользователя
      const currentUser = userStore.currentUser;
      if (!currentUser) {
        throw new Error('Не найден авторизованный пользователь');
      }

      // Конвертируем сумму в число
      const amountValue = Math.abs(parseFloat(amount));
      
      // Получаем данные о выбранных счетах
      const sourceAccount = accountStore.getAccountById(selectedAccount);
      const destAccount = accountStore.getAccountById(destinationAccount);
      
      if (!sourceAccount || !destAccount) {
        throw new Error('Исходный или целевой счет не найден');
      }
      
      // При разных валютах используем введенную сумму назначения или конвертированную
      let destAmount = amountValue;
      if (sourceAccount.currency !== destAccount.currency && manualDestinationAmount) {
        destAmount = Math.abs(parseFloat(manualDestinationAmount));
      } else if (sourceAccount.currency !== destAccount.currency) {
        // Автоматическая конвертация, если не задана вручную
        const { convertedAmount } = currencyStore.convertAmount(
          amountValue, 
          sourceAccount.currency, 
          destAccount.currency
        );
        destAmount = convertedAmount;
      }
      
      // 1. Создаем транзакцию списания со счета-источника
      const withdrawalData = {
        date: new Date(),
        amount: -amountValue,
        currency: sourceAccount.currency,
        type: 'transfer',
        description: `Перевод на счет ${destAccount.name}`,
        sourceEntityId: sourceAccount.id,
        sourceEntityType: 'account',
        destinationEntityId: destAccount.id,
        destinationEntityType: 'account',
        executedByOwnerId: currentUser.id,
        responsibleOwnerIds: [currentUser.id],
        bookId: selectedBook
      };
      
      // 2. Создаем транзакцию пополнения счета-назначения
      const depositData = {
        date: new Date(),
        amount: destAmount,
        currency: destAccount.currency,
        type: 'transfer',
        description: `Перевод со счета ${sourceAccount.name}`,
        sourceEntityId: sourceAccount.id,
        sourceEntityType: 'account',
        destinationEntityId: destAccount.id,
        destinationEntityType: 'account',
        executedByOwnerId: currentUser.id,
        responsibleOwnerIds: [currentUser.id],
        bookId: selectedBook
      };
      
      // Добавляем транзакции через хранилище
      const withdrawal = await transactionStore.addTransaction(withdrawalData);
      const deposit = await transactionStore.addTransaction(depositData);
      
      // Обновляем балансы счетов
      if (withdrawal && deposit) {
        // Обновляем баланс счета-источника
        const newSourceBalance = sourceAccount.currentBalance - amountValue;
        await accountStore.updateAccountBalance(selectedAccount, newSourceBalance);
        
        // Обновляем баланс счета-назначения
        const newDestBalance = destAccount.currentBalance + destAmount;
        await accountStore.updateAccountBalance(destinationAccount, newDestBalance);
      }
      
      // Показываем уведомление об успехе
      messageService.success('Перевод между счетами успешно выполнен');
      
      return { withdrawal, deposit };
    } catch (error) {
      console.error('[useTransactionSaver] Ошибка при выполнении перевода:', error);
      messageService.error('Произошла ошибка при выполнении перевода');
      throw error;
    }
  };

  /**
   * Сохранение транзакции с долгом
   */
  const saveDebtTransaction = async (data) => {
    const {
      amount,
      selectedBook,
      selectedAccount,
      selectedCategory,
      distributionPercentage,
      distributionOwners,
      debtorId
    } = data;

    try {
      // Конвертируем сумму в число
      const amountValue = parseFloat(amount);
      const finalAmount = -Math.abs(amountValue); // Долги всегда отрицательные для плательщика
      
      // Получаем данные о выбранном счете
      const account = accountStore.getAccountById(selectedAccount);
      if (!account) {
        throw new Error(`Счет с ID ${selectedAccount} не найден`);
      }
      
      // Получаем данные о выбранной книге
      const book = bookStore.getBookById(selectedBook);
      if (!book) {
        throw new Error(`Книга с ID ${selectedBook} не найдена`);
      }
      
      // Получаем текущего пользователя
      const currentUser = userStore.currentUser;
      if (!currentUser) {
        throw new Error('Не найден авторизованный пользователь');
      }
      
      // Определяем описание транзакции
      let description = 'Транзакция с долгом';
      if (selectedCategory) {
        description = `Долг: ${selectedCategory.name}`;
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
        categoryId: selectedCategory?.id,
        description,
        sourceEntityId: selectedAccount,
        sourceEntityType: 'account',
        executedByOwnerId: currentUser.id,
        responsibleOwnerIds: [debtorId || distributionOwners[1]?.id], // По умолчанию второй владелец
        bookId: selectedBook
      };
      
      // Сохраняем транзакцию
      const savedTransaction = await transactionStore.addTransaction(transactionData);
      
      // Обновляем баланс счета
      if (savedTransaction) {
        // Обновляем баланс выбранного счета
        const newBalance = account.currentBalance + finalAmount;
        await accountStore.updateAccountBalance(selectedAccount, newBalance);
        
        // Создаем новый долг на основе транзакции
        const debtData = {
          amount: Math.abs(amountValue),
          currency: account.currency,
          type: 'internal',
          source: 'transaction',
          bookId: selectedBook,
          fromUserId: debtorId || distributionOwners[1]?.id, // Кто должен (выбранный в диалоге или второй владелец)
          toUserId: currentUser.id, // Кому должен (текущий пользователь)
          sourceTransactionId: savedTransaction.id,
          description: description || 'Долг по транзакции'
        };
        
        // Создаем долг в хранилище долгов
        const savedDebt = await debtStore.addDebt(debtData);
        console.log('[useTransactionSaver] Добавлен новый долг:', savedDebt);
      }
      
      // Показываем уведомление
      messageService.success('Транзакция с долгом успешно добавлена');
      
      return savedTransaction;
    } catch (error) {
      console.error('[useTransactionSaver] Ошибка при сохранении долга:', error);
      messageService.error('Произошла ошибка при сохранении долга');
      throw error;
    }
  };

  /**
   * Сохранение транзакции обмена валют
   */
  const saveExchangeTransaction = async (data) => {
    const {
      amount,
      selectedBook,
      selectedAccount,
      destinationAccount,
      manualDestinationAmount,
      exchangeRate
    } = data;

    try {
      // Получаем текущего пользователя
      const currentUser = userStore.currentUser;
      if (!currentUser) {
        throw new Error('Не найден авторизованный пользователь');
      }

      // Конвертируем сумму в число
      const amountValue = Math.abs(parseFloat(amount));
      
      // Получаем данные о выбранных счетах
      const sourceAccount = accountStore.getAccountById(selectedAccount);
      const destAccount = accountStore.getAccountById(destinationAccount);
      
      if (!sourceAccount || !destAccount) {
        throw new Error('Исходный или целевой счет не найден');
      }
      
      // Используем введенную вручную сумму или расчетную по курсу
      let destAmount = null;
      if (manualDestinationAmount) {
        destAmount = Math.abs(parseFloat(manualDestinationAmount));
      } else if (exchangeRate) {
        destAmount = amountValue * exchangeRate;
      } else {
        // Если курс не указан, используем данные из хранилища валют
        const { convertedAmount } = currencyStore.convertAmount(
          amountValue, 
          sourceAccount.currency, 
          destAccount.currency
        );
        destAmount = convertedAmount;
      }
      
      // 1. Создаем транзакцию списания со счета-источника
      const withdrawalData = {
        date: new Date(),
        amount: -amountValue,
        currency: sourceAccount.currency,
        type: 'exchange',
        description: `Обмен ${sourceAccount.currency} на ${destAccount.currency}`,
        sourceEntityId: sourceAccount.id,
        sourceEntityType: 'account',
        destinationEntityId: destAccount.id,
        destinationEntityType: 'account',
        executedByOwnerId: currentUser.id,
        responsibleOwnerIds: [currentUser.id],
        bookId: selectedBook
      };
      
      // 2. Создаем транзакцию пополнения счета-назначения
      const depositData = {
        date: new Date(),
        amount: destAmount,
        currency: destAccount.currency,
        type: 'exchange',
        description: `Обмен ${sourceAccount.currency} на ${destAccount.currency}`,
        sourceEntityId: sourceAccount.id,
        sourceEntityType: 'account',
        destinationEntityId: destAccount.id,
        destinationEntityType: 'account',
        executedByOwnerId: currentUser.id,
        responsibleOwnerIds: [currentUser.id],
        bookId: selectedBook
      };
      
      // Добавляем транзакции через хранилище
      const withdrawal = await transactionStore.addTransaction(withdrawalData);
      const deposit = await transactionStore.addTransaction(depositData);
      
      // Обновляем балансы счетов
      if (withdrawal && deposit) {
        // Обновляем баланс счета-источника
        const newSourceBalance = sourceAccount.currentBalance - amountValue;
        await accountStore.updateAccountBalance(selectedAccount, newSourceBalance);
        
        // Обновляем баланс счета-назначения
        const newDestBalance = destAccount.currentBalance + destAmount;
        await accountStore.updateAccountBalance(destinationAccount, newDestBalance);
      }
      
      // Показываем уведомление об успехе
      messageService.success('Обмен валюты успешно выполнен');
      
      return { withdrawal, deposit };
    } catch (error) {
      console.error('[useTransactionSaver] Ошибка при выполнении обмена валюты:', error);
      messageService.error('Произошла ошибка при выполнении обмена валюты');
      throw error;
    }
  };

  return {
    saveRegularTransaction,
    saveTransferTransaction,
    saveDebtTransaction,
    saveExchangeTransaction
  };
}
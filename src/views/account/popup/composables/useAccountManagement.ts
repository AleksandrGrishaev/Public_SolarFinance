// src/views/account/popup/composables/useAccountManagement.ts
import { ref, computed } from 'vue';
import { useAccountStore } from '../../../../stores/account';
import { useBookStore } from '../../../../stores/book';
import type { Account } from '../../../../stores/account/types';

/**
 * Хук для управления счетами
 */
export function useAccountManagement() {
  // Инициализация хранилищ
  const accountStore = useAccountStore();
  const bookStore = useBookStore();
  
  // Список счетов для выбранной книги
  const getAccountsByBookId = (bookId: string) => {
    return accountStore.getAccountsByBookId(bookId);
  };
  
  // Инициализация хранилищ
  const init = async () => {
    if (!bookStore.isInitialized) {
      await bookStore.init();
    }
    if (!accountStore.isInitialized) {
      await accountStore.init();
    }
  };
  
  // Добавление счета в книгу
  const addAccountToBook = async (accountId: string, bookId: string) => {
    try {
      return await accountStore.addAccountToBook(accountId, bookId);
    } catch (error) {
      console.error('[useAccountManagement] Error adding account to book:', error);
      return false;
    }
  };
  
  // Удаление счета из книги
  const removeAccountFromBook = async (accountId: string, bookId: string) => {
    try {
      return await accountStore.removeAccountFromBook(accountId, bookId);
    } catch (error) {
      console.error('[useAccountManagement] Error removing account from book:', error);
      return false;
    }
  };
  
  // Получение счета по ID
  const getAccountById = (accountId: string) => {
    return accountStore.getAccountById(accountId);
  };
  
  // Формирование счета для отображения
  const formatAccountBalance = (account: Account | string) => {
    if (typeof account === 'string') {
      const accountObj = accountStore.getAccountById(account);
      if (!accountObj) return '0';
      return accountStore.formatAccountBalance(accountObj.id);
    }
    return accountStore.formatAccountBalance(account.id);
  };
  
  return {
    // Хранилища
    accountStore,
    bookStore,
    
    // Методы для работы с книгами и счетами
    getAccountsByBookId,
    getAccountById,
    formatAccountBalance,
    
    // Методы инициализации
    init,
    
    // Методы для управления связями книг и счетов
    addAccountToBook,
    removeAccountFromBook
  };
}
// src/stores/transaction/transactionStore.ts
import { defineStore } from 'pinia';
import { TransactionService } from './transactionService';
import type { Transaction, TransactionFilterOptions, TransactionType } from './types';
import { useUserStore } from '../user';

export const useTransactionStore = defineStore('transaction', {
  state: () => ({
    transactions: [] as Transaction[],
    isInitialized: false,
    loading: false,
    currentFilters: {} as TransactionFilterOptions
  }),
  
  getters: {
    // Сервис для работы с транзакциями
    transactionService: () => new TransactionService(),
    
    // Сервис для работы с пользователями
    userStore: () => useUserStore(),
    
    // Получение всех типов транзакций
    transactionTypes(): Array<{ id: TransactionType, name: string }> {
      return [
        { id: 'income', name: 'Income' },
        { id: 'expense', name: 'Expense' },
        { id: 'transfer', name: 'Transfer' }
      ];
    },
    
    // Получение транзакций с применением фильтров
    filteredTransactions(): Transaction[] {
      let result = [...this.transactions];
      const filters = this.currentFilters;
      
      // Применяем фильтры
      if (filters.dateFrom) {
        // Явное преобразование обеих дат в миллисекунды для точного сравнения
        result = result.filter(t => 
          new Date(t.date).getTime() >= new Date(filters.dateFrom!).getTime());
      }
      
      if (filters.dateTo) {
        // Явное преобразование обеих дат в миллисекунды для точного сравнения
        result = result.filter(t => 
          new Date(t.date).getTime() <= new Date(filters.dateTo!).getTime());
      }
      
      if (filters.types && filters.types.length > 0) {
        result = result.filter(t => filters.types!.includes(t.type));
      }
      
      if (filters.bookIds && filters.bookIds.length > 0) {
        result = result.filter(t => filters.bookIds!.includes(t.bookId));
      }
      
      if (filters.categoryIds && filters.categoryIds.length > 0) {
        result = result.filter(t => t.categoryId && filters.categoryIds!.includes(t.categoryId));
      }
      
      if (filters.searchTerm) {
        const searchTermLower = filters.searchTerm.toLowerCase();
        result = result.filter(t => {
          return t.description && t.description.toLowerCase().includes(searchTermLower);
        });
      }
      
      return result;
    },
    
    // Получение отфильтрованных транзакций по типу
    getTransactionsByType: (state) => (type: TransactionType): Transaction[] => {
      return state.filteredTransactions.filter(t => t.type === type);
    },
    
    // Получение отфильтрованных транзакций по книге
    getTransactionsByBook: (state) => (bookId: string): Transaction[] => {
      return state.filteredTransactions.filter(t => t.bookId === bookId);
    },
    
    // Получение транзакции по ID
    getTransactionById: (state) => (id: string): Transaction | undefined => {
      return state.transactions.find(t => t.id === id);
    },
    
    // Получение пользовательских транзакций
    getUserTransactions(): Transaction[] {
      const currentUserId = this.userStore.currentUser?.id;
      if (!currentUserId) return [];
      
      return this.filteredTransactions.filter(t => 
        t.executedByOwnerId === currentUserId || 
        t.responsibleOwnerIds.includes(currentUserId)
      );
    }
  },
  
  actions: {
    /**
     * Инициализация хранилища транзакций
     */
    async init() {
      if (this.isInitialized) return;
      
      try {
        this.loading = true;
        console.log('[TransactionStore] Initializing transaction store');
        
        // Создаем транзакции по умолчанию, если их нет
        await this.transactionService.ensureDefaultTransactions();
        
        // Загружаем все транзакции
        const transactions = await this.transactionService.getTransactions();
        this.transactions = transactions;
        
        this.isInitialized = true;
        console.log('[TransactionStore] Initialized with', transactions.length, 'transactions');
        return true;
      } catch (error) {
        console.error('[TransactionStore] Initialization error:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Установка фильтров
     */
    setFilters(filters: TransactionFilterOptions) {
      this.currentFilters = { ...filters };
    },
    
    /**
     * Сброс фильтров
     */
    resetFilters() {
      this.currentFilters = {};
    },
    
    /**
     * Добавление фильтра
     */
    addFilter(key: keyof TransactionFilterOptions, value: any) {
      this.currentFilters = { ...this.currentFilters, [key]: value };
    },
    
    /**
     * Добавление новой транзакции
     */
    async addTransaction(transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
      try {
        this.loading = true;
        
        // Добавляем исполнителя транзакции, если он не указан
        if (!transactionData.executedByOwnerId) {
          const currentUserId = this.userStore.currentUser?.id;
          if (currentUserId) {
            transactionData.executedByOwnerId = currentUserId;
          }
        }
        
        // Добавляем транзакцию через сервис
        const newTransaction = await this.transactionService.addTransaction(transactionData);
        this.transactions.push(newTransaction);
        
        return newTransaction;
      } catch (error) {
        console.error('[TransactionStore] Error adding transaction:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Обновление транзакции
     */
    async updateTransaction(id: string, transactionData: Partial<Transaction>): Promise<boolean> {
      try {
        this.loading = true;
        
        // Получаем старую версию транзакции для сравнения
        const oldTransaction = this.getTransactionById(id);
        if (!oldTransaction) {
          console.error(`[TransactionStore] Transaction with id ${id} not found`);
          return false;
        }
        
        // Обновляем транзакцию через сервис
        const success = await this.transactionService.updateTransaction(id, transactionData);
        
        if (success) {
          // Обновляем транзакцию в локальном состоянии
          const index = this.transactions.findIndex(t => t.id === id);
          if (index !== -1) {
            this.transactions[index] = {
              ...oldTransaction,
              ...transactionData,
              updatedAt: new Date()
            };
          }
        }
        
        return success;
      } catch (error) {
        console.error(`[TransactionStore] Error updating transaction ${id}:`, error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Удаление транзакции
     */
    async deleteTransaction(id: string): Promise<boolean> {
      try {
        this.loading = true;
        
        // Удаляем транзакцию через сервис
        const success = await this.transactionService.deleteTransaction(id);
        
        if (success) {
          // Удаляем транзакцию из локального состояния
          this.transactions = this.transactions.filter(t => t.id !== id);
        }
        
        return success;
      } catch (error) {
        console.error(`[TransactionStore] Error deleting transaction ${id}:`, error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Обновление всех данных транзакций (для синхронизации)
     */
    async refreshTransactions(): Promise<void> {
      try {
        this.loading = true;
        const transactions = await this.transactionService.getTransactions();
        this.transactions = transactions;
        console.log('[TransactionStore] Transactions refreshed');
      } catch (error) {
        console.error('[TransactionStore] Error refreshing transactions:', error);
      } finally {
        this.loading = false;
      }
    }
  }
});
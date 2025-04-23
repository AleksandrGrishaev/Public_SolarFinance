// src/stores/debt/debtStore.ts
import { defineStore } from 'pinia';
import { DebtService } from './debtService';
import type { Debt, DebtPayment, DebtStatus, DebtFilterOptions, NewDebtPayload } from './types';
import { useUserStore } from '../user';
import { useBookStore } from '../book';
import { useCurrencyStore } from '../currency';
import { useTransactionStore } from '../transaction';

export const useDebtStore = defineStore('debt', {
  state: () => ({
    debts: [] as Debt[],
    isInitialized: false,
    loading: false,
    currentFilters: {} as DebtFilterOptions
  }),
  
  getters: {
    // Сервис для работы с долгами
    debtService: () => new DebtService(),
    
    // Связанные хранилища
    userStore: () => useUserStore(),
    bookStore: () => useBookStore(),
    currencyStore: () => useCurrencyStore(),
    transactionStore: () => useTransactionStore(),
    
    // Получение активных долгов (не оплаченных и не отмененных)
    activeDebts(): Debt[] {
      return this.debts.filter(debt => 
        debt.status === 'active' || debt.status === 'partially_paid'
      );
    },
    
    // Получение долгов с применением фильтров
    filteredDebts(): Debt[] {
      let result = [...this.debts];
      const filters = this.currentFilters;
      
      // Фильтрация по статусу
      if (filters.status && filters.status.length > 0) {
        result = result.filter(debt => filters.status!.includes(debt.status));
      }
      
      // Фильтрация по типу
      if (filters.type && filters.type.length > 0) {
        result = result.filter(debt => filters.type!.includes(debt.type));
      }
      
      // Фильтрация по должнику
      if (filters.fromUserId) {
        result = result.filter(debt => debt.fromUserId === filters.fromUserId);
      }
      
      // Фильтрация по кредитору
      if (filters.toUserId) {
        result = result.filter(debt => debt.toUserId === filters.toUserId);
      }
      
      // Фильтрация по книге
      if (filters.bookId && filters.bookId.length > 0) {
        result = result.filter(debt => filters.bookId!.includes(debt.bookId));
      }
      
      // Фильтрация по дате создания
      if (filters.dateFrom) {
        result = result.filter(debt => 
          new Date(debt.createdAt).getTime() >= new Date(filters.dateFrom!).getTime()
        );
      }
      
      if (filters.dateTo) {
        result = result.filter(debt => 
          new Date(debt.createdAt).getTime() <= new Date(filters.dateTo!).getTime()
        );
      }
      
      // Фильтрация по сумме
      if (filters.amountMin !== undefined) {
        result = result.filter(debt => debt.amount >= filters.amountMin!);
      }
      
      if (filters.amountMax !== undefined) {
        result = result.filter(debt => debt.amount <= filters.amountMax!);
      }
      
      return result;
    },
    
    // Долги текущего пользователя (где он должен)
    currentUserDebts(): Debt[] {
      const currentUserId = this.userStore.currentUser?.id;
      if (!currentUserId) return [];
      
      return this.activeDebts.filter(debt => debt.fromUserId === currentUserId);
    },
    
    // Долги текущему пользователю (где ему должны)
    debtsToCurrentUser(): Debt[] {
      const currentUserId = this.userStore.currentUser?.id;
      if (!currentUserId) return [];
      
      return this.activeDebts.filter(debt => debt.toUserId === currentUserId);
    },
    
    // Получение общей суммы долга пользователя другому пользователю
    getUserToUserDebtAmount(): (fromUserId: string, toUserId: string, currency: string) => number {
      return (fromUserId: string, toUserId: string, currency: string) => {
        const relevantDebts = this.activeDebts.filter(debt => 
          debt.fromUserId === fromUserId && 
          debt.toUserId === toUserId &&
          debt.currency === currency
        );
        
        return relevantDebts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
      };
    },
    
    // Получение баланса долгов между пользователями (с взаимным учетом)
    getUserDebtBalance(): (userId1: string, userId2: string, currency: string) => number {
      return (userId1: string, userId2: string, currency: string) => {
        const user1OwesToUser2 = this.getUserToUserDebtAmount(userId1, userId2, currency);
        const user2OwesToUser1 = this.getUserToUserDebtAmount(userId2, userId1, currency);
        
        return user2OwesToUser1 - user1OwesToUser2;
      };
    },
    
    // Получение общего баланса долгов текущего пользователя
    currentUserDebtBalance(): Record<string, number> {
      const currentUserId = this.userStore.currentUser?.id;
      if (!currentUserId) return {};
      
      // Группируем долги по валютам
      const balanceByCurrency: Record<string, number> = {};
      
      // Долги, которые текущий пользователь должен
      for (const debt of this.currentUserDebts) {
        if (!balanceByCurrency[debt.currency]) {
          balanceByCurrency[debt.currency] = 0;
        }
        balanceByCurrency[debt.currency] -= debt.remainingAmount;
      }
      
      // Долги текущему пользователю
      for (const debt of this.debtsToCurrentUser) {
        if (!balanceByCurrency[debt.currency]) {
          balanceByCurrency[debt.currency] = 0;
        }
        balanceByCurrency[debt.currency] += debt.remainingAmount;
      }
      
      return balanceByCurrency;
    },
    
    // Форматированный баланс долгов с учетом валют
    formattedDebtBalance(): Record<string, string> {
      const balance = this.currentUserDebtBalance;
      const formatted: Record<string, string> = {};
      
      for (const [currency, amount] of Object.entries(balance)) {
        formatted[currency] = this.currencyStore.formatCurrency(amount, currency);
      }
      
      return formatted;
    }
  },
  
  actions: {
    /**
     * Инициализация хранилища долгов
     */
    async init() {
      if (this.isInitialized) return;
      
      try {
        this.loading = true;
        console.log('[DebtStore] Initializing debt store');
        
        // Создаем долги по умолчанию, если их нет
        await this.debtService.ensureDefaultDebts();
        
        // Загружаем все долги
        const debts = await this.debtService.getDebts();
        this.debts = debts;
        
        this.isInitialized = true;
        console.log('[DebtStore] Initialized with', debts.length, 'debts');
        return true;
      } catch (error) {
        console.error('[DebtStore] Initialization error:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Установка фильтров
     */
    setFilters(filters: DebtFilterOptions) {
      this.currentFilters = { ...filters };
    },
    
    /**
     * Сброс фильтров
     */
    resetFilters() {
      this.currentFilters = {};
    },
    
    /**
     * Добавление нового долга
     */
    async addDebt(debtData: NewDebtPayload): Promise<Debt> {
      try {
        this.loading = true;
        const newDebt = await this.debtService.addDebt(debtData);
        this.debts.push(newDebt);
        return newDebt;
      } catch (error) {
        console.error('[DebtStore] Error adding debt:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Создание долга на основе транзакции с распределением
     */
    async createDebtFromTransaction(transactionId: string): Promise<Debt | null> {
      try {
        this.loading = true;
        
        // Получаем данные о транзакции
        const transaction = this.transactionStore.getTransactionById(transactionId);
        if (!transaction) {
          console.error(`[DebtStore] Transaction with id ${transactionId} not found`);
          return null;
        }
        
        // Проверяем, что это транзакция с распределением
        if (!transaction.distributionRules || transaction.distributionRules.length < 2) {
          console.error(`[DebtStore] Transaction ${transactionId} has no distribution rules`);
          return null;
        }
        
        // Вычисляем распределение задолженности
        const distribution = transaction.distributionRules;
        
        // Получаем исполнителя транзакции (кто заплатил)
        const executorId = transaction.executedByOwnerId;
        
        // Для тестирования: можем просто использовать первые два правила распределения
        const rule1 = distribution[0];
        const rule2 = distribution[1];
        
        // Вычисляем сумму долга на основе распределения
        // (предполагаем, что сумма отрицательная для расходов)
        const totalAmount = Math.abs(transaction.amount);
        const amount1 = totalAmount * (rule1.percentage / 100);
        const amount2 = totalAmount * (rule2.percentage / 100);
        
        // Определяем направление долга
        let fromUserId, toUserId, debtAmount;
        
        // Если транзакцию выполнил первый пользователь
        if (executorId === rule1.ownerId) {
          // Второй пользователь должен первому свою долю
          fromUserId = rule2.ownerId;
          toUserId = rule1.ownerId;
          debtAmount = amount2; // Сумма, которую должен второй пользователь
        } else {
          // Первый пользователь должен второму свою долю
          fromUserId = rule1.ownerId;
          toUserId = rule2.ownerId;
          debtAmount = amount1; // Сумма, которую должен первый пользователь
        }
        
        // Создаем новый долг
        const debtData: NewDebtPayload = {
          amount: debtAmount,
          currency: transaction.currency,
          type: 'internal',
          source: 'transaction',
          bookId: transaction.bookId,
          fromUserId,
          toUserId,
          sourceTransactionId: transactionId,
          description: `Долг по транзакции: ${transaction.description || 'Без описания'}`
        };
        
        return await this.addDebt(debtData);
      } catch (error) {
        console.error('[DebtStore] Error creating debt from transaction:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Обновление долга
     */
    async updateDebt(id: string, debtData: Partial<Debt>): Promise<boolean> {
      try {
        this.loading = true;
        const success = await this.debtService.updateDebt(id, debtData);
        
        if (success) {
          // Обновляем долг в локальном состоянии
          const index = this.debts.findIndex(debt => debt.id === id);
          if (index !== -1) {
            this.debts[index] = { ...this.debts[index], ...debtData, updatedAt: new Date() };
          }
        }
        
        return success;
      } catch (error) {
        console.error(`[DebtStore] Error updating debt ${id}:`, error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Удаление долга
     */
    async deleteDebt(id: string): Promise<boolean> {
      try {
        this.loading = true;
        const success = await this.debtService.deleteDebt(id);
        
        if (success) {
          // Удаляем долг из локального состояния
          this.debts = this.debts.filter(debt => debt.id !== id);
        }
        
        return success;
      } catch (error) {
        console.error(`[DebtStore] Error deleting debt ${id}:`, error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Добавление платежа по долгу
     */
    async addPayment(debtId: string, payment: Omit<DebtPayment, 'id' | 'debtId'>): Promise<boolean> {
      try {
        this.loading = true;
        const success = await this.debtService.addDebtPayment(debtId, payment);
        
        if (success) {
          // Обновляем данные долга
          await this.refreshDebts();
        }
        
        return success;
      } catch (error) {
        console.error(`[DebtStore] Error adding payment to debt ${debtId}:`, error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Отмена долга
     */
    async cancelDebt(id: string, reason?: string): Promise<boolean> {
      try {
        this.loading = true;
        const success = await this.debtService.cancelDebt(id, reason);
        
        if (success) {
          // Обновляем состояние долга в локальном состоянии
          const index = this.debts.findIndex(debt => debt.id === id);
          if (index !== -1) {
            this.debts[index] = { 
              ...this.debts[index], 
              status: 'cancelled',
              description: reason ? `${reason} (отменен)` : 'Долг отменен',
              updatedAt: new Date()
            };
          }
        }
        
        return success;
      } catch (error) {
        console.error(`[DebtStore] Error cancelling debt ${id}:`, error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Обновление всех данных долгов (для синхронизации)
     */
    async refreshDebts(): Promise<void> {
      try {
        this.loading = true;
        const debts = await this.debtService.getDebts();
        this.debts = debts;
        console.log('[DebtStore] Debts refreshed');
      } catch (error) {
        console.error('[DebtStore] Error refreshing debts:', error);
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Получение долгов между пользователями
     */
    getDebtsBetweenUsers(user1Id: string, user2Id: string): Debt[] {
      return this.activeDebts.filter(debt => 
        (debt.fromUserId === user1Id && debt.toUserId === user2Id) ||
        (debt.fromUserId === user2Id && debt.toUserId === user1Id)
      );
    },
    
    /**
     * Взаимозачет долгов между пользователями
     * Если пользователи должны друг другу, создается один результирующий долг
     */
    async offsetDebtsBetweenUsers(user1Id: string, user2Id: string, currency: string): Promise<boolean> {
      try {
        this.loading = true;
        
        // Получаем все активные долги между пользователями
        const debts = this.getDebtsBetweenUsers(user1Id, user2Id)
          .filter(debt => debt.currency === currency);
        
        if (debts.length < 2) {
          console.log(`[DebtStore] Not enough debts to offset between users ${user1Id} and ${user2Id}`);
          return false;
        }
        
        // Вычисляем суммы долгов в каждом направлении
        const user1OwesToUser2 = this.getUserToUserDebtAmount(user1Id, user2Id, currency);
        const user2OwesToUser1 = this.getUserToUserDebtAmount(user2Id, user1Id, currency);
        
        // Если обе суммы равны 0, нечего зачитывать
        if (user1OwesToUser2 === 0 && user2OwesToUser1 === 0) {
          return false;
        }
        
        // Определяем результирующее направление и сумму долга
        let fromUserId, toUserId, debtAmount;
        
        if (user1OwesToUser2 > user2OwesToUser1) {
          // Пользователь 1 в итоге должен пользователю 2
          fromUserId = user1Id;
          toUserId = user2Id;
          debtAmount = user1OwesToUser2 - user2OwesToUser1;
        } else if (user2OwesToUser1 > user1OwesToUser2) {
          // Пользователь 2 в итоге должен пользователю 1
          fromUserId = user2Id;
          toUserId = user1Id;
          debtAmount = user2OwesToUser1 - user1OwesToUser2;
        } else {
          // Долги равны, можно просто отметить все как оплаченные
          debtAmount = 0;
        }
        
        // Получаем имена пользователей для описания
        const user1Name = this.userStore.users.find(u => u.id === user1Id)?.name || user1Id;
        const user2Name = this.userStore.users.find(u => u.id === user2Id)?.name || user2Id;
        
        // Отмечаем все существующие долги как оплаченные
        for (const debt of debts) {
          await this.updateDebt(debt.id, {
            status: 'paid',
            description: `${debt.description} (взаимозачет)`,
            remainingAmount: 0,
            updatedAt: new Date()
          });
        }
        
        // Если после взаимозачета остался долг, создаем новый
        if (debtAmount > 0) {
          const newDebtData: NewDebtPayload = {
            amount: debtAmount,
            currency,
            type: 'internal',
            source: 'manual',
            bookId: debts[0].bookId, // Используем книгу из первого долга
            fromUserId,
            toUserId,
            description: `Взаимозачет долгов между ${user1Name} и ${user2Name}`
          };
          
          await this.addDebt(newDebtData);
        }
        
        return true;
      } catch (error) {
        console.error(`[DebtStore] Error offsetting debts between users ${user1Id} and ${user2Id}:`, error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Получение долга по транзакции
     */
    getDebtByTransactionId(transactionId: string): Debt | undefined {
      return this.debts.find(debt => debt.sourceTransactionId === transactionId);
    },
    
    /**
     * Проверка, существует ли долг по транзакции
     */
    hasDebtForTransaction(transactionId: string): boolean {
      return this.debts.some(debt => debt.sourceTransactionId === transactionId);
    }
  }
});
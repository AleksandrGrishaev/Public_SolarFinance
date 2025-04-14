// src/stores/account/accountStore.ts
import { defineStore } from 'pinia';
import { AccountService } from './accountService';
import type { Account, AccountType } from './types';

export const useAccountStore = defineStore('account', {
  state: () => ({
    accounts: [] as Account[],
    isInitialized: false,
    loading: false
  }),
  
  getters: {
    // Сервис для работы со счетами
    accountService: () => new AccountService(),
    
    // Получение всех активных счетов
    activeAccounts(): Account[] {
      return this.accounts.filter(account => account.isActive);
    },
    
    // Получение счетов по типу
    getAccountsByType(): (type: AccountType) => Account[] {
      return (type: AccountType) => this.accounts.filter(account => account.type === type);
    },
    
    // Получение счетов по ID владельца
    getAccountsByOwnerId(): (ownerId: string) => Account[] {
      return (ownerId: string) => this.accounts.filter(account => account.ownerId === ownerId);
    },
    
    // Получение счета по ID
    getAccountById(): (id: string) => Account | undefined {
      return (id: string) => this.accounts.find(account => account.id === id);
    },
    
    // Общий баланс всех счетов в базовой валюте
    // (в реальном приложении здесь должна быть конвертация валют)
    totalBalance(): number {
      return this.accounts.reduce((sum, account) => sum + account.currentBalance, 0);
    }
  },
  
  actions: {
    /**
     * Инициализация хранилища счетов
     */
    async init() {
      if (this.isInitialized) return;
      
      try {
        this.loading = true;
        console.log('[AccountStore] Initializing account store');
        
        // Создаем счета по умолчанию, если их нет
        await this.accountService.ensureDefaultAccounts();
        
        // Загружаем все счета
        const accounts = await this.accountService.getAccounts();
        this.accounts = accounts;
        
        this.isInitialized = true;
        console.log('[AccountStore] Initialized with', accounts.length, 'accounts');
        return true;
      } catch (error) {
        console.error('[AccountStore] Initialization error:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Добавление нового счета
     */
    async addAccount(accountData: Omit<Account, 'id'>): Promise<Account> {
      try {
        this.loading = true;
        const newAccount = await this.accountService.addAccount(accountData);
        this.accounts.push(newAccount);
        return newAccount;
      } catch (error) {
        console.error('[AccountStore] Error adding account:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Обновление счета
     */
    async updateAccount(id: string, accountData: Partial<Account>): Promise<boolean> {
      try {
        this.loading = true;
        const success = await this.accountService.updateAccount(id, accountData);
        
        if (success) {
          // Обновляем счет в локальном состоянии
          const index = this.accounts.findIndex(account => account.id === id);
          if (index !== -1) {
            this.accounts[index] = { ...this.accounts[index], ...accountData, updatedAt: new Date() };
          }
        }
        
        return success;
      } catch (error) {
        console.error(`[AccountStore] Error updating account ${id}:`, error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Удаление счета
     */
    async deleteAccount(id: string): Promise<boolean> {
      try {
        this.loading = true;
        const success = await this.accountService.deleteAccount(id);
        
        if (success) {
          // Удаляем счет из локального состояния
          this.accounts = this.accounts.filter(account => account.id !== id);
        }
        
        return success;
      } catch (error) {
        console.error(`[AccountStore] Error deleting account ${id}:`, error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Обновление баланса счета
     */
    async updateAccountBalance(id: string, newBalance: number): Promise<boolean> {
      try {
        this.loading = true;
        const success = await this.accountService.updateAccountBalance(id, newBalance);
        
        if (success) {
          // Обновляем баланс счета в локальном состоянии
          const index = this.accounts.findIndex(account => account.id === id);
          if (index !== -1) {
            this.accounts[index].currentBalance = newBalance;
            this.accounts[index].updatedAt = new Date();
          }
        }
        
        return success;
      } catch (error) {
        console.error(`[AccountStore] Error updating account ${id} balance:`, error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Установка активности счета
     */
    async setAccountActive(id: string, isActive: boolean): Promise<boolean> {
      return this.updateAccount(id, { isActive });
    },
    
    /**
     * Обновление всех данных счетов (для синхронизации)
     */
    async refreshAccounts(): Promise<void> {
      try {
        this.loading = true;
        const accounts = await this.accountService.getAccounts();
        this.accounts = accounts;
        console.log('[AccountStore] Accounts refreshed');
      } catch (error) {
        console.error('[AccountStore] Error refreshing accounts:', error);
      } finally {
        this.loading = false;
      }
    }
  }
});
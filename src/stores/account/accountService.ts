// src/stores/account/accountService.ts
import type { Account } from './types';
import { defaultAccounts } from './defaultAccounts';
import { LocalStorageApiService } from '@/services/api/LocalStorageApiService';

export class AccountService {
  private apiService: LocalStorageApiService;
  private readonly STORAGE_KEY = 'family-finance-app_accounts';

  constructor() {
    this.apiService = new LocalStorageApiService();
  }

  /**
   * Получение всех счетов
   */
  async getAccounts(): Promise<Account[]> {
    try {
      return await this.apiService.get<Account[]>('/accounts');
    } catch (error) {
      console.error('[AccountService] Error getting accounts:', error);
      return [];
    }
  }

  /**
   * Получение счета по ID
   */
  async getAccountById(id: string): Promise<Account | null> {
    try {
      return await this.apiService.get<Account>(`/accounts/${id}`);
    } catch (error) {
      console.error(`[AccountService] Error getting account with id ${id}:`, error);
      return null;
    }
  }

  /**
   * Получение счетов по ID владельца
   */
  async getAccountsByOwnerId(ownerId: string): Promise<Account[]> {
    try {
      const accounts = await this.getAccounts();
      return accounts.filter(account => account.ownerId === ownerId);
    } catch (error) {
      console.error(`[AccountService] Error getting accounts for owner ${ownerId}:`, error);
      return [];
    }
  }

  /**
   * Добавление нового счета
   */
  async addAccount(newAccount: Omit<Account, 'id'>): Promise<Account> {
    const accounts = await this.getAccounts();
    // Генерируем уникальный ID (в реальном приложении можно использовать UUID)
    const id = `account_${Date.now()}`;
    
    const accountWithId = { ...newAccount, id };
    
    try {
      await this.apiService.post('/accounts', accountWithId);
      console.log('[AccountService] Account added:', accountWithId.name);
      return accountWithId;
    } catch (error) {
      console.error('[AccountService] Error adding account:', error);
      throw error;
    }
  }

  /**
   * Обновление счета
   */
  async updateAccount(id: string, accountData: Partial<Account>): Promise<boolean> {
    try {
      await this.apiService.put(`/accounts/${id}`, accountData);
      console.log('[AccountService] Account updated:', id);
      return true;
    } catch (error) {
      console.error(`[AccountService] Error updating account ${id}:`, error);
      return false;
    }
  }

  /**
   * Удаление счета
   */
  async deleteAccount(id: string): Promise<boolean> {
    try {
      await this.apiService.delete(`/accounts/${id}`);
      console.log('[AccountService] Account deleted:', id);
      return true;
    } catch (error) {
      console.error(`[AccountService] Error deleting account ${id}:`, error);
      return false;
    }
  }

  /**
   * Обновление баланса счета
   */
  async updateAccountBalance(id: string, newBalance: number): Promise<boolean> {
    try {
      await this.apiService.put(`/accounts/${id}`, {
        currentBalance: newBalance,
        updatedAt: new Date()
      });
      console.log(`[AccountService] Account ${id} balance updated to ${newBalance}`);
      return true;
    } catch (error) {
      console.error(`[AccountService] Error updating account ${id} balance:`, error);
      return false;
    }
  }

  /**
   * Создание счетов по умолчанию, если нет ни одного
   */
  async ensureDefaultAccounts(): Promise<void> {
    const accounts = await this.getAccounts();
    
    if (accounts.length === 0) {
      // Используем счета из defaultAccounts.ts
      for (const account of defaultAccounts) {
        await this.apiService.post('/accounts', account);
      }
      console.log('[AccountService] Created default accounts');
    }
  }
}
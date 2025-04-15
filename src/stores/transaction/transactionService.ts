// src/stores/transaction/transactionService.ts
import type { Transaction } from './types';
import { LocalStorageApiService } from '@/services/api/LocalStorageApiService';
import { defaultTransactions } from './defaultTransactions';

export class TransactionService {
  private apiService: LocalStorageApiService;
  
  constructor() {
    this.apiService = new LocalStorageApiService();
  }

  /**
   * Получение всех транзакций
   */
  async getTransactions(): Promise<Transaction[]> {
    try {
      return await this.apiService.get<Transaction[]>('/transactions');
    } catch (error) {
      console.error('[TransactionService] Error getting transactions:', error);
      return [];
    }
  }

  /**
   * Получение транзакции по ID
   */
  async getTransactionById(id: string): Promise<Transaction | null> {
    try {
      return await this.apiService.get<Transaction>(`/transactions/${id}`);
    } catch (error) {
      console.error(`[TransactionService] Error getting transaction with id ${id}:`, error);
      return null;
    }
  }

  /**
   * Добавление новой транзакции
   */
  async addTransaction(newTransaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const id = `transaction_${Date.now()}`;
    const now = new Date();
    
    const transactionWithId: Transaction = {
      ...newTransaction,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    try {
      await this.apiService.post('/transactions', transactionWithId);
      console.log('[TransactionService] Transaction added:', id);
      return transactionWithId;
    } catch (error) {
      console.error('[TransactionService] Error adding transaction:', error);
      throw error;
    }
  }

  /**
   * Обновление транзакции
   */
  async updateTransaction(id: string, transactionData: Partial<Transaction>): Promise<boolean> {
    try {
      await this.apiService.put(`/transactions/${id}`, transactionData);
      console.log('[TransactionService] Transaction updated:', id);
      return true;
    } catch (error) {
      console.error(`[TransactionService] Error updating transaction ${id}:`, error);
      return false;
    }
  }

  /**
   * Удаление транзакции
   */
  async deleteTransaction(id: string): Promise<boolean> {
    try {
      await this.apiService.delete(`/transactions/${id}`);
      console.log('[TransactionService] Transaction deleted:', id);
      return true;
    } catch (error) {
      console.error(`[TransactionService] Error deleting transaction ${id}:`, error);
      return false;
    }
  }

  /**
   * Создание транзакций по умолчанию, если нет ни одной
   */
  async ensureDefaultTransactions(): Promise<void> {
    const transactions = await this.getTransactions();
    
    if (transactions.length === 0) {
      // Используем транзакции из defaultTransactions.ts
      for (const transaction of defaultTransactions) {
        await this.apiService.post('/transactions', transaction);
      }
      console.log('[TransactionService] Created default transactions');
    }
  }
}
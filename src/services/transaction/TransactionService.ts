// src/services/transaction/TransactionService.ts
import { 
    type Transaction, 
    TransactionType,
    type CustomCategory,
    DefaultTransactionCategory
  } from '@/types';
  import { BaseCrudServiceImpl } from '../BaseCrudService';
  import type { ApiService } from '../api/ApiService';
  import { FinanceService } from '../finance/FinanceService';
  
  /**
   * Сервис для работы с пользовательскими категориями
   */
  export class CategoryService extends BaseCrudServiceImpl<CustomCategory> {
    protected entityName: string = 'categories';
    
    /**
     * Получение категорий пользователя
     */
    async getCategoriesByUserId(userId: string): Promise<CustomCategory[]> {
      // В этой упрощенной реализации считаем, что все категории доступны всем пользователям
      return this.getAll();
    }
  
    /**
     * Создание новой категории
     */
    async createCategory(
      name: string, 
      icon: string, 
      color: string, 
      parentCategory?: DefaultTransactionCategory | string
    ): Promise<CustomCategory> {
      const newCategory: Omit<CustomCategory, 'id' | 'createdAt' | 'updatedAt'> = {
        name,
        icon,
        color,
        parentCategory
      };
      
      return this.create(newCategory);
    }
  }
  
  /**
   * Сервис для работы с транзакциями
   */
  export class TransactionService extends BaseCrudServiceImpl<Transaction> {
    protected entityName: string = 'transactions';
    private financeService: FinanceService;
    private categoryService: CategoryService;
    
    constructor(apiService: ApiService, financeService: FinanceService) {
      super(apiService);
      this.financeService = financeService;
      this.categoryService = new CategoryService(apiService);
    }
  
    /**
     * Получить доступ к сервису категорий
     */
    get categories() {
      return this.categoryService;
    }
    
    /**
     * Создание транзакции дохода
     */
    async createIncomeTransaction(
      amount: number, 
      currency: string, 
      category: DefaultTransactionCategory | string,
      description: string,
      destinationId: string,
      destinationType: 'accounts' | 'cash',
      createdBy: string,
      date: Date = new Date()
    ): Promise<Transaction> {
      const transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
        type: TransactionType.INCOME,
        amount,
        currency,
        category,
        description,
        date,
        destinationId,
        destinationType,
        createdBy
      };
      
      // Создаем транзакцию
      const newTransaction = await this.create(transaction);
      
      // Обновляем баланс/сумму
      if (destinationType === 'accounts') {
        await this.financeService.accounts.updateBalance(destinationId, amount);
      } else if (destinationType === 'cash') {
        await this.financeService.cash.updateAmount(destinationId, amount);
      }
      
      return newTransaction;
    }
    
    /**
     * Создание транзакции расхода
     */
    async createExpenseTransaction(
      amount: number, 
      currency: string, 
      category: DefaultTransactionCategory | string,
      description: string,
      sourceId: string,
      sourceType: 'accounts' | 'cash',
      createdBy: string,
      date: Date = new Date()
    ): Promise<Transaction> {
      const transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
        type: TransactionType.EXPENSE,
        amount,
        currency,
        category,
        description,
        date,
        sourceId,
        sourceType,
        createdBy
      };
      
      // Создаем транзакцию
      const newTransaction = await this.create(transaction);
      
      // Обновляем баланс/сумму (уменьшаем)
      if (sourceType === 'accounts') {
        await this.financeService.accounts.updateBalance(sourceId, -amount);
      } else if (sourceType === 'cash') {
        await this.financeService.cash.updateAmount(sourceId, -amount);
      }
      
      return newTransaction;
    }
    
    /**
     * Создание транзакции перевода
     */
    async createTransferTransaction(
      amount: number, 
      currency: string, 
      description: string,
      sourceId: string,
      sourceType: 'accounts' | 'cash',
      destinationId: string,
      destinationType: 'accounts' | 'cash',
      createdBy: string,
      date: Date = new Date()
    ): Promise<Transaction> {
      const transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
        type: TransactionType.TRANSFER,
        amount,
        currency,
        category: DefaultTransactionCategory.OTHER, // Для переводов используем категорию OTHER
        description,
        date,
        sourceId,
        sourceType,
        destinationId,
        destinationType,
        createdBy
      };
      
      // Создаем транзакцию
      const newTransaction = await this.create(transaction);
      
      // Обновляем баланс/сумму источника (уменьшаем)
      if (sourceType === 'accounts') {
        await this.financeService.accounts.updateBalance(sourceId, -amount);
      } else if (sourceType === 'cash') {
        await this.financeService.cash.updateAmount(sourceId, -amount);
      }
      
      // Обновляем баланс/сумму получателя (увеличиваем)
      if (destinationType === 'accounts') {
        await this.financeService.accounts.updateBalance(destinationId, amount);
      } else if (destinationType === 'cash') {
        await this.financeService.cash.updateAmount(destinationId, amount);
      }
      
      return newTransaction;
    }
    
    /**
     * Получение транзакций пользователя
     */
    async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
      const transactions = await this.getAll();
      return transactions.filter(transaction => transaction.createdBy === userId);
    }
    
    /**
     * Получение транзакций по счету
     */
    async getTransactionsByAccountId(accountId: string): Promise<Transaction[]> {
      const transactions = await this.getAll();
      return transactions.filter(transaction => 
        (transaction.sourceType === 'accounts' && transaction.sourceId === accountId) ||
        (transaction.destinationType === 'accounts' && transaction.destinationId === accountId)
      );
    }
    
    /**
     * Получение транзакций по активу
     */
    async getTransactionsByAssetId(assetId: string): Promise<Transaction[]> {
      const transactions = await this.getAll();
      return transactions.filter(transaction => transaction.relatedAssetId === assetId);
    }
    
    /**
     * Получение транзакций по категории
     */
    async getTransactionsByCategory(category: string): Promise<Transaction[]> {
      const transactions = await this.getAll();
      return transactions.filter(transaction => transaction.category === category);
    }
    
    /**
     * Удаляем транзакцию и отменяем ее эффект на балансы
     */
    async deleteTransaction(id: string): Promise<boolean> {
      const transaction = await this.getById(id);
      
      if (!transaction) {
        throw new Error(`Transaction with id ${id} not found`);
      }
      
      // Отменяем эффект транзакции на балансы
      switch (transaction.type) {
        case TransactionType.INCOME:
          // Отменяем доход - уменьшаем баланс получателя
          if (transaction.destinationType === 'accounts' && transaction.destinationId) {
            await this.financeService.accounts.updateBalance(transaction.destinationId, -transaction.amount);
          } else if (transaction.destinationType === 'cash' && transaction.destinationId) {
            await this.financeService.cash.updateAmount(transaction.destinationId, -transaction.amount);
          }
          break;
          
        case TransactionType.EXPENSE:
          // Отменяем расход - увеличиваем баланс источника
          if (transaction.sourceType === 'accounts' && transaction.sourceId) {
            await this.financeService.accounts.updateBalance(transaction.sourceId, transaction.amount);
          } else if (transaction.sourceType === 'cash' && transaction.sourceId) {
            await this.financeService.cash.updateAmount(transaction.sourceId, transaction.amount);
          }
          break;
          
        case TransactionType.TRANSFER:
          // Отменяем перевод - возвращаем средства источнику и забираем у получателя
          if (transaction.sourceType === 'accounts' && transaction.sourceId) {
            await this.financeService.accounts.updateBalance(transaction.sourceId, transaction.amount);
          } else if (transaction.sourceType === 'cash' && transaction.sourceId) {
            await this.financeService.cash.updateAmount(transaction.sourceId, transaction.amount);
          }
          
          if (transaction.destinationType === 'accounts' && transaction.destinationId) {
            await this.financeService.accounts.updateBalance(transaction.destinationId, -transaction.amount);
          } else if (transaction.destinationType === 'cash' && transaction.destinationId) {
            await this.financeService.cash.updateAmount(transaction.destinationId, -transaction.amount);
          }
          break;
      }
      
      // Удаляем транзакцию
      return this.delete(id);
    }
  }
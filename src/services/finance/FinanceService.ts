// src/services/finance/FinanceService.ts
import type { 
    Account, 
    Cash, 
    Loan, 
    AccountType
  } from '@/types';
  import { BaseCrudServiceImpl } from '../BaseCrudService';
  import type { ApiService } from '../api/ApiService';
  
  /**
   * Сервис для работы со счетами
   */
  export class AccountService extends BaseCrudServiceImpl<Account> {
    protected entityName: string = 'accounts';
    
    /**
     * Получение счетов пользователя
     */
    async getAccountsByUserId(userId: string): Promise<Account[]> {
      const accounts = await this.getAll();
      return accounts.filter(account => {
        // Проверяем, является ли пользователь владельцем
        if (account.ownerId === userId) {
          return true;
        }
        
        // Проверяем, есть ли у пользователя доля владения
        if (account.ownershipShares && account.ownershipShares[userId]) {
          return true;
        }
        
        return false;
      });
    }
    
    /**
     * Обновление баланса счета
     */
    async updateBalance(accountId: string, amount: number): Promise<Account> {
      const account = await this.getById(accountId);
      
      if (!account) {
        throw new Error(`Account with id ${accountId} not found`);
      }
      
      const updatedAccount = {
        ...account,
        currentBalance: account.currentBalance + amount,
        updatedAt: new Date()
      };
      
      return this.apiService.put<Account>(`/${this.entityName}/${accountId}`, updatedAccount);
    }
  
    /**
     * Создание нового счета
     */
    async createAccount(
      name: string, 
      type: AccountType, 
      currency: string, 
      initialBalance: number, 
      ownerId: string,
      icon: string = 'credit-card'
    ): Promise<Account> {
      const newAccount: Omit<Account, 'id' | 'createdAt' | 'updatedAt'> = {
        name,
        type,
        currency,
        initialBalance,
        currentBalance: initialBalance,
        ownerId,
        icon
      };
      
      return this.create(newAccount);
    }
  }
  
  /**
   * Сервис для работы с наличными
   */
  export class CashService extends BaseCrudServiceImpl<Cash> {
    protected entityName: string = 'cash';
    
    /**
     * Получение наличных пользователя
     */
    async getCashByUserId(userId: string): Promise<Cash[]> {
      const cashItems = await this.getAll();
      return cashItems.filter(cash => {
        // Проверяем, является ли пользователь владельцем
        if (cash.ownerId === userId) {
          return true;
        }
        
        // Проверяем, есть ли у пользователя доля владения
        if (cash.ownershipShares && cash.ownershipShares[userId]) {
          return true;
        }
        
        return false;
      });
    }
    
    /**
     * Обновление суммы наличных
     */
    async updateAmount(cashId: string, amount: number): Promise<Cash> {
      const cash = await this.getById(cashId);
      
      if (!cash) {
        throw new Error(`Cash with id ${cashId} not found`);
      }
      
      const updatedCash = {
        ...cash,
        currentAmount: cash.currentAmount + amount,
        updatedAt: new Date()
      };
      
      return this.apiService.put<Cash>(`/${this.entityName}/${cashId}`, updatedCash);
    }
  
    /**
     * Создание новых наличных
     */
    async createCash(
      currency: string, 
      initialAmount: number, 
      ownerId: string,
      icon: string = 'cash'
    ): Promise<Cash> {
      const newCash: Omit<Cash, 'id' | 'createdAt' | 'updatedAt'> = {
        currency,
        initialAmount,
        currentAmount: initialAmount,
        ownerId,
        icon
      };
      
      return this.create(newCash);
    }
  }
  
  /**
   * Сервис для работы с кредитами/ссудами
   */
  export class LoanService extends BaseCrudServiceImpl<Loan> {
    protected entityName: string = 'loans';
    
    /**
     * Получение кредитов, где пользователь является заемщиком
     */
    async getLoansByBorrowerId(userId: string): Promise<Loan[]> {
      const loans = await this.getAll();
      return loans.filter(loan => loan.borrowerId === userId);
    }
    
    /**
     * Получение кредитов, где пользователь является кредитором
     */
    async getLoansByLenderId(userId: string): Promise<Loan[]> {
      const loans = await this.getAll();
      return loans.filter(loan => loan.lenderId === userId);
    }
    
    /**
     * Обновление суммы кредита
     */
    async updateAmount(loanId: string, amount: number): Promise<Loan> {
      const loan = await this.getById(loanId);
      
      if (!loan) {
        throw new Error(`Loan with id ${loanId} not found`);
      }
      
      const updatedLoan = {
        ...loan,
        currentAmount: loan.currentAmount - amount, // Уменьшаем сумму долга
        updatedAt: new Date()
      };
      
      return this.apiService.put<Loan>(`/${this.entityName}/${loanId}`, updatedLoan);
    }
  }
  
  /**
   * Объединенный сервис финансов для работы с локальным хранилищем
   */
  export class FinanceService {
    private accountService: AccountService;
    private cashService: CashService;
    private loanService: LoanService;
    
    constructor(apiService: ApiService) {
      this.accountService = new AccountService(apiService);
      this.cashService = new CashService(apiService);
      this.loanService = new LoanService(apiService);
    }
    
    /**
     * Методы для работы со счетами
     */
    get accounts() {
      return this.accountService;
    }
    
    /**
     * Методы для работы с наличными
     */
    get cash() {
      return this.cashService;
    }
    
    /**
     * Методы для работы с кредитами/ссудами
     */
    get loans() {
      return this.loanService;
    }
    
    /**
     * Получить общий баланс по всем счетам и наличным для пользователя
     */
    async getTotalBalance(userId: string, currency: string = 'USD'): Promise<number> {
      let total = 0;
      
      // Получаем все счета пользователя
      const accounts = await this.accounts.getAccountsByUserId(userId);
      for (const account of accounts) {
        // Здесь должна быть конвертация валют, но для упрощения просто суммируем
        total += account.currentBalance;
      }
      
      // Получаем все наличные пользователя
      const cashItems = await this.cash.getCashByUserId(userId);
      for (const cash of cashItems) {
        // Также должна быть конвертация валют
        total += cash.currentAmount;
      }
      
      // Вычитаем кредиты, где пользователь является заемщиком
      const loans = await this.loans.getLoansByBorrowerId(userId);
      for (const loan of loans) {
        // Также должна быть конвертация валют
        total -= loan.currentAmount;
      }
      
      // Добавляем кредиты, где пользователь является кредитором
      const lentLoans = await this.loans.getLoansByLenderId(userId);
      for (const loan of lentLoans) {
        // Также должна быть конвертация валют
        total += loan.currentAmount;
      }
      
      return total;
    }
  }
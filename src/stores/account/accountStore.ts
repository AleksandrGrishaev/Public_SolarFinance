// src/stores/account/accountStore.ts
import { defineStore } from 'pinia';
import { AccountService } from './accountService';
import type { Account, AccountType } from './types';
import { useCurrencyStore } from '../currency'; // Импортируем хранилище валют

export const useAccountStore = defineStore('account', {
  state: () => ({
    accounts: [] as Account[],
    isInitialized: false,
    loading: false
  }),
  
  getters: {
    // Сервис для работы со счетами
    accountService() {
      return new AccountService();
    },
    
    // Получение всех активных счетов
    activeAccounts(state) {
      return state.accounts.filter(account => account.isActive);
    },
    
    // Получение счетов по типу
    getAccountsByType(state) {
      return (type: AccountType) => state.accounts.filter(account => account.type === type);
    },
    
    // Получение счетов по ID владельца
    getAccountsByOwnerId(state) {
      return (ownerId: string) => state.accounts.filter(account => account.ownerId === ownerId);
    },
    
    // Получение счета по ID
    getAccountById(state) {
      return (id: string) => state.accounts.find(account => account.id === id);
    },
    
    // Получение счета по Книгам
   getAccountsByBookId(state) {
     return (bookId: string) => {
       if (!bookId) return [];
       
       return state.accounts.filter(account => {
         // Проверяем наличие счета в указанной книге через bookIds
         return account.bookIds && account.bookIds.includes(bookId);
       });
     };
   },
   
   /**
    * Получение активных счетов по ID книги
    */
   getActiveAccountsByBookId(state) {
     return (bookId: string) => {
       return this.getAccountsByBookId(bookId).filter(account => account.isActive);
     };
   },

    // Общий баланс всех счетов в базовой валюте с конвертацией через currencyStore
    totalBalance(state) {
      const currencyStore = useCurrencyStore();
      const baseCurrency = currencyStore.appBaseCurrency;
      
      return state.accounts.reduce((sum, account) => {
        // Если валюта счета совпадает с базовой, добавляем как есть
        if (account.currency === baseCurrency) {
          return sum + account.currentBalance;
        }
        
        // Иначе конвертируем перед добавлением
        const { convertedAmount } = currencyStore.convertAmount(
          account.currentBalance,
          account.currency,
          baseCurrency
        );
        
        return sum + convertedAmount;
      }, 0);
    },
    
    // Получаем символ валюты для счета
    getAccountCurrencySymbol(state) {
      return (accountId: string) => {
        const currencyStore = useCurrencyStore();
        const account = this.getAccountById(accountId);
        
        if (!account) {
          return currencyStore.getCurrency(currencyStore.appBaseCurrency)?.symbol || '$';
        }
        
        // Пытаемся получить символ валюты из currencyStore
        const currency = currencyStore.getCurrency(account.currency);
        if (currency) {
          return currency.symbol;
        }
        
        // Иначе используем символ из счета или базовый символ
        return account.symbol || currencyStore.getCurrency(currencyStore.appBaseCurrency)?.symbol || '$';
      };
    },
    
    // Форматированный баланс счета с символом валюты
    getFormattedAccountBalance(state) {
      return (accountId: string) => {
        const currencyStore = useCurrencyStore();
        const account = this.getAccountById(accountId);
        
        if (!account) return '0';
        
        return currencyStore.formatCurrency(account.currentBalance, account.currency);
      };
    }
  },
  
// These methods should be added to the actions in accountStore.ts

/**
 * Get accounts shared with a specific user
 */
getAccountsSharedWithUser(userId: string): Account[] {
  return this.accounts.filter(account => {
    // Include accounts where the user is the owner
    if (account.ownerId === userId) return true;
    
    // Include accounts shared with the user with 'view' or 'edit' permission
    return account.sharing && 
           account.sharing[userId] && 
           ['view', 'edit'].includes(account.sharing[userId]);
  });
},

/**
 * Check if a user has access to an account
 */
hasAccountAccess(accountId: string, userId: string): boolean {
  const account = this.getAccountById(accountId);
  if (!account) return false;
  
  // Owner always has access
  if (account.ownerId === userId) return true;
  
  // Check sharing permissions
  return account.sharing && 
         account.sharing[userId] && 
         ['view', 'edit'].includes(account.sharing[userId]);
},

/**
 * Check if a user can edit an account
 */
canEditAccount(accountId: string, userId: string): boolean {
  const account = this.getAccountById(accountId);
  if (!account) return false;
  
  // Owner always has edit permission
  if (account.ownerId === userId) return true;
  
  // Check for edit permission
  return account.sharing && 
         account.sharing[userId] === 'edit';
},

/**
 * Update sharing permissions for an account
 */
async updateAccountSharing(
  accountId: string, 
  sharingPermissions: Record<string, 'no' | 'view' | 'edit'>
): Promise<boolean> {
  try {
    const account = this.getAccountById(accountId);
    if (!account) {
      console.error(`[AccountStore] Account ${accountId} not found`);
      return false;
    }
    
    // Update local state
    this.loading = true;
    
    // Prepare the sharing object
    const sharing = { ...sharingPermissions };
    
    // Filter out 'no' permissions (no need to store them)
    Object.keys(sharing).forEach(userId => {
      if (sharing[userId] === 'no') {
        delete sharing[userId];
      }
    });
    
    // Update account
    return await this.updateAccount(accountId, { sharing });
  } catch (error) {
    console.error(`[AccountStore] Error updating sharing for account ${accountId}:`, error);
    return false;
  } finally {
    this.loading = false;
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
        
        // Проверяем и корректируем коды валют, чтобы они соответствовали ISO
        this.normalizeAccountCurrencies();
        
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
     * Нормализация кодов валют в счетах (для обеспечения соответствия ISO)
     */
    normalizeAccountCurrencies() {
      const currencyStore = useCurrencyStore();
      const currencyCodes = currencyStore.currencies.map(curr => curr.code);
      
      // Проверяем и корректируем несоответствующие коды валют
      for (const account of this.accounts) {
        // Если код валюты счета не соответствует ни одному из известных кодов
        if (!currencyCodes.includes(account.currency)) {
          // Пытаемся найти соответствие на основе символа или другой информации
          if (account.symbol === '₽' || account.currency === 'Rp') {
            account.currency = 'RUB'; // Российский рубль
          } else if (account.currency === 'Rp' || account.currency.includes('rupiah')) {
            account.currency = 'IDR'; // Индонезийская рупия
          }
          // Можно добавить другие правила преобразования
          
          // Если не удалось определить, устанавливаем базовую валюту
          if (!currencyCodes.includes(account.currency)) {
            console.warn(`[AccountStore] Unrecognized currency code: ${account.currency} for account: ${account.name}. Using default currency.`);
            account.currency = currencyStore.appBaseCurrency;
          }
        }
      }
    },
    
    /**
     * Получение баланса счета в указанной валюте (с конвертацией)
     */
    getAccountBalanceInCurrency(accountId: string, targetCurrency: string): number {
      const currencyStore = useCurrencyStore();
      const account = this.getAccountById(accountId);
      
      if (!account) return 0;
      
      // Если валюта совпадает, возвращаем баланс как есть
      if (account.currency === targetCurrency) {
        return account.currentBalance;
      }
      
      // Иначе конвертируем
      const { convertedAmount } = currencyStore.convertAmount(
        account.currentBalance,
        account.currency,
        targetCurrency
      );
      
      return convertedAmount;
    },
    
    /**
     * Добавление нового счета с учетом валюты
     */
    async addAccount(accountData: Omit<Account, 'id'>): Promise<Account> {
      try {
        // Нормализуем код валюты перед созданием счета
        const normalizedAccountData = { ...accountData };
        const currencyStore = useCurrencyStore();
        
        // Проверяем, существует ли валюта в currencyStore
        if (!currencyStore.getCurrency(normalizedAccountData.currency)) {
          console.warn(`[AccountStore] Currency code ${normalizedAccountData.currency} not found in currency store. Using default currency.`);
          normalizedAccountData.currency = currencyStore.appBaseCurrency;
        }
        
        this.loading = true;
        const newAccount = await this.accountService.addAccount(normalizedAccountData);
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
     * Обновление счета с валидацией валюты
     */
    async updateAccount(id: string, accountData: Partial<Account>): Promise<boolean> {
      try {
        this.loading = true;
        
        // Если в данных обновления есть валюта, проверяем её
        if (accountData.currency) {
          const currencyStore = useCurrencyStore();
          
          // Валидация кода валюты
          if (!currencyStore.getCurrency(accountData.currency)) {
            console.warn(`[AccountStore] Currency code ${accountData.currency} not found. Using default currency.`);
            accountData.currency = currencyStore.appBaseCurrency;
          }
          
          // Если меняется валюта, обновляем символ валюты в счете
          const currency = currencyStore.getCurrency(accountData.currency);
          if (currency && (!accountData.symbol || accountData.symbol === '')) {
            accountData.symbol = currency.symbol;
          }
        }
        
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
    },
    
    /**
     * Конвертация суммы между счетами с учетом обменного курса
     */
    async transferBetweenAccounts(
      sourceAccountId: string,
      destinationAccountId: string,
      amount: number,
      options?: {
        feePercentage?: number,
        feeFixed?: number,
        description?: string,
        categoryId?: string,
        bookId?: string
      }
    ): Promise<{success: boolean, sourceAmount: number, destinationAmount: number}> {
      try {
        const sourceAccount = this.getAccountById(sourceAccountId);
        const destinationAccount = this.getAccountById(destinationAccountId);
        
        if (!sourceAccount || !destinationAccount) {
          throw new Error('Source or destination account not found');
        }
        
        // Проверяем достаточность средств
        if (sourceAccount.currentBalance < amount) {
          throw new Error('Insufficient funds in source account');
        }
        
        this.loading = true;
        const currencyStore = useCurrencyStore();
        
        // Если валюты разные, выполняем конвертацию
        let destinationAmount = amount;
        
        if (sourceAccount.currency !== destinationAccount.currency) {
          const conversionResult = currencyStore.convertAmount(
            amount,
            sourceAccount.currency,
            destinationAccount.currency,
            {
              feePercentage: options?.feePercentage,
              feeFixed: options?.feeFixed
            }
          );
          
          destinationAmount = conversionResult.convertedAmount;
        } else {
          // Если валюты одинаковые, учитываем только комиссию если она есть
          const feePercentage = options?.feePercentage || 0;
          const feeFixed = options?.feeFixed || 0;
          
          const percentageFee = amount * (feePercentage / 100);
          const totalFee = percentageFee + feeFixed;
          
          destinationAmount = amount - totalFee;
        }
        
        // Обновляем балансы счетов
        await this.updateAccountBalance(sourceAccountId, sourceAccount.currentBalance - amount);
        await this.updateAccountBalance(destinationAccountId, destinationAccount.currentBalance + destinationAmount);
        
        // Здесь можно добавить создание транзакции перевода
        // TODO: Создание записи о транзакции в transactionStore
        
        return {
          success: true,
          sourceAmount: amount,
          destinationAmount
        };
      } catch (error) {
        console.error('[AccountStore] Error transferring between accounts:', error);
        return {
          success: false,
          sourceAmount: 0,
          destinationAmount: 0
        };
      } finally {
        this.loading = false;
      }
    },
    

/**
 * Добавление счета в книгу
 */
async addAccountToBook(accountId: string, bookId: string): Promise<boolean> {
  const account = this.getAccountById(accountId);
  if (!account) {
    console.error(`[AccountStore] Account ${accountId} not found`);
    return false;
  }
  
  try {
    // Если у счета нет массива bookIds, создаем его
    const bookIds = account.bookIds || [];
    
    // Если счет уже привязан к этой книге, ничего не делаем
    if (bookIds.includes(bookId)) {
      return true;
    }
    
    // Добавляем новую книгу в массив
    const updatedBookIds = [...bookIds, bookId];
    
    // Обновляем счет
    return await this.updateAccount(accountId, { bookIds: updatedBookIds });
  } catch (error) {
    console.error(`[AccountStore] Error adding account ${accountId} to book ${bookId}:`, error);
    return false;
  }
},

/**
 * Удаление счета из книги
 */
async removeAccountFromBook(accountId: string, bookId: string): Promise<boolean> {
  const account = this.getAccountById(accountId);
  if (!account) {
    console.error(`[AccountStore] Account ${accountId} not found`);
    return false;
  }
  
  try {
    // Если у счета нет массива bookIds или книга отсутствует, ничего не делаем
    if (!account.bookIds || !account.bookIds.includes(bookId)) {
      return true;
    }
    
    // Удаляем книгу из массива
    const updatedBookIds = account.bookIds.filter(id => id !== bookId);
    
    // Обновляем счет
    return await this.updateAccount(accountId, { 
      // Если массив пустой, устанавливаем null или []
      bookIds: updatedBookIds.length > 0 ? updatedBookIds : [] 
    });
  } catch (error) {
    console.error(`[AccountStore] Error removing account ${accountId} from book ${bookId}:`, error);
    return false;
  }
},

/**
 * Проверка, принадлежит ли счет книге
 */
isAccountInBook(accountId: string, bookId: string): boolean {
  const account = this.getAccountById(accountId);
  if (!account || !account.bookIds) {
    return false;
  }
  
  return account.bookIds.includes(bookId);
},

/**
 * Получение книг, к которым принадлежит счет
 */
getAccountBooks(accountId: string): string[] {
  const account = this.getAccountById(accountId);
  if (!account || !account.bookIds) {
    return [];
  }
  
  return [...account.bookIds];
},

    /**
     * Получение форматированного баланса счета с символом валюты
     */
    formatAccountBalance(accountId: string): string {
      const account = this.getAccountById(accountId);
      if (!account) return '0';
      
      const currencyStore = useCurrencyStore();
      return currencyStore.formatCurrency(account.currentBalance, account.currency);
    },
    
    /**
     * Получение всех валют, используемых в счетах
     */
    getUsedCurrencies(): string[] {
      const currencyCodes = new Set<string>();
      
      this.accounts.forEach(account => {
        if (account.currency) {
          currencyCodes.add(account.currency);
        }
      });
      
      return Array.from(currencyCodes);
    },
    
    /**
     * Обновление информации о валюте для всех счетов
     * Вызывается при изменении данных о валютах в currencyStore
     */
    updateAccountsCurrencyInfo(): void {
      const currencyStore = useCurrencyStore();
      
      this.accounts.forEach(account => {
        const currency = currencyStore.getCurrency(account.currency);
        
        if (currency) {
          // Обновляем символ валюты если в счете он устарел или отсутствует
          if (account.symbol !== currency.symbol) {
            this.updateAccount(account.id, { symbol: currency.symbol });
          }
        }
      });
    }
  }
});
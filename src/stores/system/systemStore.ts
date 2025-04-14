// src/stores/system/systemStore.ts
import { defineStore } from 'pinia';
import { TRANSACTION_TYPES, FILTER_TRANSACTION_TYPES, CURRENCIES, DEFAULT_OWNERS } from './constants';
import type { TransactionType, Currency, Owner } from './types';

export const useSystemStore = defineStore('system', {
  state: () => ({
    transactionTypes: [...TRANSACTION_TYPES],
    filterTransactionTypes: [...FILTER_TRANSACTION_TYPES],
    currencies: [...CURRENCIES],
    owners: [...DEFAULT_OWNERS]  // Временное решение, пока не будет полного хранилища владельцев
  }),
  
  getters: {
    /**
     * Все типы транзакций
     */
    allTransactionTypes(): TransactionType[] {
      return this.transactionTypes;
    },
    
    /**
     * Типы транзакций для фильтров (без переводов)
     */
    allFilterTransactionTypes(): TransactionType[] {
      return this.filterTransactionTypes;
    },
    
    /**
     * Все валюты
     */
    allCurrencies(): Currency[] {
      return this.currencies;
    },
    
    /**
     * Валюта по умолчанию
     */
    defaultCurrency(): Currency {
      return this.currencies.find(c => c.isDefault) || this.currencies[0];
    },
    
    /**
     * Владельцы (временное решение)
     */
    allOwners(): Owner[] {
      return this.owners;
    },
    
    /**
     * Получение валюты по коду
     */
    getCurrencyByCode(): (code: string) => Currency | undefined {
      return (code: string) => this.currencies.find(c => c.code === code);
    },
    
    /**
     * Получение типа транзакции по ID
     */
    getTransactionTypeById(): (id: string) => TransactionType | undefined {
      return (id: string) => this.transactionTypes.find(t => t.id === id);
    }
  },
  
  actions: {
    /**
     * Установка валюты по умолчанию
     */
    setDefaultCurrency(code: string): void {
      // Сначала убираем флаг у текущей валюты по умолчанию
      this.currencies.forEach(c => {
        c.isDefault = false;
      });
      
      // Устанавливаем новую валюту по умолчанию
      const currency = this.currencies.find(c => c.code === code);
      if (currency) {
        currency.isDefault = true;
      }
    }
  }
});
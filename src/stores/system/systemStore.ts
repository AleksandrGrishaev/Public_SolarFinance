// src/stores/system/systemStore.ts
import { defineStore } from 'pinia';
import { TRANSACTION_TYPES, FILTER_TRANSACTION_TYPES, CURRENCIES, DEFAULT_OWNERS } from './constants';
import type { TransactionType, Currency, Owner } from './types';

export const useSystemStore = defineStore('system', {
  state: () => ({
    transactionTypes: TRANSACTION_TYPES as TransactionType[],
    filterTransactionTypes: FILTER_TRANSACTION_TYPES as TransactionType[],
    currencies: CURRENCIES as Currency[],
    owners: DEFAULT_OWNERS as Owner[]
  }),
  
  getters: {
    /**
     * Получение всех типов транзакций
     */
    allTransactionTypes(): TransactionType[] {
      return this.transactionTypes;
    },
    
    /**
     * Получение типов транзакций для фильтров
     */
    allFilterTransactionTypes(): TransactionType[] {
      return this.filterTransactionTypes;
    },
    
    /**
     * Получение всех валют
     */
    allCurrencies(): Currency[] {
      return this.currencies;
    },
    
    /**
     * Получение валюты по умолчанию
     */
    defaultCurrency(): Currency | undefined {
      return this.currencies.find(currency => currency.isDefault);
    },
    
    /**
     * Получение валюты по коду
     */
    getCurrencyByCode(): (code: string) => Currency | undefined {
      return (code: string) => this.currencies.find(currency => currency.code === code);
    },
    
    /**
     * Получение всех владельцев
     */
    allOwners(): Owner[] {
      return this.owners;
    },
    
    /**
     * Получение владельца по ID
     */
    getOwnerById(): (id: string) => Owner | undefined {
      return (id: string) => this.owners.find(owner => owner.id === id);
    }
  },
  
  actions: {
    /**
     * Добавление нового типа транзакции
     */
    addTransactionType(type: TransactionType) {
      if (!this.transactionTypes.some(t => t.id === type.id)) {
        this.transactionTypes.push(type);
      }
    },
    
    /**
     * Добавление новой валюты
     */
    addCurrency(currency: Currency) {
      if (!this.currencies.some(c => c.code === currency.code)) {
        this.currencies.push(currency);
      }
    },
    
    /**
     * Установка валюты по умолчанию
     */
    setDefaultCurrency(code: string) {
      this.currencies.forEach(currency => {
        currency.isDefault = currency.code === code;
      });
    },
    
    /**
     * Добавление нового владельца
     */
    addOwner(owner: Owner) {
      if (!this.owners.some(o => o.id === owner.id)) {
        this.owners.push(owner);
      }
    }
  }
});
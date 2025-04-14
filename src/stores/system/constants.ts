// src/stores/system/constants.ts
import type { TransactionType, Currency, Owner } from './types';

/**
 * Типы транзакций - системная константа, не изменяемая пользователем
 */
export const TRANSACTION_TYPES: TransactionType[] = [
  { id: 'expense', name: 'Expense' },
  { id: 'income', name: 'Income' },
  { id: 'transfer', name: 'Transfer' }
];

/**
 * Типы транзакций для фильтров (без переводов)
 */
export const FILTER_TRANSACTION_TYPES: TransactionType[] = [
  { id: 'expense', name: 'Expense' },
  { id: 'income', name: 'Income' }
];

/**
 * Валюты - системная константа
 */
export const CURRENCIES: Currency[] = [
  { 
    code: 'USD', 
    name: 'US Dollar', 
    symbol: '$', 
    decimals: 2,
    isDefault: true
  },
  { 
    code: 'EUR', 
    name: 'Euro', 
    symbol: '€', 
    decimals: 2 
  },
  { 
    code: 'RUB', 
    name: 'Russian Ruble', 
    symbol: '₽', 
    decimals: 2 
  }
];

/**
 * Временные данные о владельцах (будут заменены на полную реализацию хранилища владельцев)
 */
export const DEFAULT_OWNERS: Owner[] = [
  { id: 'alex', name: 'Alex', color: '#4CAF50' },
  { id: 'wife', name: 'Wife', color: '#9C27B0' }
];
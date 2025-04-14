// src/stores/account/defaultAccounts.ts
import type { Account } from './types';

/**
 * Данные счетов по умолчанию
 * Используются при первой инициализации приложения,
 * когда в хранилище нет сохраненных счетов
 */
export const defaultAccounts: Account[] = [
  { 
    id: 'dollar',
    name: 'Dollar',
    ownerId: 'user_1',  // ID должен соответствовать ID владельца
    currency: 'USD',
    initialBalance: 0,
    currentBalance: 0,
    color: '#BE9A40',
    symbol: 'D',
    type: 'cash',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 'bank2',
    name: 'Bank 2',
    ownerId: 'user_2',  // ID должен соответствовать ID владельца
    currency: 'USD',
    initialBalance: 0,
    currentBalance: 0,
    color: '#B46B66',
    symbol: 'B',
    type: 'bank',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
// src/stores/account/defaultAccounts.ts
import type { Account } from './types';
/**
 * Данные счетов по умолчанию
 * Используются при первой инициализации приложения,
 * когда в хранилище нет сохраненных счетов
 */
export const defaultAccounts: Account[] = [
  { 
    id: 'cash1',
    name: 'Наличные',
    ownerId: 'user_1',
    currency: 'Rp',
    initialBalance: 50000,
    currentBalance: 38200,  // С учетом транзакции покупки краски
    color: '#4CAF50',
    symbol: '₽',
    type: 'cash',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 'bank1',
    name: 'Основной банковский счет',
    ownerId: 'user_1',
    currency: 'Rp',
    initialBalance: 7000000,
    currentBalance: 13989000,  // С учетом зарплат и расходов
    color: '#2196F3',
    symbol: 'B',
    type: 'bank',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 'bank2',
    name: 'Банковский счет супруги',
    ownerId: 'user_2',
    currency: 'Rp',
    initialBalance: 500000,
    currentBalance: 369000,  // С учетом транзакции на плитку
    color: '#B46B66',
    symbol: 'B',
    type: 'bank',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 'card1',
    name: 'Дебетовая карта',
    ownerId: 'user_1',
    currency: 'Rp',
    initialBalance: 100000,
    currentBalance: 36500,  // С учетом расходов на обои и ресторан
    color: '#FFC107',
    symbol: 'C',
    type: 'card',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 'card2',
    name: 'Кредитная карта',
    ownerId: 'user_2',
    currency: 'Rp',
    initialBalance: 150000,
    currentBalance: 46500,  // С учетом оплаты мастера и продуктов
    color: '#E91E63',
    symbol: 'K',
    type: 'card',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 'card3',
    name: 'Зарплатная карта супруги',
    ownerId: 'user_2',
    currency: 'Rp',
    initialBalance: 0,
    currentBalance: 5550000,  // С учетом зарплат
    color: '#9C27B0',
    symbol: 'Z',
    type: 'card',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 'dollar',
    name: 'Dollar',
    ownerId: 'user_1',
    currency: 'USD',
    initialBalance: 0,
    currentBalance: 0,
    color: '#BE9A40',
    symbol: 'D',
    type: 'cash',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
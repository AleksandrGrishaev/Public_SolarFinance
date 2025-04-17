// src/stores/account/defaultAccounts.ts
import type { Account, AccountSharing } from './types';
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
    bookIds: ['my', 'family'], // Счет используется в нескольких книгах
    currency: 'RUB',
    initialBalance: 50000,
    currentBalance: 38200,
    color: '#4CAF50',
    symbol: '₽',
    type: 'cash',
    icon: 'IconShoppingCart',
    isActive: true,
    sharing: { 'user_2': 'view' }, // Пользователь user_2 имеет доступ только для просмотра
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 'bank1',
    name: 'Основной банковский счет',
    ownerId: 'user_1',
    bookIds: ['my', 'family'],
    currency: 'IDR',
    initialBalance: 7000000,
    currentBalance: 13989000,
    color: '#2196F3',
    symbol: 'Rp',
    type: 'bank',
    isActive: true,
    sharing: { 'user_2': 'edit' }, // Пользователь user_2 имеет полный доступ 
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 'bank2',
    name: 'Банковский счет супруги',
    ownerId: 'user_2',
    bookIds: ['wife', 'family'],
    currency: 'IDR',
    initialBalance: 500000,
    currentBalance: 369000,
    color: '#B46B66',
    symbol: 'Rp',
    type: 'bank',
    isActive: true,
    sharing: { 'user_1': 'view' }, // Пользователь user_1 имеет доступ только для просмотра
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 'card1',
    name: 'Дебетовая карта',
    ownerId: 'user_1',
    bookIds: ['my', 'family'],
    currency: 'IDR',
    initialBalance: 100000,
    currentBalance: 36500,
    color: '#FFC107',
    symbol: 'Rp',
    type: 'card',
    isActive: true,
    sharing: { 'user_2': 'edit' }, // Пользователь user_2 имеет полный доступ
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 'card2',
    name: 'Кредитная карта',
    ownerId: 'user_2',
    bookIds: ['wife', 'family'],
    currency: 'RUB',
    initialBalance: 150000,
    currentBalance: 46500,
    color: '#E91E63',
    symbol: '₽',
    type: 'card',
    icon: 'IconShoppingCart',
    isActive: true,
    sharing: { 'user_1': 'edit' }, // Пользователь user_1 имеет полный доступ
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 'card3',
    name: 'Зарплатная карта супруги',
    ownerId: 'user_2',
    bookIds: ['wife', 'family'],
    currency: 'RUB',
    initialBalance: 0,
    currentBalance: 5550000,
    color: '#9C27B0',
    symbol: '₽',
    type: 'card',
    isActive: true,
    sharing: {}, // Никто кроме владельца не имеет доступа
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 'dollar',
    name: 'Dollar',
    ownerId: 'user_1',
    bookIds: ['my', 'family'],
    currency: 'USD',
    initialBalance: 0,
    currentBalance: 0,
    color: '#BE9A40',
    symbol: '$',
    type: 'cash',
    isActive: true,
    sharing: { 'user_2': 'view' }, // Пользователь user_2 имеет доступ только для просмотра
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
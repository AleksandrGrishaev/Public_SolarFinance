// src/stores/book/defaultBooks.ts
import type { Book } from './types';

/**
 * Данные книг по умолчанию
 * Используются при первой инициализации приложения
 */
export const defaultBooks: Book[] = [
  { 
    id: 'my',
    name: 'My',
    type: 'personal',
    description: 'Personal finance book',
    ownerIds: ['user_1'],
    color: '#4CAF50',
    currency: 'USD', 
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 'family',
    name: 'Family',
    type: 'family',
    description: 'Family budget',
    ownerIds: ['user_1', 'user_2'],
    distributionRules: [
      { ownerId: 'user_1', percentage: 50 },
      { ownerId: 'user_2', percentage: 50 }
    ],
    color: '#2196F3',
    currency: 'RUB', 
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 'wife',
    name: 'Wife',
    type: 'personal',
    description: 'Wife personal finance',
    ownerIds: ['user_2'],
    color: '#9C27B0',
    currency: 'RUB',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
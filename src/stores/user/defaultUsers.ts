// src/stores/user/defaultUsers.ts
import type { User } from './types';

/**
 * Данные пользователей по умолчанию
 * Используются только при первой инициализации приложения,
 * когда в хранилище нет пользователей
 */
export const defaultUsers: User[] = [
  { 
    id: 'user_1',
    type: 'user',
    name: 'Alex',
    username: 'alex',
    pin: '1234',
    email: 'alex@example.com',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    settings: {
      theme: 'system',
      language: 'ru'
    }
  },
  { 
    id: 'user_2',
    type: 'user',
    name: 'Sasha Solar',
    username: 'sasha',
    pin: '5678',
    email: 'sasha@example.com',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    settings: {
      theme: 'light',
      language: 'ru'
    }
  },
];
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
      language: 'en',
      baseCurrency: 'USD', // Базовая валюта пользователя - USD
      color: '4E8090' // Добавлен цвет для Alex
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
      language: 'ru',
      baseCurrency: 'RUB', // Базовая валюта пользователя - RUB
      color: 'DB9894' // Добавлен цвет для Sasha
    }
  },
];
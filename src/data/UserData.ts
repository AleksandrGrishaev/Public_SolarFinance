// src/data/UserData.ts
import type { User } from '@/stores/user';

// Данные пользователей для аутентификации
// Используются только при первой инициализации
export const availableUsers: User[] = [
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
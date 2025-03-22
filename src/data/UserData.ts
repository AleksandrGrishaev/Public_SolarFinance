// src/data/userData.ts
import { type User } from '@/stores/user';

// Данные пользователей для аутентификации
export const availableUsers: User[] = [
  { 
    id: 1, 
    name: 'Alex', 
    role: 'Administrator', 
    pin: '1234', 
    email: 'admin@example.com' 
  },
  { 
    id: 2, 
    name: 'Sasha Solar', 
    role: 'User', 
    pin: '5678', 
    email: 'user@example.com' 
  },
];

// Роли пользователей и их возможности
export const userRoles = {
  Administrator: {
    level: 3,
    permissions: ['read', 'write', 'delete', 'manage_users', 'settings']
  },
  User: {
    level: 1,
    permissions: ['read', 'write', 'delete', 'manage_users', 'settings']
  }
};

// Проверка наличия разрешения у роли
export function hasPermission(role: string, permission: string): boolean {
  return userRoles[role as keyof typeof userRoles]?.permissions.includes(permission) || false;
}
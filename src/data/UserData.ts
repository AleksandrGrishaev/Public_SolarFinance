// src/data/userData.ts
import { type User } from '@/stores/user';

// Данные пользователей для аутентификации
export const availableUsers: User[] = [
  { 
    id: 1, 
    name: 'Admin User', 
    role: 'Administrator', 
    pin: '1234', 
    email: 'admin@example.com' 
  },
  { 
    id: 2, 
    name: 'Test User', 
    role: 'User', 
    pin: '5678', 
    email: 'user@example.com' 
  },
  { 
    id: 3, 
    name: 'John Doe', 
    role: 'Operator', 
    pin: '9999', 
    email: 'john@example.com' 
  },
];

// Роли пользователей и их возможности
export const userRoles = {
  Administrator: {
    level: 3,
    permissions: ['read', 'write', 'delete', 'manage_users', 'settings']
  },
  Operator: {
    level: 2,
    permissions: ['read', 'write', 'limited_settings']
  },
  User: {
    level: 1,
    permissions: ['read', 'limited_write']
  }
};

// Проверка наличия разрешения у роли
export function hasPermission(role: string, permission: string): boolean {
  return userRoles[role as keyof typeof userRoles]?.permissions.includes(permission) || false;
}
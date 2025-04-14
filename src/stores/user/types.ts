// src/stores/user/types.ts
import type { Person } from '../common/types';

export interface User extends Person {
  type: 'user';
  username: string;
  pin: string;
  email?: string;
  roles: UserRole[];
  isActive: boolean;
  lastLoginAt?: Date;
  settings: UserSettings;
}

export type UserRole = 'admin' | 'regular';

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  defaultBookId?: string;
  // Другие настройки пользователя
}
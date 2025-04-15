// src/stores/user/types.ts
import type { Person, PersonType } from '../common/types';

export interface User extends Person {
  type: Extract<PersonType, 'user'>;
  username: string;
  pin: string;
  email?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  defaultBookId?: string;
  baseCurrency: string; 
  // Другие настройки пользователя
}
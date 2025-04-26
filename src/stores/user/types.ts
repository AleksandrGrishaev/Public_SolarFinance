// src/stores/user/types.ts

export interface Person {
  id: string;
  name: string;
  type: PersonType;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PersonType = 'user' | 'owner' | 'family_member' | 'external_contact';

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
  color?: string; // Добавлено новое поле для цвета пользователя
  // Другие настройки пользователя
}
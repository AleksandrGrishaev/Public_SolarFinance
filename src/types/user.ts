import { type BaseEntity } from './base';

export interface User extends BaseEntity {
    name: string;
    pin: string; // Зашифрованный PIN-код
    role: string
    avatar?: string;
    isAdmin: boolean;
  }
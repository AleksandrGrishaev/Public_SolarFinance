// src/stores/account/types.ts

export interface Account {
  id: string;
  name: string;
  ownerId: string;  // ID владельца счета (Owner)
  currency: string;
  initialBalance: number;
  currentBalance: number;
  color: string;
  symbol: string;  // Для отображения в интерфейсе
  icon?: string;
  type: AccountType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type AccountType = 'cash' | 'bank' |  'card' |'credit_card' | 'savings' | 'investment';
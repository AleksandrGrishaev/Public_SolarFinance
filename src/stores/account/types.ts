// src/stores/account/types.ts

export interface Account {
  id: string;
  name: string;
  ownerId: string;  // ID владельца счета (Owner)
  bookIds: string[]; // ID книг, в которых используется счет
  currency: string;
  initialBalance: number;
  currentBalance: number;
  color: string;
  symbol: string;
  icon?: string;
  type: AccountType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  sharing?: AccountSharing; // Added sharing permissions
}

export type AccountType = 'cash' | 'bank' |  'card' |'credit_card' | 'savings' | 'investment';

// Sharing permission type
export type SharingPermission = 'no' | 'view' | 'edit';

// Sharing permissions by user ID
export type AccountSharing = Record<string, SharingPermission>;
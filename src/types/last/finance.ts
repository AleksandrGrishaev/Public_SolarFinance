import { type BaseEntity } from './base';

/**
 * Типы счетов
 */
export enum AccountType {
  DEBIT = 'debit',
  CREDIT = 'credit'
}

/**
 * Интерфейс счета
 */
export interface Account extends BaseEntity {
  name: string;
  icon: string;
  currency: string;
  type: AccountType;
  initialBalance: number;
  currentBalance: number;
  ownerId: string;
  ownershipShares?: Record<string, number>;
}

/**
 * Интерфейс наличных
 */
export interface Cash extends BaseEntity {
  icon: string;
  currency: string;
  initialAmount: number;
  currentAmount: number;
  ownerId: string;
  ownershipShares?: Record<string, number>;
}

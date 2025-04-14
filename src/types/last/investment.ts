import { type BaseEntity } from './base';

/**
 * Предустановленные типы инвестиций
 */
export enum DefaultInvestmentType {
  STOCK = 'stock',
  BOND = 'bond',
  ETF = 'etf',
  MUTUAL_FUND = 'mutualFund',
  DEPOSIT = 'deposit',
  OTHER = 'other'
}

/**
 * Интерфейс для пользовательских типов инвестиций
 */
export interface InvestmentTypeEntity extends BaseEntity {
  name: string;
  icon: string;
  description?: string;
}

/**
 * Интерфейс инвестиции
 */
export interface Investment extends BaseEntity {
  name: string;
  type: DefaultInvestmentType | string; // Строка для ID пользовательского типа
  icon: string;
  amount: number;
  initialValue: number;
  currentValue: number;
  currency: string;
  purchaseDate: Date;
  ownerId: string;
  ownershipShares?: Record<string, number>;
}
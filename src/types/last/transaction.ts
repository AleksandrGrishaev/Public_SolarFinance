// src/types/transaction.ts
import { type BaseEntity } from './base';

/**
 * Типы транзакций
 */
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer'
}

/**
 * Предустановленные категории транзакций
 */
export enum DefaultTransactionCategory {
  SALARY = 'salary',
  GIFT = 'gift',
  FOOD = 'food',
  TRANSPORT = 'transport',
  ENTERTAINMENT = 'entertainment',
  HOUSING = 'housing',
  UTILITIES = 'utilities',
  HEALTH = 'health',
  EDUCATION = 'education',
  INVESTMENT = 'investment',
  ASSET_PURCHASE = 'assetPurchase',
  LIABILITY_PURCHASE = 'liabilityPurchase',
  DEBT_PAYMENT = 'debtPayment',
  OTHER = 'other'
}

/**
 * Интерфейс для пользовательских категорий
 */
export interface CustomCategory extends BaseEntity {
  name: string;
  icon: string;
  color: string;
  parentCategory?: DefaultTransactionCategory | string; // Может быть связана с предустановленной категорией
}

/**
 * Транзакция может использовать как предустановленную, так и пользовательскую категорию
 */
export interface Transaction extends BaseEntity {
  type: TransactionType;
  amount: number;
  currency: string;
  category: DefaultTransactionCategory | string; // Строка для ID пользовательской категории
  description: string;
  date: Date;
  sourceId?: string; 
  sourceType?: string; 
  destinationId?: string;
  destinationType?: string;
  relatedAssetId?: string;
  createdBy: string;
}
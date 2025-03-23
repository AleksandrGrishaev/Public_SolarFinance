// src/types/loan.ts
import { type BaseEntity } from './base';

/**
 * Предустановленные типы кредитов
 */
export enum DefaultLoanType {
  MORTGAGE = 'mortgage',
  CAR_LOAN = 'carLoan',
  PERSONAL_LOAN = 'personalLoan',
  BUSINESS_LOAN = 'businessLoan',
  CREDIT_CARD = 'creditCard',
  FAMILY_LOAN = 'familyLoan',
  OTHER = 'other'
}

/**
 * Интерфейс для пользовательских типов кредитов
 */
export interface LoanTypeEntity extends BaseEntity {
  name: string;
  icon: string;
  description?: string;
}

/**
 * Интерфейс кредита/ссуды
 */
export interface Loan extends BaseEntity {
  name: string;
  type: DefaultLoanType | string; // Строка для ID пользовательского типа
  icon: string;
  initialAmount: number;
  currentAmount: number;
  currency: string;
  interestRate?: number;
  startDate: Date;
  endDate?: Date;
  paymentSchedule?: string;
  lenderId?: string;
  borrowerId: string;
  ownershipShares?: Record<string, number>;
  relatedAssetId?: string;
}

// src/stores/debt/types.ts
import type { DistributionRule } from '../book/types';

// Статус долга
export type DebtStatus = 'active' | 'partially_paid' | 'paid' | 'cancelled';

// Тип долга
export type DebtType = 'internal' | 'external';

// Источник долга
export type DebtSource = 'transaction' | 'manual' | 'credit' | 'mortgage';

// Базовая структура долга
export interface Debt {
  id: string;
  amount: number;  // Первоначальная сумма долга
  remainingAmount: number; // Оставшаяся сумма (может уменьшаться при частичных выплатах)
  currency: string;
  type: DebtType;
  source: DebtSource;
  status: DebtStatus;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;  // Срок погашения (если есть)
  description?: string;
  bookId: string;  // ID книги, в которой учитывается долг
  
  // Для внутренних долгов между пользователями
  fromUserId?: string;  // Кто должен (дебитор)
  toUserId?: string;    // Кому должен (кредитор)
  
  // Для внешних долгов (кредиты, ипотека)
  creditorName?: string;  // Название кредитора (банк, организация)
  interestRate?: number;  // Процентная ставка
  
  // Связь с транзакцией, если долг создан на основе транзакции
  sourceTransactionId?: string;
  
  // История платежей по долгу
  paymentHistory?: DebtPayment[];
}

// Запись о платеже по долгу
export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  currency: string;
  date: Date;
  description?: string;
  transactionId?: string;  // ID транзакции, если платеж связан с транзакцией
}

// Структура для создания нового долга
export type NewDebtPayload = Omit<Debt, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'remainingAmount' | 'paymentHistory'>;

// Фильтры для поиска долгов
export interface DebtFilterOptions {
  status?: DebtStatus[];
  type?: DebtType[];
  fromUserId?: string;
  toUserId?: string;
  bookId?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  amountMin?: number;
  amountMax?: number;
}
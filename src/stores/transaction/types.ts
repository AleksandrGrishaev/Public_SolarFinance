// src/stores/transaction/types.ts
import type { DistributionRule } from '../book/types';

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  currency: string;
  type: TransactionType;
  description?: string;
  categoryId?: string;
  
  // Источник транзакции
  sourceEntityId: string;  // ID счета/актива, откуда идет транзакция
  sourceEntityType: string;  // Тип источника
  
  // Назначение (для переводов)
  destinationEntityId?: string;
  destinationEntityType?: string;
  
  // Владелец и распределение
  executedByOwnerId: string;  // Кто выполнил транзакцию
  responsibleOwnerIds: string[];  // Кто отвечает за транзакцию
  distributionRules?: DistributionRule[];  // Распределение
  
  // Книга учета
  bookId: string;
  
  // Метаданные
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionFilterOptions {
  dateFrom?: Date;
  dateTo?: Date;
  types?: TransactionType[];
  bookIds?: string[];
  categoryIds?: string[];
  searchTerm?: string;
}
// src/stores/transaction/types.ts - с добавлением полей для валютной конвертации
import type { DistributionRule } from '../book/types';

export type TransactionType = 'income' | 'expense' | 'transfer' | 'debt' | 'correction' | 'exchange';

export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  currency: string;
  type: TransactionType;
  description?: string;
  categoryId?: string;
  
  // Данные для валютной конвертации
  bookCurrency?: string;     // Валюта книги на момент создания транзакции
  bookRate?: number;         // Обменный курс в момент создания
  bookAmount?: number;       // Сумма в валюте книги
  
  // Источник транзакции
  sourceEntityId: string;    // ID счета/актива, откуда идет транзакция
  sourceEntityType: string;  // Тип источника
  
  // Назначение (для переводов)
  destinationEntityId?: string;
  destinationEntityType?: string;
  
  // Владелец и распределение
  executedByOwnerId: string;      // Кто выполнил транзакцию
  responsibleOwnerIds: string[];  // Кто отвечает за транзакцию
  distributionRules?: DistributionRule[];  // Распределение
  
  // Книга учета
  bookId: string;
  
  // Метаданные
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}
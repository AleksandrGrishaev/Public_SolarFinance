// src/constants/transactionTypes.ts
export type TransactionType = 'income' | 'expense' | 'transfer' | 'debt' | 'correction' | 'exchange';

export interface TransactionTypeInfo {
  id: TransactionType;
  name: string;
}

// Основной набор типов транзакций
export const PRIMARY_TRANSACTION_TYPES: TransactionTypeInfo[] = [
  { id: 'expense', name: 'Расход' },
  { id: 'income', name: 'Доход' },
  { id: 'transfer', name: 'Перевод' }
];

// Дополнительный набор типов транзакций
export const SECONDARY_TRANSACTION_TYPES: TransactionTypeInfo[] = [
  { id: 'debt', name: 'Долг' },
  { id: 'correction', name: 'Коррекция' },
  { id: 'exchange', name: 'Обмен' }
];

// Все типы транзакций
export const ALL_TRANSACTION_TYPES: TransactionTypeInfo[] = [
  ...PRIMARY_TRANSACTION_TYPES,
  ...SECONDARY_TRANSACTION_TYPES
];

// Получение имени типа транзакции по id
export function getTransactionTypeName(id: TransactionType): string {
  const type = ALL_TRANSACTION_TYPES.find(type => type.id === id);
  return type ? type.name : 'Неизвестный тип';
}

// Проверка, является ли тип частью дополнительного набора
export function isSecondaryTransactionType(id: TransactionType): boolean {
  return SECONDARY_TRANSACTION_TYPES.some(type => type.id === id);
}
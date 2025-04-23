// src/stores/debt/defaultDebts.ts
import type { Debt } from './types';

/**
 * Данные долгов по умолчанию
 * Используются при первой инициализации приложения
 */
export const defaultDebts: Debt[] = [
  {
    id: 'debt_1',
    amount: 5000,
    remainingAmount: 5000,
    currency: 'RUB',
    type: 'internal',
    source: 'transaction',
    status: 'active',
    description: 'Долг за совместный поход в ресторан',
    bookId: 'family',
    fromUserId: 'user_2', // Sasha должна Alex
    toUserId: 'user_1',
    sourceTransactionId: 'restaurant_1',
    createdAt: new Date('2025-03-16'),
    updatedAt: new Date('2025-03-16'),
    paymentHistory: []
  },
  {
    id: 'debt_2',
    amount: 3250,
    remainingAmount: 2000, // Частично оплачен
    currency: 'RUB',
    type: 'internal',
    source: 'transaction',
    status: 'partially_paid',
    description: 'Долг за продукты на выходные',
    bookId: 'family',
    fromUserId: 'user_2', // Sasha должна Alex
    toUserId: 'user_1',
    sourceTransactionId: 'groceries_2',
    createdAt: new Date('2025-03-22'),
    updatedAt: new Date('2025-03-25'),
    paymentHistory: [
      {
        id: 'payment_1',
        debtId: 'debt_2',
        amount: 1250,
        currency: 'RUB',
        date: new Date('2025-03-25'),
        description: 'Частичная оплата наличными'
      }
    ]
  },
  {
    id: 'debt_3',
    amount: 12000,
    remainingAmount: 0, // Полностью оплачен
    currency: 'RUB',
    type: 'internal',
    source: 'transaction',
    status: 'paid',
    description: 'Долг за ремонт ванной',
    bookId: 'family',
    fromUserId: 'user_1', // Alex должен был Sasha
    toUserId: 'user_2',
    sourceTransactionId: 'renovation_2',
    createdAt: new Date('2025-03-24'),
    updatedAt: new Date('2025-03-28'),
    paymentHistory: [
      {
        id: 'payment_2',
        debtId: 'debt_3',
        amount: 12000,
        currency: 'RUB',
        date: new Date('2025-03-28'),
        description: 'Полная оплата через банковский перевод'
      }
    ]
  },
  {
    id: 'debt_4',
    amount: 20000,
    remainingAmount: 20000,
    currency: 'RUB',
    type: 'external',
    source: 'manual',
    status: 'active',
    description: 'Долг Ивану за помощь с ремонтом',
    bookId: 'family',
    fromUserId: 'user_1', // Alex должен внешнему лицу
    creditorName: 'Иван (друг)',
    dueDate: new Date('2025-04-30'),
    createdAt: new Date('2025-03-20'),
    updatedAt: new Date('2025-03-20'),
    paymentHistory: []
  },
  {
    id: 'debt_5',
    amount: 250000,
    remainingAmount: 230000,
    currency: 'RUB',
    type: 'external',
    source: 'credit',
    status: 'partially_paid',
    description: 'Кредит на покупку техники',
    bookId: 'family',
    fromUserId: 'user_1', // Alex взял кредит
    creditorName: 'Банк "Финанс"',
    interestRate: 12.5,
    dueDate: new Date('2025-09-15'),
    createdAt: new Date('2025-02-15'),
    updatedAt: new Date('2025-03-15'),
    paymentHistory: [
      {
        id: 'payment_3',
        debtId: 'debt_5',
        amount: 20000,
        currency: 'RUB',
        date: new Date('2025-03-15'),
        description: 'Первый платеж по кредиту'
      }
    ]
  }
];
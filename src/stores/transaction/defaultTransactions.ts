// src/stores/transaction/defaultTransactions.ts
import type { Transaction } from './types';

/**
 * Данные транзакций по умолчанию
 * Используются при первой инициализации приложения
 */
export const defaultTransactions: Transaction[] = [
  // Доходы
  {
    id: "transaction_1",
    date: new Date("2023-04-05"),
    amount: 120000,
    currency: "RUB",
    type: "income",
    description: "Зарплата за март",
    categoryId: "salary",
    sourceEntityId: "employer",
    sourceEntityType: "external",
    destinationEntityId: "card1",
    destinationEntityType: "account",
    executedByOwnerId: "user_1",
    responsibleOwnerIds: ["user_1"],
    bookId: "my",
    createdAt: new Date("2023-04-05"),
    updatedAt: new Date("2023-04-05")
  },
  {
    id: "transaction_2",
    date: new Date("2023-04-06"),
    amount: 85000,
    currency: "RUB",
    type: "income",
    description: "Зарплата за март",
    categoryId: "salary",
    sourceEntityId: "employer",
    sourceEntityType: "external",
    destinationEntityId: "card3",
    destinationEntityType: "account",
    executedByOwnerId: "user_2",
    responsibleOwnerIds: ["user_2"],
    bookId: "wife",
    createdAt: new Date("2023-04-06"),
    updatedAt: new Date("2023-04-06")
  },

  // Расходы
  {
    id: "transaction_3",
    date: new Date("2023-04-08"),
    amount: 15000,
    currency: "RUB",
    type: "expense",
    description: "Продукты в Перекрестке",
    categoryId: "groceries",
    sourceEntityId: "card2",
    sourceEntityType: "account",
    executedByOwnerId: "user_2",
    responsibleOwnerIds: ["user_1", "user_2"],
    distributionRules: [
      { ownerId: "user_1", percentage: 50 },
      { ownerId: "user_2", percentage: 50 }
    ],
    bookId: "family",
    createdAt: new Date("2023-04-08"),
    updatedAt: new Date("2023-04-08")
  },
  {
    id: "transaction_4",
    date: new Date("2023-04-10"),
    amount: 5000,
    currency: "RUB",
    type: "expense",
    description: "Подписка на Netflix",
    categoryId: "entertainment",
    sourceEntityId: "card1",
    sourceEntityType: "account",
    executedByOwnerId: "user_1",
    responsibleOwnerIds: ["user_1", "user_2"],
    distributionRules: [
      { ownerId: "user_1", percentage: 50 },
      { ownerId: "user_2", percentage: 50 }
    ],
    bookId: "family",
    createdAt: new Date("2023-04-10"),
    updatedAt: new Date("2023-04-10")
  },

  // Переводы между счетами
  {
    id: "transaction_5",
    date: new Date("2023-04-12"),
    amount: 20000,
    currency: "RUB",
    type: "transfer",
    description: "Перевод на общие расходы",
    sourceEntityId: "card1",
    sourceEntityType: "account",
    destinationEntityId: "card2",
    destinationEntityType: "account",
    executedByOwnerId: "user_1",
    responsibleOwnerIds: ["user_1"],
    bookId: "my",
    createdAt: new Date("2023-04-12"),
    updatedAt: new Date("2023-04-12")
  },
  {
    id: "transaction_6",
    date: new Date("2023-04-15"),
    amount: 15000,
    currency: "RUB",
    type: "transfer",
    description: "Перевод на общие расходы",
    sourceEntityId: "card3",
    sourceEntityType: "account",
    destinationEntityId: "card2",
    destinationEntityType: "account",
    executedByOwnerId: "user_2",
    responsibleOwnerIds: ["user_2"],
    bookId: "wife",
    createdAt: new Date("2023-04-15"),
    updatedAt: new Date("2023-04-15")
  }
];
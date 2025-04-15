// src/stores/transaction/defaultTransactions.ts
import type { Transaction } from './types';

/**
 * Данные транзакций по умолчанию
 * Используются при первой инициализации приложения
 */
export const defaultTransactions: Transaction[] = [
  // ТРАНЗАКЦИИ ПО РЕМОНТУ (RENOVATION)
  {
    id: "renovation_1",
    date: new Date("2025-03-25"),
    amount: -11800,
    currency: "Rp",
    type: "expense",
    description: "Покупка краски",
    categoryId: "renovation",
    sourceEntityId: "cash1",
    sourceEntityType: "account",
    executedByOwnerId: "user_1",
    responsibleOwnerIds: ["user_1"],
    bookId: "my",
    createdAt: new Date("2025-03-25"),
    updatedAt: new Date("2025-03-25")
  },
  {
    id: "renovation_2",
    date: new Date("2025-03-24"),
    amount: -131000,
    currency: "Rp",
    type: "expense",
    description: "Плитка для ванной",
    categoryId: "renovation",
    sourceEntityId: "bank2",
    sourceEntityType: "account",
    executedByOwnerId: "user_1",
    responsibleOwnerIds: ["user_1", "user_2"],
    distributionRules: [
      { ownerId: "user_1", percentage: 50 },
      { ownerId: "user_2", percentage: 50 }
    ],
    bookId: "family",
    createdAt: new Date("2025-03-24"),
    updatedAt: new Date("2025-03-24")
  },
  {
    id: "renovation_3",
    date: new Date("2025-03-24"),
    amount: -11000,
    currency: "Rp",
    type: "expense",
    description: "Инструменты",
    categoryId: "renovation",
    sourceEntityId: "bank1",
    sourceEntityType: "account",
    executedByOwnerId: "user_1",
    responsibleOwnerIds: ["user_1"],
    bookId: "my",
    createdAt: new Date("2025-03-24"),
    updatedAt: new Date("2025-03-24")
  },
  {
    id: "renovation_4",
    date: new Date("2025-03-23"),
    amount: -78500,
    currency: "Rp",
    type: "expense",
    description: "Оплата работы мастера",
    categoryId: "renovation",
    sourceEntityId: "card2",
    sourceEntityType: "account",
    executedByOwnerId: "user_2",
    responsibleOwnerIds: ["user_1", "user_2"],
    distributionRules: [
      { ownerId: "user_1", percentage: 70 },
      { ownerId: "user_2", percentage: 30 }
    ],
    bookId: "family",
    createdAt: new Date("2025-03-23"),
    updatedAt: new Date("2025-03-23")
  },
  {
    id: "renovation_5",
    date: new Date("2025-03-20"),
    amount: -45000,
    currency: "Rp",
    type: "expense",
    description: "Новые обои",
    categoryId: "renovation",
    sourceEntityId: "card1",
    sourceEntityType: "account",
    executedByOwnerId: "user_1",
    responsibleOwnerIds: ["user_1", "user_2"],
    distributionRules: [
      { ownerId: "user_1", percentage: 50 },
      { ownerId: "user_2", percentage: 50 }
    ],
    bookId: "family",
    createdAt: new Date("2025-03-20"),
    updatedAt: new Date("2025-03-20")
  },
  
  // ТРАНЗАКЦИИ ПО ЗАРПЛАТЕ (MAIN JOB)
  {
    id: "salary_1",
    date: new Date("2025-03-15"),
    amount: 3500000,
    currency: "Rp",
    type: "income",
    description: "Зарплата за первую половину марта",
    categoryId: "main_job",
    sourceEntityId: "employer",
    sourceEntityType: "external",
    destinationEntityId: "bank1",
    destinationEntityType: "account",
    executedByOwnerId: "user_1",
    responsibleOwnerIds: ["user_1"],
    bookId: "my",
    createdAt: new Date("2025-03-15"),
    updatedAt: new Date("2025-03-15")
  },
  {
    id: "salary_2",
    date: new Date("2025-03-01"),
    amount: 3500000,
    currency: "Rp",
    type: "income",
    description: "Зарплата за вторую половину февраля",
    categoryId: "main_job",
    sourceEntityId: "employer",
    sourceEntityType: "external",
    destinationEntityId: "bank1",
    destinationEntityType: "account",
    executedByOwnerId: "user_1",
    responsibleOwnerIds: ["user_1"],
    bookId: "my",
    createdAt: new Date("2025-03-01"),
    updatedAt: new Date("2025-03-01")
  },
  {
    id: "salary_3",
    date: new Date("2025-03-05"),
    amount: 2800000,
    currency: "Rp",
    type: "income",
    description: "Зарплата за месяц",
    categoryId: "main_job",
    sourceEntityId: "employer2",
    sourceEntityType: "external",
    destinationEntityId: "card3",
    destinationEntityType: "account",
    executedByOwnerId: "user_2",
    responsibleOwnerIds: ["user_2"],
    bookId: "family",
    createdAt: new Date("2025-03-05"),
    updatedAt: new Date("2025-03-05")
  },
  {
    id: "salary_4",
    date: new Date("2025-02-15"),
    amount: 3450000,
    currency: "Rp",
    type: "income",
    description: "Зарплата за первую половину февраля",
    categoryId: "main_job",
    sourceEntityId: "employer",
    sourceEntityType: "external",
    destinationEntityId: "bank1",
    destinationEntityType: "account",
    executedByOwnerId: "user_1",
    responsibleOwnerIds: ["user_1"],
    bookId: "my",
    createdAt: new Date("2025-02-15"),
    updatedAt: new Date("2025-02-15")
  },
  {
    id: "salary_5",
    date: new Date("2025-02-05"),
    amount: 2750000,
    currency: "Rp",
    type: "income",
    description: "Зарплата за месяц",
    categoryId: "main_job",
    sourceEntityId: "employer2",
    sourceEntityType: "external",
    destinationEntityId: "card3",
    destinationEntityType: "account",
    executedByOwnerId: "user_2",
    responsibleOwnerIds: ["user_2"],
    bookId: "family",
    createdAt: new Date("2025-02-05"),
    updatedAt: new Date("2025-02-05")
  },
  
  // Другие транзакции
  {
    id: "transaction_1",
    date: new Date("2025-03-18"),
    amount: -25000,
    currency: "Rp",
    type: "expense",
    description: "Продукты в супермаркете",
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
    createdAt: new Date("2025-03-18"),
    updatedAt: new Date("2025-03-18")
  },
  {
    id: "transaction_2",
    date: new Date("2025-03-16"),
    amount: -18500,
    currency: "Rp",
    type: "expense",
    description: "Ужин в ресторане",
    categoryId: "restaurants",
    sourceEntityId: "card1",
    sourceEntityType: "account",
    executedByOwnerId: "user_1",
    responsibleOwnerIds: ["user_1", "user_2"],
    distributionRules: [
      { ownerId: "user_1", percentage: 50 },
      { ownerId: "user_2", percentage: 50 }
    ],
    bookId: "family",
    createdAt: new Date("2025-03-16"),
    updatedAt: new Date("2025-03-16")
  }
];
// src/stores/book/types.ts
export interface Book {
    id: string;
    name: string;
    type: BookType;
    description?: string;
    ownerIds: string[];  // ID владельцев книги
    distributionRules?: DistributionRule[];  // Правила распределения расходов
    icon?: string;
    color: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export type BookType = 'personal' | 'family' | 'business' | 'project';
  
  export interface DistributionRule {
    ownerId: string;
    percentage: number;  // Процент участия (0-100)
  }
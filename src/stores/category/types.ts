// src/stores/category/types.ts
// Definición de todos los tipos necesarios para el módulo de categorías

export interface Category {
    id: string;
    name: string;
    parentId?: string; // ID родительской категории
    parentName?: string; // Имя родительской категории (для удобства отображения)
    color: string;
    icon: string;
    type: 'expense' | 'income' | 'transfer';
    order?: number;
    isActive?: boolean; // Архивирована категория или нет
    books?: string[]; // Список ID книг, к которым принадлежит категория
  }
  
  // Tipo para resultados de búsqueda de categorías
  export interface CategorySearchResult {
    // Categorías padres con elementos secundarios
    parentCategories: Category[];
    // Categorías sin padre (que no son padres de otras categorías)
    standaloneCategories: Category[];
  }
  
  // Interfaces adicionales necesarias
  export interface Book {
    id: string;
    name: string;
  }
  
  export interface TransactionType {
    id: string;
    name: string;
  }
  
  export interface Account {
    id: string;
    name: string;
    currency: string;
    color: string;
    symbol: string;
  }
  
  export interface Owner {
    id: string;
    name: string;
  }
  
  // Tipo para el estado de categorías
  export interface CategoryState {
    categories: Category[];
    books: string[];
    transactionTypes: string[];
    filterTransactionTypes: string[];
  }
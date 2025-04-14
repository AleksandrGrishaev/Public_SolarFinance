// src/data/categories.ts
// Archivo con exportaciones originales y soporte para nuevas importaciones


// Definición explícita de interfaces para compatibilidad
export interface Category {
  id: string;
  name: string;
  parentId?: string;
  parentName?: string;
  color: string;
  icon: string;
  type: 'expense' | 'income';
  order?: number;
  isActive?: boolean;
  books?: string[];
}
  
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

// Books data
export const books: Book[] = [
  { id: 'my', name: 'My' },
  { id: 'family', name: 'Family' },
  { id: 'wife', name: 'Wife' }
];

// Transaction types
export const transactionTypes: TransactionType[] = [
  { id: 'expense', name: 'Expense' },
  { id: 'income', name: 'Income' },
  { id: 'transfer', name: 'Transfer' }
];

// Transaction types for filters (without transfer)
export const filterTransactionTypes: TransactionType[] = [
  { id: 'expense', name: 'Expense' },
  { id: 'income', name: 'Income' }
];

// Accounts
export const accounts: Account[] = [
  { id: 'dollar', name: 'Dollar', currency: 'USD', color: '#BE9A40', symbol: 'D' },
  { id: 'bank2', name: 'Bank 2', currency: 'USD', color: '#B46B66', symbol: 'B' }
];

// Owners
export const owners: Owner[] = [
  { id: 'alex', name: 'Alex' },
  { id: 'wife', name: 'Wife' }
];

// Mantenemos funcionando el código existente
import { useCategoryStore } from '../stores/category';

// Helper functions (redirected to store)
export const hasChildCategories = (categoryId: string): boolean => {
  const store = useCategoryStore();
  return store.hasChildCategories(categoryId);
};

export const hasChildCategoriesInBook = (categoryId: string, bookId: string): boolean => {
  const store = useCategoryStore();
  return store.hasChildCategoriesInBook(categoryId, bookId);
};

export const getActiveCategoriesForBookAndType = (bookId: string, type: string): Category[] => {
  const store = useCategoryStore();
  return store.getActiveCategoriesForBookAndType(bookId, type);
};

export const getArchivedCategoriesForBookAndType = (bookId: string, type: string): Category[] => {
  const store = useCategoryStore();
  return store.getArchivedCategoriesForBookAndType(bookId, type);
};

export const getAllCategoriesForBookAndType = (bookId: string, type: string): Category[] => {
  const store = useCategoryStore();
  return store.getAllCategoriesForBookAndType(bookId, type);
};

export const getCategoriesForBookAndType = (bookId: string, type: string): Category[] => {
  const store = useCategoryStore();
  return store.getCategoriesForBookAndType(bookId, type);
};

export const getAllCategoriesForType = (type: string): Category[] => {
  const store = useCategoryStore();
  return store.getAllCategoriesForType(type);
};

export const getCategoriesForBook = (bookId: string): Category[] => {
  const store = useCategoryStore();
  return store.getCategoriesForBook(bookId);
};

export const getParentCategoriesForType = (type: string): Category[] => {
  const store = useCategoryStore();
  return store.getParentCategoriesForType(type);
};

export const getParentCategoriesWithChildren = (type: string): Category[] => {
  const store = useCategoryStore();
  return store.getParentCategoriesWithChildren(type);
};

export const getChildCategories = (parentId: string): Category[] => {
  const store = useCategoryStore();
  return store.getChildCategories(parentId);
};

export const getChildCategoriesInBook = (parentId: string, bookId: string): Category[] => {
  const store = useCategoryStore();
  return store.getChildCategoriesInBook(parentId, bookId);
};

export const getSelectableCategoriesForType = (type: string): Category[] => {
  const store = useCategoryStore();
  return store.getSelectableCategoriesForType(type);
};

// Re-exportamos las categorías desde el store para compatibilidad
export const categories = (): Category[] => {
  const store = useCategoryStore();
  return store.categories;
};
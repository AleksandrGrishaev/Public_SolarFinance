// src/data/categories.ts

export interface Category {
    id: string;
    name: string;
    parentName?: string;
    color: string;
    icon: string;
    type: 'expense' | 'income';
    bookId?: string; // Relationship with book
    order?: number;
    isActive?: boolean;
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
  
  // Categories data
  export const categories: Category[] = [
    { 
      id: 'renovation', 
      name: 'Renovation', 
      parentName: 'House',
      color: '#F8D76E', 
      icon: 'IconTool',
      type: 'expense',
      order: 0,
      isActive: true
    },
    { 
      id: 'food', 
      name: 'Food', 
      color: '#A2C94F', 
      icon: 'IconBread',
      type: 'expense',
      order: 1,
      isActive: false
    },
    { 
      id: 'transport', 
      name: 'Transport', 
      color: '#70B1E0', 
      icon: 'IconCar',
      type: 'expense',
      order: 2,
      isActive: false
    },
    { 
      id: 'entertainment', 
      name: 'Entertainment', 
      color: '#E882A3', 
      icon: 'IconDeviceTv',
      type: 'expense',
      order: 3,
      isActive: false
    },
    { 
      id: 'utilities', 
      name: 'Utilities', 
      color: '#8F7ED8', 
      icon: 'IconHome',
      type: 'expense',
      order: 4,
      isActive: false
    },
    { 
      id: 'health', 
      name: 'Health', 
      color: '#D85A5A', 
      icon: 'IconHeartbeat',
      type: 'income',
      order: 0,
      isActive: false
    },
    { 
      id: 'education', 
      name: 'Education', 
      color: '#5AD8B9', 
      icon: 'IconBook',
      type: 'income',
      order: 1,
      isActive: false
    },
    { 
      id: 'shopping', 
      name: 'Shopping', 
      color: '#D8A55A', 
      icon: 'IconShoppingCart',
      type: 'income',
      order: 2,
      isActive: false
    },
  ];
  
  // Book-category associations
  export const bookCategories = [
    { bookId: 'my', categoryId: 'renovation' },
    { bookId: 'my', categoryId: 'food' },
    { bookId: 'family', categoryId: 'transport' },
    { bookId: 'family', categoryId: 'entertainment' },
    { bookId: 'wife', categoryId: 'utilities' },
    { bookId: 'my', categoryId: 'health' },
    { bookId: 'family', categoryId: 'education' },
    { bookId: 'wife', categoryId: 'shopping' },
    // Add redundancies to demonstrate multiple books having the same category
    { bookId: 'family', categoryId: 'renovation' },
    { bookId: 'wife', categoryId: 'food' },
  ];
  
  // Helper function to get categories for a specific book and transaction type
  export function getCategoriesForBookAndType(bookId: string, type: string): Category[] {
    const categoryIds = bookCategories
      .filter(bc => bc.bookId === bookId)
      .map(bc => bc.categoryId);
    
    return categories
      .filter(category => 
        categoryIds.includes(category.id) && 
        category.type === type
      )
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  
  // Helper function to get all available categories for a transaction type
  export function getAllCategoriesForType(type: string): Category[] {
    return categories
      .filter(category => category.type === type)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }
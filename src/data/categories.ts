// src/data/categories.ts

export interface Category {
    id: string;
    name: string;
    parentId?: string; // ID родительской категории
    parentName?: string; // Имя родительской категории (для удобства отображения)
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
  
  // Категории верхнего уровня
  export const parentCategories: Category[] = [
    { 
      id: 'house', 
      name: 'House', 
      color: '#F8D76E', 
      icon: 'IconHome',
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
      isActive: true
    },
    { 
      id: 'transport', 
      name: 'Transport', 
      color: '#70B1E0', 
      icon: 'IconCar',
      type: 'expense',
      order: 2,
      isActive: true
    },
    { 
      id: 'entertainment', 
      name: 'Entertainment', 
      color: '#E882A3', 
      icon: 'IconDeviceTv',
      type: 'expense',
      order: 3,
      isActive: true
    },
    { 
      id: 'salary', 
      name: 'Salary', 
      color: '#5AD8B9', 
      icon: 'IconCoin',
      type: 'income',
      order: 0,
      isActive: true
    },
    { 
      id: 'investment', 
      name: 'Investment', 
      color: '#D8A55A', 
      icon: 'IconCoin',
      type: 'income',
      order: 1,
      isActive: true
    }
  ];
  
  // Categories data с подкатегориями
  export const categories: Category[] = [
    // Родительские категории
    ...parentCategories,
    
    // Подкатегории для "House"
    { 
      id: 'renovation', 
      name: 'Renovation', 
      parentId: 'house',
      parentName: 'House',
      color: '#F8D76E', 
      icon: 'IconTool',
      type: 'expense',
      order: 0,
      isActive: true
    },
    { 
      id: 'utilities', 
      name: 'Utilities', 
      parentId: 'house',
      parentName: 'House',
      color: '#8F7ED8', 
      icon: 'IconBulb',
      type: 'expense',
      order: 1,
      isActive: false
    },
    { 
      id: 'furniture', 
      name: 'Furniture', 
      parentId: 'house',
      parentName: 'House',
      color: '#D85A5A', 
      icon: 'IconArmchair',
      type: 'expense',
      order: 2,
      isActive: false
    },
    
    // Подкатегории для "Food"
    { 
      id: 'groceries', 
      name: 'Groceries', 
      parentId: 'food',
      parentName: 'Food',
      color: '#A2C94F', 
      icon: 'IconShoppingCart',
      type: 'expense',
      order: 0,
      isActive: false
    },
    { 
      id: 'restaurants', 
      name: 'Restaurants', 
      parentId: 'food',
      parentName: 'Food',
      color: '#A2C94F', 
      icon: 'IconGlass',
      type: 'expense',
      order: 1,
      isActive: false
    },
    
    // Подкатегории для "Transport"
    { 
      id: 'gas', 
      name: 'Gas', 
      parentId: 'transport',
      parentName: 'Transport',
      color: '#70B1E0', 
      icon: 'IconGasStation',
      type: 'expense',
      order: 0,
      isActive: false
    },
    { 
      id: 'public_transport', 
      name: 'Public Transport', 
      parentId: 'transport',
      parentName: 'Transport',
      color: '#70B1E0', 
      icon: 'IconBus',
      type: 'expense',
      order: 1,
      isActive: false
    },
    
    // Подкатегории для "Salary"
    { 
      id: 'main_job', 
      name: 'Main Job', 
      parentId: 'salary',
      parentName: 'Salary',
      color: '#5AD8B9', 
      icon: 'IconBriefcase',
      type: 'income',
      order: 0,
      isActive: false
    },
    { 
      id: 'freelance', 
      name: 'Freelance', 
      parentId: 'salary',
      parentName: 'Salary',
      color: '#5AD8B9', 
      icon: 'IconCode',
      type: 'income',
      order: 1,
      isActive: false
    },
    
    // Прочие категории без родителя
    { 
      id: 'health', 
      name: 'Health', 
      color: '#D85A5A', 
      icon: 'IconHeartbeat',
      type: 'expense',
      order: 5,
      isActive: false
    },
    { 
      id: 'education', 
      name: 'Education', 
      color: '#5AD8B9', 
      icon: 'IconBook',
      type: 'expense',
      order: 6,
      isActive: false
    },
    { 
      id: 'shopping', 
      name: 'Shopping', 
      color: '#D8A55A', 
      icon: 'IconShoppingCart',
      type: 'expense',
      order: 7,
      isActive: false
    }
  ];
  
  // Book-category associations
  export const bookCategories = [
    // My book categories
    { bookId: 'my', categoryId: 'house' },
    { bookId: 'my', categoryId: 'renovation' },
    { bookId: 'my', categoryId: 'utilities' },
    { bookId: 'my', categoryId: 'food' },
    { bookId: 'my', categoryId: 'groceries' },
    { bookId: 'my', categoryId: 'transport' },
    { bookId: 'my', categoryId: 'salary' },
    { bookId: 'my', categoryId: 'main_job' },
    
    // Family book categories
    { bookId: 'family', categoryId: 'house' },
    { bookId: 'family', categoryId: 'renovation' },
    { bookId: 'family', categoryId: 'food' },
    { bookId: 'family', categoryId: 'restaurants' },
    { bookId: 'family', categoryId: 'entertainment' },
    { bookId: 'family', categoryId: 'education' },
    
    // Wife book categories
    { bookId: 'wife', categoryId: 'shopping' },
    { bookId: 'wife', categoryId: 'utilities' },
    { bookId: 'wife', categoryId: 'food' },
    { bookId: 'wife', categoryId: 'salary' },
    { bookId: 'wife', categoryId: 'freelance' }
  ];
  
  // Helper function to check if a category has children
  export function hasChildCategories(categoryId: string): boolean {
    return categories.some(category => category.parentId === categoryId);
  }
  
  // Helper function to get categories for a specific book and transaction type
  // Возвращает категории для книги и типа, которые можно выбрать:
  // - Категории без родителя и без детей
  // - Подкатегории (дочерние категории)
  export function getCategoriesForBookAndType(bookId: string, type: string): Category[] {
    const categoryIds = bookCategories
      .filter(bc => bc.bookId === bookId)
      .map(bc => bc.categoryId);
    
    return categories
      .filter(category => {
        // Категория должна быть в текущей книге и указанного типа
        const isInBookAndType = categoryIds.includes(category.id) && category.type === type;
        
        if (!isInBookAndType) return false;
        
        // Если это родительская категория (без родителя), она должна НЕ иметь дочерних элементов
        if (!category.parentId) {
          return !hasChildCategories(category.id);
        }
        
        // Все подкатегории (с родителями) всегда могут быть выбраны
        return true;
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  
  // Helper function to get all available categories for a transaction type
  // Возвращает все категории данного типа, включая подкатегории
  export function getAllCategoriesForType(type: string): Category[] {
    return categories
      .filter(category => category.type === type)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  
  // Helper function to get selectable categories for a transaction type
  // Это категории, которые можно выбрать для транзакции:
  // - Категории без родителя и без детей
  // - Подкатегории (дочерние категории)
  export function getSelectableCategoriesForType(type: string): Category[] {
    return categories
      .filter(category => {
        // Категория должна быть указанного типа
        const isCorrectType = category.type === type;
        
        // Если это родительская категория (без родителя), она должна НЕ иметь дочерних элементов
        if (!category.parentId) {
          return isCorrectType && !hasChildCategories(category.id);
        }
        
        // Все подкатегории (с родителями) всегда могут быть выбраны
        return isCorrectType;
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  
  // Helper function to get parent categories for a specific transaction type
  // Только родительские категории (без родителя)
  export function getParentCategoriesForType(type: string): Category[] {
    return categories
      .filter(category => 
        category.type === type && 
        !category.parentId
      )
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  
  // Helper function to get parent categories that have children
  export function getParentCategoriesWithChildren(type: string): Category[] {
    return categories
      .filter(category => 
        category.type === type && 
        !category.parentId &&
        hasChildCategories(category.id)
      )
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  
  // Helper function to get child categories for a specific parent
  export function getChildCategories(parentId: string): Category[] {
    return categories
      .filter(category => category.parentId === parentId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }
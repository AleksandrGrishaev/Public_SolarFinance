// src/stores/category/defaultCategories.ts
import type { Category } from './types';

// Определения типов транзакций
export const transactionTypes = [
  { id: 'expense', name: 'Expense' },
  { id: 'income', name: 'Income' },
  { id: 'transfer', name: 'Transfer' }
];

export const filterTransactionTypes = [
  { id: 'all', name: 'All' },
  ...transactionTypes
];

// Категории верхнего уровня
const parentCategories: Category[] = [
  { 
    id: 'house', 
    name: 'House', 
    color: '#F8D76E', 
    icon: 'IconHome',
    type: 'expense',
    order: 0,
    isActive: true,
    books: ['my', 'family'] // Категория доступна в книгах "my" и "family"
  },
  { 
    id: 'food', 
    name: 'Food', 
    color: '#A2C94F', 
    icon: 'IconBread',
    type: 'expense',
    order: 1,
    isActive: true,
    books: ['my', 'family', 'wife'] // Доступна во всех книгах
  },
  { 
    id: 'transport', 
    name: 'Transport', 
    color: '#70B1E0', 
    icon: 'IconCar',
    type: 'expense',
    order: 2,
    isActive: true,
    books: ['my']
  },
  { 
    id: 'entertainment', 
    name: 'Entertainment', 
    color: '#E882A3', 
    icon: 'IconDeviceTv',
    type: 'expense',
    order: 3,
    isActive: true,
    books: ['family']
  },
  { 
    id: 'salary', 
    name: 'Salary', 
    color: '#5AD8B9', 
    icon: 'IconCoin',
    type: 'income',
    order: 0,
    isActive: true,
    books: ['my', 'wife']
  },
  { 
    id: 'investment', 
    name: 'Investment', 
    color: '#D8A55A', 
    icon: 'IconCoin',
    type: 'income',
    order: 1,
    isActive: true,
    books: []
  }
];

// Подкатегории
const childCategories: Category[] = [
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
    isActive: true,
    books: ['my', 'family']
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
    isActive: false,
    books: ['my', 'wife']
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
    isActive: false,
    books: []
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
    isActive: false,
    books: ['my', 'wife']
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
    isActive: false,
    books: ['family']
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
    isActive: false,
    books: ['my'] 
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
    isActive: false,
    books: []
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
    isActive: false,
    books: ['my']
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
    isActive: false,
    books: ['wife']
  }
];

// Отдельные категории без родителя
const standaloneCategories: Category[] = [
  { 
    id: 'health', 
    name: 'Health', 
    color: '#D85A5A', 
    icon: 'IconHeartbeat',
    type: 'expense',
    order: 5,
    isActive: false,
    books: []
  },
  { 
    id: 'education', 
    name: 'Education', 
    color: '#5AD8B9', 
    icon: 'IconBook',
    type: 'expense',
    order: 6,
    isActive: false,
    books: ['family']
  },
  { 
    id: 'shopping', 
    name: 'Shopping', 
    color: '#D8A55A', 
    icon: 'IconShoppingCart',
    type: 'expense',
    order: 7,
    isActive: false,
    books: ['wife']
  }
];

// Объединяем все категории в один массив
export const defaultCategories: Category[] = [
  ...parentCategories,
  ...childCategories,
  ...standaloneCategories
];
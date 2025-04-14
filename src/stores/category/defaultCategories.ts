// src/stores/category/defaultCategories.ts
// Предустановленные категории и связанные данные

// Importamos todos los tipos de nuestro archivo types.ts
import type { Category, Book, TransactionType, Account, Owner } from './types';

// Importamos solo los datos del categories.ts, no los tipos
import { 
  books, 
  transactionTypes, 
  filterTransactionTypes, 
  accounts, 
  owners 
} from '../../data/categories';

// Reexportamos datos para uso en otros módulos
export { books, transactionTypes, filterTransactionTypes, accounts, owners };

// Categorías principales con vinculación a libros
export const parentCategories: Category[] = [
  { 
    id: 'house', 
    name: 'House', 
    color: '#F8D76E', 
    icon: 'IconHome',
    type: 'expense',
    order: 0,
    isActive: true,
    books: ['my', 'family'] // Categoría disponible en libros "my" y "family"
  },
  { 
    id: 'food', 
    name: 'Food', 
    color: '#A2C94F', 
    icon: 'IconBread',
    type: 'expense',
    order: 1,
    isActive: true,
    books: ['my', 'family', 'wife'] // Disponible en todos los libros
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

// Subcategorías para categorías principales
export const childCategories: Category[] = [
  // Subcategorías para "House"
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
  
  // Subcategorías para "Food"
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
  
  // Subcategorías para "Transport"
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
  
  // Subcategorías para "Salary"
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

// Otras categorías sin padre
export const standaloneCategories: Category[] = [
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

// Combinamos todas las categorías en un solo array
export const defaultCategories: Category[] = [
  ...parentCategories,
  ...childCategories,
  ...standaloneCategories
];
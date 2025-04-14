// src/data/categories.ts

export interface Category {
  id: string;
  name: string;
  parentId?: string; // ID родительской категории
  parentName?: string; // Имя родительской категории (для удобства отображения)
  color: string;
  icon: string;
  type: 'expense' | 'income';
  order?: number;
  isActive?: boolean; // Архивирована категория или нет
  books?: string[]; // Список ID книг, к которым принадлежит категория
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

// Категории верхнего уровня с привязкой к книгам
export const parentCategories: Category[] = [
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

// Подкатегории для родительских категорий
export const childCategories: Category[] = [
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
    books: ['my']  // Добавляем к книге "my"
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

// Прочие категории без родителя
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

// Объединяем все категории в один массив
export const categories: Category[] = [
  ...parentCategories,
  ...childCategories,
  ...standaloneCategories
];
  
// Helper function to check if a category has children
export function hasChildCategories(categoryId: string): boolean {
  return categories.some(category => category.parentId === categoryId);
}

// Helper function to check if a category has children in a specific book
export function hasChildCategoriesInBook(categoryId: string, bookId: string): boolean {
  return categories.some(category => 
    category.parentId === categoryId && 
    category.books?.includes(bookId)
  );
}

// Helper function to get active categories for a book and type
export function getActiveCategoriesForBookAndType(bookId: string, type: string): Category[] {
  return categories.filter(category => 
    category.books?.includes(bookId) && // Принадлежит книге
    category.type === type &&          // Правильный тип
    category.isActive !== false        // Не архивирована
  );
}

// Helper function to get archived categories for a book and type
export function getArchivedCategoriesForBookAndType(bookId: string, type: string): Category[] {
  return categories.filter(category => 
    category.books?.includes(bookId) && // Принадлежит книге
    category.type === type &&          // Правильный тип
    category.isActive === false        // Архивирована
  );
}

// Helper function to get all categories for a book and type (active and archived)
export function getAllCategoriesForBookAndType(bookId: string, type: string): Category[] {
  return categories.filter(category => 
    category.books?.includes(bookId) && // Принадлежит книге
    category.type === type             // Правильный тип
  );
}

// Helper function to get selectable categories for a specific book and transaction type
export function getCategoriesForBookAndType(bookId: string, type: string): Category[] {
  // Шаг 1: Получаем ВСЕ категории для книги и типа
  const allCategoriesInBook = getAllCategoriesForBookAndType(bookId, type);
  
  // Шаг 2: Разделяем на активные и архивные
  const activeCategories = getActiveCategoriesForBookAndType(bookId, type);
  
  // Шаг 3: Проверяем родительские категории
  return activeCategories.filter(category => {
    // Если это дочерняя категория, включаем её
    if (category.parentId) {
      return true;
    }
    
    // Для родительских категорий проверяем, есть ли у них АКТИВНЫЕ дочерние
    // категории в этой книге
    const hasActiveChildrenInBook = activeCategories.some(child => 
      child.parentId === category.id
    );
    
    // Дополнительная проверка: если родительская категория принадлежит книге,
    // но все ее дочерние категории архивированы или не принадлежат этой книге,
    // то не включаем родительскую категорию
    const hasAnyChildrenInBook = allCategoriesInBook.some(child => 
      child.parentId === category.id
    );
    
    // Если у родительской категории есть активные дочерние элементы,
    // то НЕ включаем ее (она будет только группой)
    if (hasActiveChildrenInBook) {
      return false;
    }
    
    // Если у родительской категории есть дочерние элементы в этой книге,
    // но все они архивированы, то не включаем родительскую категорию
    if (hasAnyChildrenInBook) {
      return false;
    }
    
    // Если у родительской категории нет дочерних элементов в этой книге,
    // или все дочерние элементы не принадлежат этой книге, то включаем её
    return true;
  }).sort((a, b) => (a.order || 0) - (b.order || 0));
}

// Helper function to get all available categories for a transaction type
export function getAllCategoriesForType(type: string): Category[] {
  return categories
    .filter(category => category.type === type)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

// Helper function to get all categories for a specific book
export function getCategoriesForBook(bookId: string): Category[] {
  return categories
    .filter(category => category.books?.includes(bookId))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

// Helper function to get parent categories for a specific transaction type
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

// Helper function to get child categories for a specific parent in a specific book
export function getChildCategoriesInBook(parentId: string, bookId: string): Category[] {
  return categories
    .filter(category => 
      category.parentId === parentId && 
      category.books?.includes(bookId)
    )
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

// Helper function to get selectable categories for a transaction type
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
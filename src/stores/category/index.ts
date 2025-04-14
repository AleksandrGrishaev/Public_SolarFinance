// src/stores/category/index.ts
// Централизованные экспорты для модуля категорий

// Экспортируем типы из types.ts
export type { 
  Category, 
  CategorySearchResult, 
  CategoryState
} from './types';

// Экспортируем данные из defaultCategories.ts
export { 
  defaultCategories,
  transactionTypes, 
  filterTransactionTypes
} from './defaultCategories';

// Экспортируем сервис категорий
export { CategoryService } from './categoryService';

// Экспортируем стор категорий
export { useCategoryStore } from './categoryStore';


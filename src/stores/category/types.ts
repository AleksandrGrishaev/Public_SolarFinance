// src/stores/category/types.ts
// Определение основных типов для модуля категорий

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

// Тип для результатов поиска категорий
export interface CategorySearchResult {
  // Категории-родители с дочерними элементами
  parentCategories: Category[];
  // Самостоятельные категории (без родителя и не имеющие дочерних)
  standaloneCategories: Category[];
}

// Тип для состояния хранилища категорий
export interface CategoryState {
  categories: Category[];
  transactionTypes: string[];
  filterTransactionTypes: string[];
}
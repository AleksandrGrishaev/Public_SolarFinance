// src/stores/category/index.ts
// Exportaciones centralizadas para el módulo de categorías

// Exportamos todos los tipos desde types.ts
export type { 
    Category, 
    CategorySearchResult, 
    CategoryState,
    Book,
    TransactionType,
    Account,
    Owner
  } from './types';
  
  // Exportamos los datos desde defaultCategories.ts
  export { 
    books, 
    transactionTypes, 
    filterTransactionTypes, 
    accounts, 
    owners, 
    defaultCategories 
  } from './defaultCategories';
  
  // Exportamos el servicio de categorías
  export { CategoryService } from './categoryService';
  
  // Exportamos el store de categorías
  export { useCategoryStore } from './categoryStore';
  
  // Para compatibilidad con código anterior - exportación de funciones a través del store
  export const getCategoriesForBookAndType = (bookId: string, type: string) => {
    const store = useCategoryStore();
    return store.getCategoriesForBookAndType(bookId, type);
  };
  
  export const getAllCategoriesForType = (type: string) => {
    const store = useCategoryStore();
    return store.getAllCategoriesForType(type);
  };
  
  export const getActiveCategoriesForBookAndType = (bookId: string, type: string) => {
    const store = useCategoryStore();
    return store.getActiveCategoriesForBookAndType(bookId, type);
  };
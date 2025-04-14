// src/stores/category/categoryStore.ts
// Pinia store для управления состоянием категорий

import { defineStore } from 'pinia';
import type { 
  CategoryState, 
  Category, 
  CategorySearchResult 
} from './types';
import { 
  defaultCategories,
  books, 
  transactionTypes, 
  filterTransactionTypes 
} from './defaultCategories';
import { CategoryService } from './categoryService';

export const useCategoryStore = defineStore('category', {
  state: (): CategoryState => ({
    categories: JSON.parse(JSON.stringify(defaultCategories)), // Используем deep clone для избежания мутации исходных данных
    books: JSON.parse(JSON.stringify(books.map(b => b.id))),
    transactionTypes: JSON.parse(JSON.stringify(transactionTypes.map(t => t.id))),
    filterTransactionTypes: JSON.parse(JSON.stringify(filterTransactionTypes.map(t => t.id)))
  }),

  getters: {
    // Создаем экземпляр сервиса категорий
    categoryService(): CategoryService {
      return new CategoryService(this.categories);
    },

    // Получаем данные книг из импортированного модуля
    allBooks() {
      return books;
    },

    // Получаем данные типов транзакций из импортированного модуля
    allTransactionTypes() {
      return transactionTypes;
    },

    // Получаем данные типов транзакций для фильтров из импортированного модуля
    allFilterTransactionTypes() {
      return filterTransactionTypes;
    },

    // ПРОВЕРКА ИЕРАРХИИ
    
    hasChildCategories(): (categoryId: string) => boolean {
      return (categoryId: string) => this.categoryService.hasChildCategories(categoryId);
    },

    hasChildCategoriesInBook(): (categoryId: string, bookId: string) => boolean {
      return (categoryId: string, bookId: string) => 
        this.categoryService.hasChildCategoriesInBook(categoryId, bookId);
    },

    // ПОЛУЧЕНИЕ КАТЕГОРИЙ ПО ФИЛЬТРАМ
    
    getActiveCategoriesForBookAndType(): (bookId: string, type: string) => Category[] {
      return (bookId: string, type: string) => 
        this.categoryService.getActiveCategoriesForBookAndType(bookId, type);
    },

    getArchivedCategoriesForBookAndType(): (bookId: string, type: string) => Category[] {
      return (bookId: string, type: string) => 
        this.categoryService.getArchivedCategoriesForBookAndType(bookId, type);
    },

    getAllCategoriesForBookAndType(): (bookId: string, type: string) => Category[] {
      return (bookId: string, type: string) => 
        this.categoryService.getAllCategoriesForBookAndType(bookId, type);
    },

    getCategoriesForBookAndType(): (bookId: string, type: string) => Category[] {
      return (bookId: string, type: string) => 
        this.categoryService.getCategoriesForBookAndType(bookId, type);
    },

    getAllCategoriesForType(): (type: string) => Category[] {
      return (type: string) => this.categoryService.getAllCategoriesForType(type);
    },

    getCategoriesForBook(): (bookId: string) => Category[] {
      return (bookId: string) => this.categoryService.getCategoriesForBook(bookId);
    },

    // РАБОТА С РОДИТЕЛЯМИ И ДЕТЬМИ
    
    getParentCategoriesForType(): (type: string) => Category[] {
      return (type: string) => this.categoryService.getParentCategoriesForType(type);
    },

    getParentCategoriesWithChildren(): (type: string) => Category[] {
      return (type: string) => this.categoryService.getParentCategoriesWithChildren(type);
    },

    getChildCategories(): (parentId: string) => Category[] {
      return (parentId: string) => this.categoryService.getChildCategories(parentId);
    },

    getChildCategoriesInBook(): (parentId: string, bookId: string) => Category[] {
      return (parentId: string, bookId: string) => 
        this.categoryService.getChildCategoriesInBook(parentId, bookId);
    },

    getSelectableCategoriesForType(): (type: string) => Category[] {
      return (type: string) => this.categoryService.getSelectableCategoriesForType(type);
    },

    // ВСПОМОГАТЕЛЬНЫЕ ГЕТТЕРЫ

    getCategoriesGroupedByParent(): (categories: Category[]) => CategorySearchResult {
      return (categories: Category[]) => 
        this.categoryService.getCategoriesGroupedByParent(categories);
    },

    getParentCategory(): (parentId: string) => Category | null {
      return (parentId: string) => this.categoryService.getParentCategory(parentId);
    },

    getCategoryById(): (categoryId: string) => Category | null {
      return (categoryId: string) => this.categoryService.getCategoryById(categoryId);
    }
  },

  actions: {
    // CRUD ОПЕРАЦИИ
    
    addCategory(category: Category): Category {
      const newCategory = this.categoryService.addCategory(category);
      return newCategory;
    },

    updateCategory(updatedCategory: Category): Category | null {
      return this.categoryService.updateCategory(updatedCategory);
    },

    deleteCategory(categoryId: string): boolean {
      return this.categoryService.deleteCategory(categoryId);
    },

    toggleCategoryActive(categoryId: string, isActive: boolean): Category | null {
      return this.categoryService.toggleCategoryActive(categoryId, isActive);
    },

    // ОПЕРАЦИИ С КНИГАМИ
    
    addCategoryToBook(categoryId: string, bookId: string): Category | null {
      return this.categoryService.addCategoryToBook(categoryId, bookId);
    },

    removeCategoryFromBook(categoryId: string, bookId: string): Category | null {
      return this.categoryService.removeCategoryFromBook(categoryId, bookId);
    },

    // ОПЕРАЦИИ МАССОВОГО ОБНОВЛЕНИЯ
    
    setCategories(categories: Category[]): void {
      this.categories = categories;
      // Обновляем сервис категорий
      this.categoryService.setCategories(categories);
    },

    resetToDefaults(): void {
      this.categories = JSON.parse(JSON.stringify(defaultCategories));
      this.books = JSON.parse(JSON.stringify(books.map(b => b.id)));
      this.transactionTypes = JSON.parse(JSON.stringify(transactionTypes.map(t => t.id)));
      this.filterTransactionTypes = JSON.parse(JSON.stringify(filterTransactionTypes.map(t => t.id)));
    }
  }
});
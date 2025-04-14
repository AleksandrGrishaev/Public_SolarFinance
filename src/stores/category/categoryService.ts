// src/stores/category/categoryService.ts
// Сервисный класс для работы с категориями

import type { Category, CategorySearchResult } from './types';

export class CategoryService {
  private categories: Category[];

  constructor(categories: Category[]) {
    this.categories = categories;
  }

  // Обновить список категорий
  setCategories(categories: Category[]): void {
    this.categories = categories;
  }

  // Получить все категории
  getAllCategories(): Category[] {
    return this.categories;
  }

  // ПРОВЕРКА ИЕРАРХИИ КАТЕГОРИЙ

  // Проверить, имеет ли категория дочерние элементы
  hasChildCategories(categoryId: string): boolean {
    return this.categories.some(category => category.parentId === categoryId);
  }

  // Проверить, имеет ли категория дочерние элементы в определенной книге
  hasChildCategoriesInBook(categoryId: string, bookId: string): boolean {
    return this.categories.some(category => 
      category.parentId === categoryId && 
      category.books?.includes(bookId)
    );
  }

  // ПОЛУЧЕНИЕ КАТЕГОРИЙ ПО ФИЛЬТРАМ

  // Получить активные категории для книги и типа транзакции
  getActiveCategoriesForBookAndType(bookId: string, type: string): Category[] {
    return this.categories.filter(category => 
      category.books?.includes(bookId) && // Принадлежит книге
      category.type === type &&          // Правильный тип
      category.isActive !== false        // Не архивирована
    );
  }

  // Получить архивированные категории для книги и типа транзакции
  getArchivedCategoriesForBookAndType(bookId: string, type: string): Category[] {
    return this.categories.filter(category => 
      category.books?.includes(bookId) && // Принадлежит книге
      category.type === type &&          // Правильный тип
      category.isActive === false        // Архивирована
    );
  }

  // Получить все категории для книги и типа транзакции (активные и архивированные)
  getAllCategoriesForBookAndType(bookId: string, type: string): Category[] {
    return this.categories.filter(category => 
      category.books?.includes(bookId) && // Принадлежит книге
      category.type === type             // Правильный тип
    );
  }

  // Получить категории для книги и типа (с фильтрацией выбираемых)
  getCategoriesForBookAndType(bookId: string, type: string): Category[] {
    // Шаг 1: Получаем ВСЕ категории для книги и типа
    const allCategoriesInBook = this.getAllCategoriesForBookAndType(bookId, type);
    
    // Шаг 2: Разделяем на активные и архивные
    const activeCategories = this.getActiveCategoriesForBookAndType(bookId, type);
    
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

  // Получить все категории для типа транзакции
  getAllCategoriesForType(type: string): Category[] {
    return this.categories
      .filter(category => category.type === type)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  // Получить все категории для книги
  getCategoriesForBook(bookId: string): Category[] {
    return this.categories
      .filter(category => category.books?.includes(bookId))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  // РАБОТА С РОДИТЕЛЬСКИМИ И ДОЧЕРНИМИ КАТЕГОРИЯМИ

  // Получить родительские категории для типа транзакции
  getParentCategoriesForType(type: string): Category[] {
    return this.categories
      .filter(category => 
        category.type === type && 
        !category.parentId
      )
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  // Получить родительские категории, у которых есть дети
  getParentCategoriesWithChildren(type: string): Category[] {
    return this.categories
      .filter(category => 
        category.type === type && 
        !category.parentId &&
        this.hasChildCategories(category.id)
      )
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  // Получить дочерние категории для родителя
  getChildCategories(parentId: string): Category[] {
    return this.categories
      .filter(category => category.parentId === parentId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  // Получить дочерние категории для родителя в определенной книге
  getChildCategoriesInBook(parentId: string, bookId: string): Category[] {
    return this.categories
      .filter(category => 
        category.parentId === parentId && 
        category.books?.includes(bookId)
      )
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  // Получить выбираемые категории для типа транзакции
  getSelectableCategoriesForType(type: string): Category[] {
    return this.categories
      .filter(category => {
        // Категория должна быть указанного типа
        const isCorrectType = category.type === type;
        
        // Если это родительская категория (без родителя), она должна НЕ иметь дочерних элементов
        if (!category.parentId) {
          return isCorrectType && !this.hasChildCategories(category.id);
        }
        
        // Все подкатегории (с родителями) всегда могут быть выбраны
        return isCorrectType;
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  // CRUD ОПЕРАЦИИ

  // Добавить новую категорию
  addCategory(category: Category): Category {
    // Если не указан id, генерируем его
    if (!category.id) {
      category.id = 'category_' + Date.now();
    }
    
    // Если не указан порядок, ставим в конец
    if (category.order === undefined) {
      const maxOrder = Math.max(
        ...this.categories
          .filter(c => c.type === category.type)
          .map(c => c.order || 0),
        0 // Добавляем 0 как минимальное значение, чтобы избежать -Infinity
      );
      category.order = maxOrder + 1;
    }
    
    // Добавляем категорию в список
    this.categories.push(category);
    
    return category;
  }

  // Обновить существующую категорию
  updateCategory(updatedCategory: Category): Category | null {
    const index = this.categories.findIndex(c => c.id === updatedCategory.id);
    if (index !== -1) {
      this.categories[index] = { ...this.categories[index], ...updatedCategory };
      return this.categories[index];
    }
    return null;
  }

  // Удалить категорию
  deleteCategory(categoryId: string): boolean {
    // Проверяем, имеет ли категория дочерние элементы
    if (this.hasChildCategories(categoryId)) {
      // Нельзя удалить категорию с дочерними элементами
      return false;
    }
    
    const index = this.categories.findIndex(c => c.id === categoryId);
    if (index !== -1) {
      this.categories.splice(index, 1);
      return true;
    }
    return false;
  }

  // Архивировать/разархивировать категорию
  toggleCategoryActive(categoryId: string, isActive: boolean): Category | null {
    const index = this.categories.findIndex(c => c.id === categoryId);
    if (index !== -1) {
      this.categories[index].isActive = isActive;
      return this.categories[index];
    }
    return null;
  }

  // Добавить категорию в книгу
  addCategoryToBook(categoryId: string, bookId: string): Category | null {
    const index = this.categories.findIndex(c => c.id === categoryId);
    if (index !== -1) {
      if (!this.categories[index].books) {
        this.categories[index].books = [];
      }
      
      if (!this.categories[index].books.includes(bookId)) {
        this.categories[index].books.push(bookId);
      }
      
      return this.categories[index];
    }
    return null;
  }

  // Удалить категорию из книги
  removeCategoryFromBook(categoryId: string, bookId: string): Category | null {
    const index = this.categories.findIndex(c => c.id === categoryId);
    if (index !== -1 && this.categories[index].books) {
      const bookIndex = this.categories[index].books!.indexOf(bookId);
      if (bookIndex !== -1) {
        this.categories[index].books!.splice(bookIndex, 1);
      }
      return this.categories[index];
    }
    return null;
  }

  // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ

  // Группировка категорий по родителям и самостоятельным
  getCategoriesGroupedByParent(categories: Category[]): CategorySearchResult {
    // Сначала получим все уникальные ID родителей
    const parentIds = new Set<string>();
    categories.forEach(cat => {
      if (cat.parentId) {
        parentIds.add(cat.parentId);
      }
    });

    // Теперь найдем родительские категории
    const parentCategories = this.categories
      .filter(cat => parentIds.has(cat.id))
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    // И самостоятельные категории (без родителя и не являющиеся родителями)
    const standaloneCategories = categories
      .filter(cat => {
        // Не должно быть родителя
        if (cat.parentId) return false;
        
        // И не должно быть в списке родителей
        return !parentIds.has(cat.id);
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return { parentCategories, standaloneCategories };
  }

  // Получить родительскую категорию по ID
  getParentCategory(parentId: string): Category | null {
    return this.categories.find(cat => cat.id === parentId) || null;
  }

  // Получить категорию по ID
  getCategoryById(categoryId: string): Category | null {
    return this.categories.find(cat => cat.id === categoryId) || null;
  }
}
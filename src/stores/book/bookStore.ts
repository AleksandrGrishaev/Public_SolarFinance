// src/stores/book/bookStore.ts
import { defineStore } from 'pinia';
import { BookService } from './bookService';
import type { Book, BookType } from './types';

export const useBookStore = defineStore('book', {
  state: () => ({
    books: [] as Book[],
    isInitialized: false,
    loading: false
  }),
  
  getters: {
    // Сервис для работы с книгами
    bookService: () => new BookService(),
    
    // Получение всех активных книг
    activeBooks(): Book[] {
      return this.books.filter(book => book.isActive);
    },
    
    // Получение книг по типу
    getBooksByType(): (type: BookType) => Book[] {
      return (type: BookType) => this.books.filter(book => book.type === type);
    },
    
    // Получение книг по ID владельца
    getBooksByOwnerId(): (ownerId: string) => Book[] {
      return (ownerId: string) => this.books.filter(book => book.ownerIds.includes(ownerId));
    },
    
    // Получение книги по ID
    getBookById(): (id: string) => Book | undefined {
      return (id: string) => this.books.find(book => book.id === id);
    },
    
    // Формат книг для селектора в интерфейсе
    booksForSelector(): { id: string, name: string }[] {
      return this.activeBooks.map(book => ({
        id: book.id,
        name: book.name
      }));
    }
  },
  
  actions: {
    /**
     * Инициализация хранилища книг
     */
    async init() {
      if (this.isInitialized) return;
      
      try {
        this.loading = true;
        console.log('[BookStore] Initializing book store');
        
        // Создаем книги по умолчанию, если их нет
        await this.bookService.ensureDefaultBooks();
        
        // Загружаем все книги
        const books = await this.bookService.getBooks();
        this.books = books;
        
        this.isInitialized = true;
        console.log('[BookStore] Initialized with', books.length, 'books');
        return true;
      } catch (error) {
        console.error('[BookStore] Initialization error:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Добавление новой книги
     */
    async addBook(bookData: Omit<Book, 'id'>): Promise<Book> {
      try {
        this.loading = true;
        const newBook = await this.bookService.addBook(bookData);
        this.books.push(newBook);
        return newBook;
      } catch (error) {
        console.error('[BookStore] Error adding book:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Обновление книги
     */
    async updateBook(id: string, bookData: Partial<Book>): Promise<boolean> {
      try {
        this.loading = true;
        const success = await this.bookService.updateBook(id, bookData);
        
        if (success) {
          // Обновляем книгу в локальном состоянии
          const index = this.books.findIndex(book => book.id === id);
          if (index !== -1) {
            this.books[index] = { ...this.books[index], ...bookData, updatedAt: new Date() };
          }
        }
        
        return success;
      } catch (error) {
        console.error(`[BookStore] Error updating book ${id}:`, error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Удаление книги
     */
    async deleteBook(id: string): Promise<boolean> {
      try {
        this.loading = true;
        const success = await this.bookService.deleteBook(id);
        
        if (success) {
          // Удаляем книгу из локального состояния
          this.books = this.books.filter(book => book.id !== id);
        }
        
        return success;
      } catch (error) {
        console.error(`[BookStore] Error deleting book ${id}:`, error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Установка активности книги
     */
    async setBookActive(id: string, isActive: boolean): Promise<boolean> {
      return this.updateBook(id, { isActive });
    },
    
    /**
     * Обновление всех данных книг (для синхронизации)
     */
    async refreshBooks(): Promise<void> {
      try {
        this.loading = true;
        const books = await this.bookService.getBooks();
        this.books = books;
        console.log('[BookStore] Books refreshed');
      } catch (error) {
        console.error('[BookStore] Error refreshing books:', error);
      } finally {
        this.loading = false;
      }
    }
  }
});
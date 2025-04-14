// src/stores/book/bookService.ts
import type { Book } from './types';
import { defaultBooks } from './defaultBooks';
import { LocalStorageApiService } from '@/services/api/LocalStorageApiService';

export class BookService {
  private apiService: LocalStorageApiService;
  private readonly STORAGE_KEY = 'family-finance-app_books';

  constructor() {
    this.apiService = new LocalStorageApiService();
  }

  /**
   * Получение всех книг
   */
  async getBooks(): Promise<Book[]> {
    try {
      return await this.apiService.get<Book[]>('/books');
    } catch (error) {
      console.error('[BookService] Error getting books:', error);
      return [];
    }
  }

  /**
   * Получение книги по ID
   */
  async getBookById(id: string): Promise<Book | null> {
    try {
      return await this.apiService.get<Book>(`/books/${id}`);
    } catch (error) {
      console.error(`[BookService] Error getting book with id ${id}:`, error);
      return null;
    }
  }

  /**
   * Получение книг по ID владельца
   */
  async getBooksByOwnerId(ownerId: string): Promise<Book[]> {
    try {
      const books = await this.getBooks();
      return books.filter(book => book.ownerIds.includes(ownerId));
    } catch (error) {
      console.error(`[BookService] Error getting books for owner ${ownerId}:`, error);
      return [];
    }
  }

  /**
   * Добавление новой книги
   */
  async addBook(newBook: Omit<Book, 'id'>): Promise<Book> {
    const books = await this.getBooks();
    // Генерируем уникальный ID
    const id = `book_${Date.now()}`;
    
    const bookWithId = { ...newBook, id };
    
    try {
      await this.apiService.post('/books', bookWithId);
      console.log('[BookService] Book added:', bookWithId.name);
      return bookWithId;
    } catch (error) {
      console.error('[BookService] Error adding book:', error);
      throw error;
    }
  }

  /**
   * Обновление книги
   */
  async updateBook(id: string, bookData: Partial<Book>): Promise<boolean> {
    try {
      await this.apiService.put(`/books/${id}`, bookData);
      console.log('[BookService] Book updated:', id);
      return true;
    } catch (error) {
      console.error(`[BookService] Error updating book ${id}:`, error);
      return false;
    }
  }

  /**
   * Удаление книги
   */
  async deleteBook(id: string): Promise<boolean> {
    try {
      await this.apiService.delete(`/books/${id}`);
      console.log('[BookService] Book deleted:', id);
      return true;
    } catch (error) {
      console.error(`[BookService] Error deleting book ${id}:`, error);
      return false;
    }
  }

  /**
   * Создание книг по умолчанию, если нет ни одной
   */
  async ensureDefaultBooks(): Promise<void> {
    const books = await this.getBooks();
    
    if (books.length === 0) {
      // Используем книги из defaultBooks.ts
      for (const book of defaultBooks) {
        await this.apiService.post('/books', book);
      }
      console.log('[BookService] Created default books');
    }
  }
}
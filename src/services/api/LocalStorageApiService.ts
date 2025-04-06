import { type ApiService } from './ApiService';

/**
 * Реализация сервиса API через localStorage
 */
export class LocalStorageApiService implements ApiService {
  /**
   * Генерирует ключ для элемента в localStorage
   */
  private getStorageKey(url: string): string {
    return `family-finance-app${url.replace(/\//g, '_')}`;
  }
  
  /**
   * Генерирует ключ для коллекции в localStorage
   */
  private getCollectionKey(url: string): string {
    const parts = url.split('/');
    return `family-finance-app_${parts[1]}`;
  }
  
  /**
   * Получает данные из localStorage
   */
  async get<T>(url: string): Promise<T> {
    const parts = url.split('/');
    
    // Если запрос на коллекцию (например, /accounts)
    if (parts.length === 2) {
      const key = this.getCollectionKey(url);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    }
    
    // Если запрос на конкретный элемент (например, /accounts/123)
    if (parts.length === 3) {
      const collectionKey = `family-finance-app_${parts[1]}`;
      const id = parts[2];
      
      const collectionData = localStorage.getItem(collectionKey);
      const collection = collectionData ? JSON.parse(collectionData) : [];
      
      const item = collection.find((item: any) => item.id === id);
      
      if (!item) {
        throw new Error(`Item with id ${id} not found`);
      }
      
      return item;
    }
    
    throw new Error(`Invalid URL format: ${url}`);
  }
  
  /**
   * Сохраняет данные в localStorage
   */
  async post<T>(url: string, data: any): Promise<T> {
    const parts = url.split('/');
    
    if (parts.length !== 2) {
      throw new Error(`Invalid URL format for POST: ${url}`);
    }
    
    const collectionKey = this.getCollectionKey(url);
    const collectionData = localStorage.getItem(collectionKey);
    const collection = collectionData ? JSON.parse(collectionData) : [];
    
    // Добавляем новый элемент в коллекцию
    collection.push(data);
    
    // Сохраняем обновленную коллекцию
    localStorage.setItem(collectionKey, JSON.stringify(collection));
    
    return data;
  }
  
  /**
   * Обновляет данные в localStorage
   */
  async put<T>(url: string, data: any): Promise<T> {
    const parts = url.split('/');
    
    if (parts.length !== 3) {
      throw new Error(`Invalid URL format for PUT: ${url}`);
    }
    
    const collectionKey = `family-finance-app_${parts[1]}`;
    const id = parts[2];
    
    const collectionData = localStorage.getItem(collectionKey);
    const collection = collectionData ? JSON.parse(collectionData) : [];
    
    // Находим индекс элемента для обновления
    const index = collection.findIndex((item: any) => item.id === id);
    
    if (index === -1) {
      throw new Error(`Item with id ${id} not found`);
    }
    
    // Обновляем элемент с сохранением существующих полей
    const updatedItem = {
      ...collection[index],
      ...data,
      id // Гарантируем, что ID не изменился
    };
    
    collection[index] = updatedItem;
    
    // Сохраняем обновленную коллекцию
    localStorage.setItem(collectionKey, JSON.stringify(collection));
    
    return updatedItem;
  }
  
  /**
   * Удаляет данные из localStorage
   */
  async delete(url: string): Promise<void> {
    const parts = url.split('/');
    
    if (parts.length !== 3) {
      throw new Error(`Invalid URL format for DELETE: ${url}`);
    }
    
    const collectionKey = `family-finance-app_${parts[1]}`;
    const id = parts[2];
    
    const collectionData = localStorage.getItem(collectionKey);
    const collection = collectionData ? JSON.parse(collectionData) : [];
    
    // Фильтруем коллекцию, исключая элемент для удаления
    const updatedCollection = collection.filter((item: any) => item.id !== id);
    
    // Сохраняем обновленную коллекцию
    localStorage.setItem(collectionKey, JSON.stringify(updatedCollection));
  }
}
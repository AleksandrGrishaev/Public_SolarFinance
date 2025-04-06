// src/services/BaseCrudService.ts
import { type BaseEntity } from '@/types/base';
import { type ApiService } from './api/ApiService';

/**
 * Интерфейс для базового CRUD сервиса
 */
export interface BaseCrudService<
  T extends BaseEntity, 
  CreateDTO = Omit<T, 'id' | 'createdAt' | 'updatedAt'>, 
  UpdateDTO = Partial<CreateDTO>
> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(data: CreateDTO): Promise<T>;
  update(id: string, data: UpdateDTO): Promise<T>;
  delete(id: string): Promise<boolean>;
}

/**
 * Базовая реализация CRUD сервиса
 */
export abstract class BaseCrudServiceImpl<
  T extends BaseEntity, 
  CreateDTO = Omit<T, 'id' | 'createdAt' | 'updatedAt'>, 
  UpdateDTO = Partial<CreateDTO>
> implements BaseCrudService<T, CreateDTO, UpdateDTO> {
  
  protected abstract entityName: string;
  protected apiService: ApiService;
  
  constructor(apiService: ApiService) {
    this.apiService = apiService;
  }
  
  /**
   * Получает все сущности
   */
  async getAll(): Promise<T[]> {
    return this.apiService.get<T[]>(`/${this.entityName}`);
  }
  
  /**
   * Получает сущность по ID
   */
  async getById(id: string): Promise<T | null> {
    try {
      return await this.apiService.get<T>(`/${this.entityName}/${id}`);
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Создает новую сущность
   */
  async create(data: CreateDTO): Promise<T> {
    const newItem = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    } as unknown as T;
    
    return this.apiService.post<T>(`/${this.entityName}`, newItem);
  }
  
  /**
   * Обновляет существующую сущность
   */
  async update(id: string, data: UpdateDTO): Promise<T> {
    const updatedItem = {
      ...data,
      updatedAt: new Date()
    };
    
    return this.apiService.put<T>(`/${this.entityName}/${id}`, updatedItem);
  }
  
  /**
   * Удаляет сущность
   */
  async delete(id: string): Promise<boolean> {
    await this.apiService.delete(`/${this.entityName}/${id}`);
    return true;
  }
}
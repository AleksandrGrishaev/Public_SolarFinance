// src/stores/user/userService.ts
import type { User } from './types';
import { LocalStorageApiService } from '@/services/api/LocalStorageApiService';

export class UserService {
  private apiService: LocalStorageApiService;
  private readonly STORAGE_KEY = 'family-finance-app_users';
  private readonly AUTH_TOKEN_KEY = 'family-finance-app_auth_token';
  private readonly CURRENT_USER_KEY = 'family-finance-app_current_user';

  constructor() {
    this.apiService = new LocalStorageApiService();
  }

  /**
   * Получение всех пользователей
   */
  async getUsers(): Promise<User[]> {
    try {
      return await this.apiService.get<User[]>('/users');
    } catch (error) {
      console.error('[UserService] Error getting users:', error);
      return [];
    }
  }

  /**
   * Получение пользователя по ID
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      return await this.apiService.get<User>(`/users/${id}`);
    } catch (error) {
      console.error(`[UserService] Error getting user with id ${id}:`, error);
      return null;
    }
  }

  /**
   * Поиск пользователя по PIN-коду
   */
  async getUserByPin(pin: string): Promise<User | null> {
    try {
      const users = await this.getUsers();
      return users.find(user => user.pin === pin && user.isActive) || null;
    } catch (error) {
      console.error('[UserService] Error finding user by PIN:', error);
      return null;
    }
  }

  /**
   * Сохранение текущего пользователя в localStorage
   */
  saveCurrentUser(user: User): void {
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
  }

  /**
   * Получение текущего пользователя из localStorage
   */
  getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.CURRENT_USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Удаление информации о текущем пользователе
   */
  clearCurrentUser(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  /**
   * Сохранение токена аутентификации
   */
  saveAuthToken(token: string): void {
    localStorage.setItem(this.AUTH_TOKEN_KEY, token);
  }

  /**
   * Получение токена аутентификации
   */
  getAuthToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  /**
   * Удаление токена аутентификации
   */
  clearAuthToken(): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
  }

  /**
   * Создание пользователя по умолчанию, если нет ни одного
   */
  async ensureDefaultUsers(): Promise<void> {
    const users = await this.getUsers();
    
    if (users.length === 0) {
      const now = new Date();
      const defaultUsers: User[] = [
        {
          id: 'user_1',
          name: 'Alex',
          type: 'user',
          username: 'admin',
          pin: '1234',
          email: 'admin@example.com',
          roles: ['admin'],
          isActive: true,
          createdAt: now,
          updatedAt: now,
          settings: {
            theme: 'system',
            language: 'en'
          }
        },
        {
          id: 'user_2',
          name: 'Wife',
          type: 'user',
          username: 'user',
          pin: '5678',
          email: 'wife@example.com',
          roles: ['regular'],
          isActive: true,
          createdAt: now,
          updatedAt: now,
          settings: {
            theme: 'light',
            language: 'en'
          }
        }
      ];
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultUsers));
      console.log('[UserService] Created default users');
    }
  }
}
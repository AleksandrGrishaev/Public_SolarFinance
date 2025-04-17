// src/stores/user/userService.ts
import type { User } from './types';
import { defaultUsers } from './defaultUsers';
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
   * Получение активных пользователей
   */
  async getActiveUsers(): Promise<User[]> {
    try {
      const users = await this.getUsers();
      return users.filter(user => user.isActive);
    } catch (error) {
      console.error('[UserService] Error getting active users:', error);
      return [];
    }
  }

  /**
   * Получение пользователей, кроме указанного
   */
  async getOtherUsers(excludeUserId: string): Promise<User[]> {
    try {
      const users = await this.getUsers();
      return users.filter(user => 
        user.id !== excludeUserId && 
        user.isActive
      );
    } catch (error) {
      console.error(`[UserService] Error getting other users:`, error);
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
   * Получение имени пользователя по ID
   */
  async getUserNameById(id: string, defaultName: string = 'Unknown User'): Promise<string> {
    try {
      const user = await this.getUserById(id);
      return user ? user.name : defaultName;
    } catch (error) {
      console.error(`[UserService] Error getting user name for id ${id}:`, error);
      return defaultName;
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
    // Для обратной совместимости
    localStorage.setItem('user_id', user.id.toString());
    localStorage.setItem('user_data', JSON.stringify(user));
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
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_data');
  }

  /**
   * Сохранение токена аутентификации
   */
  saveAuthToken(token: string): void {
    localStorage.setItem(this.AUTH_TOKEN_KEY, token);
    localStorage.setItem('auth_token', token); // Для обратной совместимости
  }

  /**
   * Получение токена аутентификации
   */
  getAuthToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY) || localStorage.getItem('auth_token');
  }

  /**
   * Удаление токена аутентификации
   */
  clearAuthToken(): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem('auth_token');
  }

  /**
   * Добавление нового пользователя
   */
  async addUser(newUser: Omit<User, 'id'>): Promise<User> {
    const users = await this.getUsers();
    const id = `user_${Math.max(0, ...users.map(u => 
      parseInt(u.id.toString().replace('user_', '') || '0')
    )) + 1}`;
    
    const userWithId = { ...newUser, id };
    
    try {
      await this.apiService.post('/users', userWithId);
      console.log('[UserService] User added:', userWithId.name);
      return userWithId;
    } catch (error) {
      console.error('[UserService] Error adding user:', error);
      throw error;
    }
  }

  /**
   * Обновление пользователя
   */
  async updateUser(id: string, userData: Partial<User>): Promise<boolean> {
    try {
      await this.apiService.put(`/users/${id}`, userData);
      
      // Обновляем текущего пользователя, если это он
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === id) {
        this.saveCurrentUser({ ...currentUser, ...userData });
      }
      
      console.log('[UserService] User updated:', id);
      return true;
    } catch (error) {
      console.error(`[UserService] Error updating user ${id}:`, error);
      return false;
    }
  }

  /**
   * Удаление пользователя
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      await this.apiService.delete(`/users/${id}`);
      console.log('[UserService] User deleted:', id);
      return true;
    } catch (error) {
      console.error(`[UserService] Error deleting user ${id}:`, error);
      return false;
    }
  }

  /**
   * Создание пользователей по умолчанию, если нет ни одного
   */
  async ensureDefaultUsers(): Promise<void> {
    const users = await this.getUsers();
    
    if (users.length === 0) {
      // Используем пользователей из defaultUsers.ts
      for (const user of defaultUsers) {
        await this.apiService.post('/users', user);
      }
      console.log('[UserService] Created default users');
    }
  }
}
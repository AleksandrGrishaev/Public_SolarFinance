// src/stores/user/userStore.ts
import { defineStore } from 'pinia';
import { UserService } from './userService';
import type { User, UserSettings } from './types';

import { useCurrencyStore } from '../currency/currencyStore';

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null as User | null,
    isAuthenticated: false,
    authToken: null as string | null,
    isInitialized: false,
    loading: false,
    // Add users array to state to cache results
    users: [] as User[]
  }),
  
  getters: {
    // Сервис для работы с пользователями
    userService: () => new UserService(),
    
    // Получение имени пользователя
    username(): string {
      return this.currentUser?.name || 'Guest';
    },
    
    // Получение аватара пользователя
    avatar(): string | undefined {
      return this.currentUser?.avatar;
    },
    
    // Получение настроек пользователя
    userSettings(): UserSettings | null {
      return this.currentUser?.settings || null;
    }
  },
  
  actions: {
    /**
     * Инициализация хранилища пользователей
     */
    async init() {
      if (this.isInitialized) return;
      
      try {
        console.log('[UserStore] Initializing user store');
        
        // Создаем пользователей по умолчанию, если их нет
        await this.userService.ensureDefaultUsers();
        
        // Восстанавливаем токен аутентификации
        const token = this.userService.getAuthToken();
        if (token) {
          this.authToken = token;
          
          // Восстанавливаем пользователя из localStorage
          const user = this.userService.getCurrentUser();
          if (user) {
            console.log('[UserStore] Restored user from localStorage:', user.name);
            this.currentUser = user;
            this.isAuthenticated = true;
          }
        }
        
        // Load all users into state
        this.users = await this.userService.getUsers();
        
        this.isInitialized = true;
        return this.isAuthenticated;
      } catch (error) {
        console.error('[UserStore] Initialization error:', error);
        return false;
      }
    },
    
    /**
     * Валидация PIN-кода и получение пользователя
     */
    async validatePin(pin: string): Promise<User | null> {
      this.loading = true;
      try {
        console.log('[UserStore] Validating PIN');
        const user = await this.userService.getUserByPin(pin);
        
        if (user) {
          console.log('[UserStore] PIN valid for user:', user.name);
        } else {
          console.log('[UserStore] Invalid PIN');
        }
        
        return user;
      } catch (error) {
        console.error('[UserStore] PIN validation error:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Установка текущего пользователя
     */
    setUser(user: User): void {
      this.currentUser = user;
      this.isAuthenticated = true;
      this.userService.saveCurrentUser(user);
      
      console.log('[UserStore] User set:', user.name);
    },
    
    /**
     * Установка токена аутентификации
     */
    setToken(token: string): void {
      this.authToken = token;
      this.userService.saveAuthToken(token);
      
      console.log('[UserStore] Auth token set');
    },
    
    /**
     * Обновление настроек пользователя
     */
    updateUserSettings(settings: Partial<UserSettings>): void {
      if (!this.currentUser) return;
      
      if (!this.currentUser.settings) {
        this.currentUser.settings = {
          theme: 'system',
          language: 'en',
          ...settings
        };
      } else {
        this.currentUser.settings = {
          ...this.currentUser.settings,
          ...settings
        };
      }
      
      this.currentUser.updatedAt = new Date();
      this.userService.saveCurrentUser(this.currentUser);
      
      console.log('[UserStore] User settings updated');
    },
    
    /**
     * Выход из системы
     */
    logout(): void {
      console.log('[UserStore] Logging out user:', this.currentUser?.name);
      
      this.currentUser = null;
      this.isAuthenticated = false;
      this.authToken = null;
      
      // Очищаем данные в localStorage
      this.userService.clearCurrentUser();
      this.userService.clearAuthToken();
      
      console.log('[UserStore] User logged out, session data cleared');
    },
    
    /**
     * Обновление базовой валюты пользователя
     */
    async updateUserBaseCurrency(currencyCode: string): Promise<boolean> {
      if (!this.currentUser) return false;
      
      // Проверяем, существует ли такая валюта
      const currencyStore = useCurrencyStore();
      const currency = currencyStore.getCurrency(currencyCode);
      
      if (!currency) {
        console.warn(`[UserStore] Currency not found: ${currencyCode}`);
        return false;
      }
      
      // Обновляем настройки пользователя
      this.updateUserSettings({
        baseCurrency: currencyCode
      });
      
      // Сохраняем изменения в базе данных
      return await this.userService.updateUser(this.currentUser.id, {
        settings: this.currentUser.settings
      });
    },

    /**
 * Обновление цвета пользователя
 */
async updateUserColor(color: string): Promise<boolean> {
  if (!this.currentUser) return false;
  
  // Обновляем настройки пользователя
  this.updateUserSettings({
    color: color
  });
  
  // Сохраняем изменения в базе данных
  return await this.userService.updateUser(this.currentUser.id, {
    settings: this.currentUser.settings
  });
},
    
    /**
     * Получение всех пользователей
     * Fixed to ensure it always returns an array
     */
    getAllUsers(): User[] {
      if (this.users.length === 0) {
        // If users aren't loaded yet, try to load them
        this.userService.getUsers().then(users => {
          this.users = users;
        }).catch(error => {
          console.error('[UserStore] Error loading users:', error);
        });
      }
      return this.users;
    },
    
    /**
     * Добавление нового пользователя
     */
    async addUser(newUser: Omit<User, 'id'>): Promise<User> {
      const user = await this.userService.addUser(newUser);
      // Update the local users array
      this.users.push(user);
      return user;
    },
    
    /**
     * Обновление пользователя
     */
    async updateUser(id: string, userData: Partial<User>): Promise<boolean> {
      const success = await this.userService.updateUser(id, userData);
      if (success) {
        // Update the local users array
        const index = this.users.findIndex(user => user.id === id);
        if (index !== -1) {
          this.users[index] = { ...this.users[index], ...userData };
        }
      }
      return success;
    },
    
    /**
     * Удаление пользователя
     */
    async deleteUser(id: string): Promise<boolean> {
      const success = await this.userService.deleteUser(id);
      if (success) {
        // Update the local users array
        this.users = this.users.filter(user => user.id !== id);
      }
      return success;
    },
    
    /**
     * Refresh users from storage
     */
    async refreshUsers(): Promise<void> {
      try {
        const users = await this.userService.getUsers();
        this.users = users;
      } catch (error) {
        console.error('[UserStore] Error refreshing users:', error);
      }
    }
  }
});
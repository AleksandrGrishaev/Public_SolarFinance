// src/stores/user/userStore.ts
import { defineStore } from 'pinia';
import { UserService } from './userService';
import type { User, UserSettings } from './types';

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null as User | null,
    isAuthenticated: false,
    authToken: null as string | null,
    isInitialized: false
  }),
  
  getters: {
    // Сервис для работы с пользователями
    userService: () => new UserService(),
    
    // Проверка, является ли пользователь администратором
    isAdmin(): boolean {
      return this.currentUser?.roles.includes('admin') || false;
    },
    
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
        
        this.isInitialized = true;
      } catch (error) {
        console.error('[UserStore] Initialization error:', error);
      }
    },
    
    /**
     * Валидация PIN-кода и получение пользователя
     */
    async validatePin(pin: string): Promise<User | null> {
      return await this.userService.getUserByPin(pin);
    },
    
    /**
     * Установка текущего пользователя
     */
    setUser(user: User): void {
      this.currentUser = user;
      this.isAuthenticated = true;
      this.userService.saveCurrentUser(user);
    },
    
    /**
     * Установка токена аутентификации
     */
    setToken(token: string): void {
      this.authToken = token;
      this.userService.saveAuthToken(token);
    },
    
    /**
     * Обновление настроек пользователя
     */
    updateUserSettings(settings: Partial<UserSettings>): void {
      if (!this.currentUser) return;
      
      this.currentUser.settings = {
        ...this.currentUser.settings,
        ...settings
      };
      
      this.currentUser.updatedAt = new Date();
      this.userService.saveCurrentUser(this.currentUser);
    },
    
    /**
     * Выход из системы
     */
    logout(): void {
      this.currentUser = null;
      this.isAuthenticated = false;
      this.authToken = null;
      
      // Очищаем данные в localStorage
      this.userService.clearCurrentUser();
      this.userService.clearAuthToken();
      
      console.log('[UserStore] User logged out');
    }
  }
});